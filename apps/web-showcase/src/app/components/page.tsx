import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@flama/design-system-web/breadcrumb";
import { Separator } from "@flama/design-system-web/separator";
import { SidebarTrigger } from "@flama/design-system-web/sidebar";
import { Button } from "@flama/design-system-web/button";
import { Input } from "@flama/design-system-web/input";
import { Label } from "@flama/design-system-web/label";
import { Badge } from "@flama/design-system-web/badge";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@flama/design-system-web/alert";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@flama/design-system-web/avatar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@flama/design-system-web/card";
import { Checkbox } from "@flama/design-system-web/checkbox";
import { Switch } from "@flama/design-system-web/switch";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@flama/design-system-web/tabs";
import { Toggle } from "@flama/design-system-web/toggle";
import { Skeleton } from "@flama/design-system-web/skeleton";
import {
  AlertCircleIcon,
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
} from "lucide-react";

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="space-y-4">
      <h2 className="text-xl font-semibold border-b pb-2">{title}</h2>
      <div className="flex flex-wrap items-start gap-4">{children}</div>
    </section>
  );
}

export default function ComponentsPage() {
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
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Components</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-8 p-4 pt-0">
        <h1 className="text-2xl font-bold">Components</h1>

        <Section id="button" title="Button">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button disabled>Disabled</Button>
        </Section>

        <Section id="input" title="Input">
          <div className="w-full max-w-sm space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="hello@flama.dev" />
          </div>
          <div className="w-full max-w-sm space-y-2">
            <Label htmlFor="disabled">Disabled</Label>
            <Input id="disabled" disabled placeholder="Disabled input" />
          </div>
        </Section>

        <Section id="card" title="Card">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>Card description goes here.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This is the card content area. You can put anything here.
              </p>
            </CardContent>
          </Card>
        </Section>

        <Section id="badge" title="Badge">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </Section>

        <Section id="alert" title="Alert">
          <Alert className="w-full max-w-lg">
            <AlertCircleIcon className="size-4" />
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>
              You can add components to your app using the cli.
            </AlertDescription>
          </Alert>
          <Alert variant="destructive" className="w-full max-w-lg">
            <AlertCircleIcon className="size-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Something went wrong. Please try again.
            </AlertDescription>
          </Alert>
        </Section>

        <Section id="avatar" title="Avatar">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="Avatar" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>FL</AvatarFallback>
          </Avatar>
        </Section>

        <Section id="checkbox" title="Checkbox">
          <div className="flex items-center gap-2">
            <Checkbox id="terms" />
            <Label htmlFor="terms">Accept terms and conditions</Label>
          </div>
        </Section>

        <Section id="switch" title="Switch">
          <div className="flex items-center gap-2">
            <Switch id="airplane" />
            <Label htmlFor="airplane">Airplane Mode</Label>
          </div>
        </Section>

        <Section id="separator" title="Separator">
          <div className="w-full max-w-lg space-y-2">
            <p className="text-sm">Above the separator</p>
            <Separator />
            <p className="text-sm">Below the separator</p>
          </div>
        </Section>

        <Section id="tabs" title="Tabs">
          <Tabs defaultValue="account" className="w-full max-w-lg">
            <TabsList>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
            </TabsList>
            <TabsContent value="account">
              <p className="text-sm text-muted-foreground p-4">
                Make changes to your account here.
              </p>
            </TabsContent>
            <TabsContent value="password">
              <p className="text-sm text-muted-foreground p-4">
                Change your password here.
              </p>
            </TabsContent>
          </Tabs>
        </Section>

        <Section id="toggle" title="Toggle">
          <Toggle aria-label="Toggle bold">
            <BoldIcon className="size-4" />
          </Toggle>
          <Toggle aria-label="Toggle italic">
            <ItalicIcon className="size-4" />
          </Toggle>
          <Toggle aria-label="Toggle underline">
            <UnderlineIcon className="size-4" />
          </Toggle>
        </Section>

        <Section id="skeleton" title="Skeleton">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        </Section>
      </div>
    </>
  );
}
