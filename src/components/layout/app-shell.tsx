"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import clsx from "clsx";
import Image from "next/image";

const navigation = [
  { name: "Projects", href: "/projects" },
  { name: "Clients", href: "/clients" },
  { name: "Files", href: "/files" }
];

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="flex max-h-screen min-h-screen overflow-hidden bg-gray-950">
      <aside className="hidden w-64 flex-shrink-0 border-r border-gray-800 bg-gray-950 p-6 md:flex md:flex-col md:gap-8">
        <Link href="/" className="flex justify-center gap-2 text-2xl font-bold text-brand">
          <Image src="/images/entipedia-white.png" alt="Entipedia" width={170} height={170} />
        </Link>
        <nav className="flex flex-1 flex-col gap-2 items-start">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "rounded-lg px-3 py-2 text-lg font-medium transition-colors w-full",
                  isActive
                    ? "bg-gold text-gold-foreground shadow-sm"
                    : "text-gold hover:bg-gold hover:text-gold-foreground"
                )}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="text-xs text-slate-400">
          © {new Date().getFullYear()} Entipedia. Built with Next.js, Drizzle and AWS.
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-800 bg-gray-950 px-6 py-4 shadow-sm gap-4">
          <Link href="/" className="justify-center gap-2 text-2xl font-bold flex md:hidden">
            <Image src="/images/entipedia-white.png" alt="Entipedia" width={170} height={170} />
          </Link>
          <div className="flex-1 text-sm text-slate-500 md:text-right">
            Internal management platform for Entipedia
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6 scrollbar-thin h-full">{children}</main>
      </div>
    </div>
  );
}

