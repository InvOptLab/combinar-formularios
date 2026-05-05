"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  Users,
  BookOpen,
  FileSearch,
  Download,
  Database,
  ListOrdered,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Importação",
    href: "/importacao",
    icon: Upload,
  },
];

const dataItems = [
  {
    title: "Docentes",
    href: "/docentes",
    icon: Users,
  },
  {
    title: "Disciplinas",
    href: "/disciplinas",
    icon: BookOpen,
  },
  {
    title: "Prioridades",
    href: "/prioridades",
    icon: ListOrdered,
  },
  {
    title: "Cruzamentos",
    href: "/cruzamentos",
    icon: FileSearch,
  },
];

const exportItems = [
  {
    title: "Exportação",
    href: "/exportacao",
    icon: Download,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold">ETL Manager</h1>
            <p className="text-xs text-muted-foreground">
              Distribuidor de Carga
            </p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      pathname === item.href &&
                        "bg-accent text-accent-foreground",
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Gestão de Dados</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {dataItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      pathname === item.href &&
                        "bg-accent text-accent-foreground",
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Exportação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {exportItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      pathname === item.href &&
                        "bg-accent text-accent-foreground",
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <p className="text-xs text-muted-foreground text-center">
          v3.0 • Sistema ETL
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
