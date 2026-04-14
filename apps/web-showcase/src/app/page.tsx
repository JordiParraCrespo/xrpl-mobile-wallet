import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@flama/design-system-web/breadcrumb";
import { Button } from "@flama/design-system-web/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@flama/design-system-web/card";
import { Separator } from "@flama/design-system-web/separator";
import { SidebarTrigger } from "@flama/design-system-web/sidebar";
import { BlocksIcon, ComponentIcon, FlameIcon } from "lucide-react";

export default function Page() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-vertical:h-4 data-vertical:self-auto"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Home</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center gap-8 p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <FlameIcon className="size-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Flama Showcase</h1>
          <p className="max-w-md text-muted-foreground">
            Browse the design system components and pre-built blocks that power
            the Flama platform.
          </p>
        </div>
        <div className="grid w-full max-w-2xl gap-4 md:grid-cols-2">
          <a href="/components">
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ComponentIcon className="size-5 text-muted-foreground" />
                  <CardTitle>Components</CardTitle>
                </div>
                <CardDescription>
                  Individual UI primitives — buttons, inputs, cards, badges, and
                  more.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" size="sm">
                  Browse components
                </Button>
              </CardContent>
            </Card>
          </a>
          <a href="/blocks">
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BlocksIcon className="size-5 text-muted-foreground" />
                  <CardTitle>Blocks</CardTitle>
                </div>
                <CardDescription>
                  Ready-made compositions — login forms, dashboards, and
                  layouts.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" size="sm">
                  Browse blocks
                </Button>
              </CardContent>
            </Card>
          </a>
        </div>
      </div>
    </>
  );
}
