"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Target, Briefcase, FolderOpen, Wrench, CheckSquare, StickyNote } from "lucide-react";

const LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/notes", label: "Notes", icon: StickyNote },
  { href: "/pitches", label: "Pitches", icon: Target },
  { href: "/services", label: "Services", icon: Wrench },
  { href: "/portfolio", label: "Portfolio", icon: FolderOpen },
];

export default function Nav() {
  const path = usePathname();
  return (
    <header className="bg-white border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Briefcase size={16} className="text-white" />
          </div>
          <span className="font-bold text-gray-900 text-lg">Consultancy</span>
        </div>
        <nav className="flex items-center gap-1">
          {LINKS.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? path === "/" : path.startsWith(href);
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-100"
                }`}>
                <Icon size={14} /> {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
