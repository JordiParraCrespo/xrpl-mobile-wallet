import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@flama/design-system-web/breadcrumb";
import { Button } from "@flama/design-system-web/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@flama/design-system-web/card";
import { Input } from "@flama/design-system-web/input";
import { Label } from "@flama/design-system-web/label";
import { Separator } from "@flama/design-system-web/separator";
import { SidebarTrigger } from "@flama/design-system-web/sidebar";

export default function BlocksPage() {
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
                <BreadcrumbPage>Blocks</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-8 p-4 pt-0">
        <h1 className="text-2xl font-bold">Blocks</h1>
        <p className="text-muted-foreground">
          Pre-built compositions of components.
        </p>

        <section id="login" className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Login</h2>
          <div className="flex items-center justify-center py-8">
            <Card className="w-full max-w-sm">
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>
                  Enter your credentials to access your account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="hello@flama.dev"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-2">
                <Button className="w-full">Sign in</Button>
                <p className="text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <a
                    href="#"
                    className="underline underline-offset-4 hover:text-primary"
                  >
                    Sign up
                  </a>
                </p>
              </CardFooter>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
}
