import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SPEC_PATH = resolve(ROOT, "openapi.json");
const SRC_DIR = resolve(ROOT, "src");
const CLIENTS_DIR = resolve(SRC_DIR, "clients");
const MODELS_DIR = resolve(SRC_DIR, "models");

// --- Types ---

interface OpenApiParameter {
  name: string;
  in: "path" | "query" | "header";
  required?: boolean;
  schema?: { type?: string; enum?: string[] };
}

interface OpenApiOperation {
  operationId: string;
  tags?: string[];
  summary?: string;
  parameters?: OpenApiParameter[];
  requestBody?: {
    required?: boolean;
    content?: { "application/json"?: { schema?: SchemaRef } };
  };
  responses?: Record<
    string,
    { content?: { "application/json"?: { schema?: SchemaRef } } }
  >;
  security?: Record<string, string[]>[];
}

interface SchemaRef {
  $ref?: string;
  type?: string;
  properties?: Record<string, SchemaRef>;
  required?: string[];
  items?: SchemaRef;
  enum?: string[];
  format?: string;
  additionalProperties?: boolean | SchemaRef;
  nullable?: boolean;
}

interface OpenApiSpec {
  paths: Record<string, Record<string, OpenApiOperation>>;
  components?: {
    schemas?: Record<string, SchemaRef>;
  };
}

interface OperationInfo {
  operationId: string;
  method: string;
  path: string;
  summary?: string;
  pathParams: OpenApiParameter[];
  queryParams: OpenApiParameter[];
  hasRequestBody: boolean;
  requestBodyRef: string | null;
  responseRef: string | null;
  hasAuth: boolean;
}

// --- Helpers ---

const HTTP_METHODS = new Set(["get", "post", "put", "patch", "delete"]);
const SKIP_TAGS = new Set(["Health"]);

function kebab(s: string): string {
  return s.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

function pascal(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function refName(ref: string): string {
  return ref.split("/").pop()!;
}

function resolveRef(schema: SchemaRef | undefined): string | null {
  if (!schema) return null;
  if (schema.$ref) return refName(schema.$ref);
  return null;
}

function tsType(schema: SchemaRef, schemas: Record<string, SchemaRef>): string {
  if (schema.$ref) {
    return refName(schema.$ref);
  }
  if (schema.enum) {
    return schema.enum.map((v) => `"${v}"`).join(" | ");
  }
  switch (schema.type) {
    case "string":
      return "string";
    case "number":
    case "integer":
      return "number";
    case "boolean":
      return "boolean";
    case "array":
      return schema.items ? `${tsType(schema.items, schemas)}[]` : "unknown[]";
    case "object": {
      if (schema.properties) {
        const props = Object.entries(schema.properties).map(([key, val]) => {
          const optional = !schema.required?.includes(key);
          return `  ${key}${optional ? "?" : ""}: ${tsType(val, schemas)};`;
        });
        return `{\n${props.join("\n")}\n}`;
      }
      if (
        schema.additionalProperties &&
        typeof schema.additionalProperties === "object"
      ) {
        return `Record<string, ${tsType(schema.additionalProperties, schemas)}>`;
      }
      return "Record<string, unknown>";
    }
    default:
      return "unknown";
  }
}

// --- Spec Parsing ---

function parseOperations(spec: OpenApiSpec): Map<string, OperationInfo[]> {
  const groups = new Map<string, OperationInfo[]>();

  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const [method, op] of Object.entries(methods)) {
      if (!HTTP_METHODS.has(method)) continue;

      const tags = op.tags ?? ["Default"];
      const tag = tags[0];
      if (SKIP_TAGS.has(tag)) continue;

      const pathParams = (op.parameters ?? []).filter((p) => p.in === "path");
      const queryParams = (op.parameters ?? []).filter((p) => p.in === "query");

      const bodySchema = op.requestBody?.content?.["application/json"]?.schema;
      const bodyRef = resolveRef(bodySchema);
      const requestBodyRef = bodyRef === "Function" ? null : bodyRef;

      let responseRef: string | null = null;
      const successCodes = ["200", "201"];
      for (const code of successCodes) {
        const resp = op.responses?.[code];
        if (resp?.content?.["application/json"]?.schema) {
          responseRef = resolveRef(resp.content["application/json"].schema);
          break;
        }
      }

      const info: OperationInfo = {
        operationId: op.operationId,
        method: method.toUpperCase(),
        path,
        summary: op.summary,
        pathParams,
        queryParams,
        hasRequestBody: !!op.requestBody,
        requestBodyRef,
        responseRef,
        hasAuth: !!op.security?.length,
      };

      if (!groups.has(tag)) groups.set(tag, []);
      groups.get(tag)!.push(info);
    }
  }

  return groups;
}

// --- Code Generation ---

function generateModels(schemas: Record<string, SchemaRef>): string {
  const lines: string[] = [
    "// Auto-generated — do not edit manually.",
    "// Run `pnpm generate` to regenerate.",
    "",
  ];

  for (const [name, schema] of Object.entries(schemas)) {
    if (name === "Function") continue;

    lines.push(`export interface ${name} ${tsType(schema, schemas)}`);
    lines.push("");
  }

  return lines.join("\n");
}

