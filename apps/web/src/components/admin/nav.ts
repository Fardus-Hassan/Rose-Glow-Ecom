import type { LucideIcon } from "lucide-react";
import {
  FolderTree,
  Images,
  Inbox,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import { sectionSchemas } from "@/lib/cms/schema";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badgeKey?: "unread";
};

export type NavGroup = { title: string; items: NavItem[] };

export const navGroups: NavGroup[] = [
  {
    title: "",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/messages", label: "Messages", icon: Inbox, badgeKey: "unread" },
      { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
    ],
  },
  {
    title: "Commerce",
    items: [
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/categories", label: "Categories", icon: FolderTree },
      { href: "/admin/reviews", label: "Reviews", icon: Star },
    ],
  },
  {
    title: "Pages",
    items: sectionSchemas
      .filter((s) => s.group === "Pages")
      .map((s) => ({
        href: `/admin/sections/${s.key}`,
        label: s.label,
        icon: s.icon,
      })),
  },
  {
    title: "Site settings",
    items: sectionSchemas
      .filter((s) => s.group === "Site settings")
      .map((s) => ({
        href: `/admin/sections/${s.key}`,
        label: s.label,
        icon: s.icon,
      })),
  },
  {
    title: "Library",
    items: [
      { href: "/admin/media", label: "Media library", icon: Images },
      { href: "/admin/subscribers", label: "Subscribers", icon: Users },
      { href: "/admin/recycle-bin", label: "Recycle bin", icon: Trash2 },
    ],
  },
];
