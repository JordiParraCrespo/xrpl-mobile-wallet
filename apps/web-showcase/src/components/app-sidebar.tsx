"use client";

import * as React from "react";
import { BlocksIcon, ComponentIcon, FlameIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@flama/design-system-web/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@flama/design-system-web/collapsible";
import { ChevronRightIcon } from "lucide-react";

const nav = [
  {
    title: "Components",
    url: "/components",
    icon: <ComponentIcon className="size-4" />,
    isActive: true,
    items: [
      { title: "Button", url: "/components#button" },
      { title: "Input", url: "/components#input" },
      { title: "Card", url: "/components#card" },
      { title: "Badge", url: "/components#badge" },
      { title: "Alert", url: "/components#alert" },
      { title: "Avatar", url: "/components#avatar" },
      { title: "Checkbox", url: "/components#checkbox" },
      { title: "Switch", url: "/components#switch" },
      { title: "Separator", url: "/components#separator" },
      { title: "Tabs", url: "/components#tabs" },
      { title: "Toggle", url: "/components#toggle" },
      { title: "Skeleton", url: "/components#skeleton" },
    ],
  },
  {
    title: "Blocks",
    url: "/blocks",
    icon: <BlocksIcon className="size-4" />,
    items: [{ title: "Login", url: "/blocks#login" }],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<a href="/" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <FlameIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Flama</span>
                <span className="truncate text-xs text-muted-foreground">
                  Showcase
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Browse</SidebarGroupLabel>
          <SidebarMenu>
            {nav.map((item) => (
              <Collapsible
                key={item.title}
                defaultOpen={item.isActive}
                className="group/collapsible"
                render={<SidebarMenuItem />}
              >
                <CollapsibleTrigger
                  render={<SidebarMenuButton tooltip={item.title} />}
                >
                  {item.icon}
                  <span>{item.title}</span>
                  <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton render={<a href={subItem.url} />}>
                          <span>{subItem.title}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