function generateClientClass(tag: string, operations: OperationInfo[]): string {
  const className = `${pascal(tag)}Client`;
  const imports = new Set<string>();
  const methodLines: string[] = [];

  for (const op of operations) {
    if (op.requestBodyRef) imports.add(op.requestBodyRef);
    if (op.responseRef) imports.add(op.responseRef);

    const params: string[] = [];
    for (const p of op.pathParams) {
      params.push(`${p.name}: string`);
    }
    if (op.queryParams.length > 0) {
      const queryProps = op.queryParams
        .map((p) => `${p.name}${p.required ? "" : "?"}: string`)
        .join("; ");
      params.push(`query?: { ${queryProps} }`);
    }
    if (op.hasRequestBody) {
      const bodyType = op.requestBodyRef ?? "Record<string, unknown>";
      params.push(`body: ${bodyType}`);
    }

    const returnType = op.responseRef ?? "void";
    const isVoid = !op.responseRef;
    const paramsStr = params.join(", ");

    // Build fetch options
    const fetchOpts: string[] = [];
    if (op.pathParams.length > 0) {
      const pathObj = op.pathParams.map((p) => p.name).join(", ");
      fetchOpts.push(
        `params: { path: { ${pathObj} }${op.queryParams.length > 0 ? ", query" : ""} }`,
      );
    } else if (op.queryParams.length > 0) {
      fetchOpts.push("params: { query }");
    }
    if (op.hasRequestBody) {
      fetchOpts.push(op.requestBodyRef ? "body" : "body: body as never");
    }

    const optsArg =
      fetchOpts.length > 0
        ? `, {\n        ${fetchOpts.join(",\n        ")},\n      }`
        : "";
    const comment = op.summary ? `  /** ${op.summary} */\n` : "";

    if (isVoid) {
      methodLines.push(`${comment}  async ${op.operationId}(${paramsStr}): Promise<void> {
    await this.client.${op.method}("${op.path}"${optsArg});
  }`);
    } else {
      methodLines.push(`${comment}  async ${op.operationId}(${paramsStr}): Promise<${returnType}> {
    const { data } = await this.client.${op.method}("${op.path}"${optsArg});
    return data!;
  }`);
    }
  }

  const importList = [...imports].sort();
  const modelImports =
    importList.length > 0
      ? `import type { ${importList.join(", ")} } from "../models";\n`
      : "";

  return `// Auto-generated — do not edit manually.
// Run \`pnpm generate\` to regenerate.

import createClient from "openapi-fetch";
import type { paths } from "../generated/api";
${modelImports}
type ${pascal(tag)}Paths = {
  [K in keyof paths as K extends \`${findCommonPrefix(operations.map((o) => o.path))}\${string}\` ? K : never]: paths[K];
};

export class ${className} {
  private readonly client: ReturnType<typeof createClient<${pascal(tag)}Paths>>;

  constructor(baseUrl: string) {
    this.client = createClient<${pascal(tag)}Paths>({ baseUrl });
  }

${methodLines.join("\n\n")}
}
`;
}

function findCommonPrefix(paths: string[]): string {
  if (paths.length === 0) return "";
  const segments = paths[0].split("/");
  let prefix = "";
  for (let i = 0; i < segments.length; i++) {
    const candidate = segments.slice(0, i + 1).join("/");
    if (paths.every((p) => p.startsWith(candidate + "/") || p === candidate)) {
      prefix = candidate;
    } else {
      break;
    }
  }
  return prefix;
}

function generateClientsBarrel(tags: string[]): string {
  const exports = tags
    .map(
      (tag) => `export { ${pascal(tag)}Client } from "./${kebab(tag)}.client";`,
    )
    .join("\n");

  return `// Auto-generated — do not edit manually.\n// Run \`pnpm generate\` to regenerate.\n\n${exports}\n`;
}

function generateRootIndex(tags: string[]): string {
  const clientExports = tags.map((tag) => `  ${pascal(tag)}Client,`).join("\n");

  return `// Auto-generated — do not edit manually.
// Run \`pnpm generate\` to regenerate.

export type { paths } from "./generated/api";
export * from "./models";
export {
${clientExports}
} from "./clients";
`;
}

// --- Main ---

const spec: OpenApiSpec = JSON.parse(readFileSync(SPEC_PATH, "utf-8"));
const groups = parseOperations(spec);
const schemas = spec.components?.schemas ?? {};

// Ensure output dirs exist
for (const dir of [CLIENTS_DIR, MODELS_DIR]) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

// Generate models
const modelsContent = generateModels(schemas);
writeFileSync(resolve(MODELS_DIR, "index.ts"), modelsContent);
console.log("  Generated models/index.ts");

// Generate client classes
const processedTags: string[] = [];

for (const [tag, operations] of groups) {
  processedTags.push(tag);

  const content = generateClientClass(tag, operations);
  const fileName = `${kebab(tag)}.client.ts`;
  writeFileSync(resolve(CLIENTS_DIR, fileName), content);
  console.log(`  Generated clients/${fileName}`);
}

// Generate barrels
writeFileSync(
  resolve(CLIENTS_DIR, "index.ts"),
  generateClientsBarrel(processedTags),
);
console.log("  Generated clients/index.ts");

writeFileSync(resolve(SRC_DIR, "index.ts"), generateRootIndex(processedTags));
console.log("  Generated src/index.ts");

console.log(
  `\nDone — ${processedTags.length} client(s) generated: ${processedTags.join(", ")}`,
);
