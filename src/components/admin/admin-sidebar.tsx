"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import type { MenuNode } from "@/modules/rbac/domain/menu";

type IconCmp = React.ComponentType<{ className?: string }>;

function getIcon(name: string | null): IconCmp | null {
  if (!name) return null;
  const all = LucideIcons as unknown as Record<string, IconCmp>;
  return all[name] ?? null;
}

/** 后台侧边栏:菜单完全由 Permission(type=menu) 动态生成 */
export function AdminSidebar({
  menu,
  username,
}: {
  menu: MenuNode[];
  username: string;
}) {
  const pathname = usePathname();
  return (
    <aside className="flex w-60 flex-col border-r bg-card">
      <div className="border-b p-4 font-bold">商城后台</div>
      <nav className="flex-1 space-y-1 overflow-auto p-2">
        {menu.map((item) => (
          <SidebarItem key={item.id} item={item} pathname={pathname} />
        ))}
      </nav>
      <div className="border-t p-3 text-xs text-muted-foreground">
        {username}
      </div>
    </aside>
  );
}

function SidebarItem({
  item,
  pathname,
}: {
  item: MenuNode;
  pathname: string;
}) {
  const Icon = getIcon(item.icon);
  const active =
    !!item.path &&
    (pathname === item.path || pathname.startsWith(item.path + "/"));

  if (item.children.length > 0) {
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground">
          {Icon && <Icon className="h-4 w-4" />}
          {item.name}
        </div>
        <div className="ml-2 space-y-1 border-l pl-2">
          {item.children.map((c) => {
            const CIcon = getIcon(c.icon);
            const cActive = !!c.path && pathname === c.path;
            return (
              <Link
                key={c.id}
                href={c.path ?? "#"}
                className={cn(
                  "block rounded px-3 py-1.5 text-sm",
                  cActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent",
                )}
              >
                {CIcon && <CIcon className="mr-1 inline h-4 w-4" />}
                {c.name}
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <Link
      href={item.path ?? "#"}
      className={cn(
        "flex items-center gap-2 rounded px-3 py-2 text-sm",
        active
          ? "bg-primary text-primary-foreground"
          : "hover:bg-accent",
      )}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {item.name}
    </Link>
  );
}
