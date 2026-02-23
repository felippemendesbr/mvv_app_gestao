"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Network,
  Users,
  ChevronRight,
  FileText,
  Music,
  Church,
  BookOpen,
  Video,
  Building2,
  GraduationCap,
  LogOut,
  UserCheck,
  Sun,
  Moon,
  UserCog,
  Baby,
  DoorOpen,
  Menu,
  X,
} from "lucide-react";
import { useAuth, isAdmin, isPastor } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

const navigationBase = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Aprovar Membros", href: "/admin/aprovar-membros", icon: UserCheck },
  { name: "Tipos de Usuário", href: "/admin/tipo-usuario", icon: UserCog, adminOnly: true },
  { name: "Tipos de Sala Infantil", href: "/admin/tipo-sala-infantil", icon: Baby, adminOnly: true },
  { name: "Salas Infantis", href: "/admin/sala-infantil", icon: DoorOpen, adminOnly: true },
  { name: "Cursos", href: "/admin/cursos", icon: GraduationCap },
  { name: "Eventos", href: "/admin/eventos", icon: Calendar },
  { name: "Redes", href: "/admin/redes", icon: Network },
  { name: "Membros", href: "/admin/membros", icon: Users },
  { name: "Edificando", href: "/admin/edificando", icon: Building2 },
  { name: "Vídeos", href: "/admin/videos", icon: Video },
  { name: "MVV Music", href: "/admin/mvv-music", icon: Music },
  { name: "Igrejas", href: "/admin/igrejas", icon: Church },
  { name: "Galera Santa", href: "/admin/galera-santa", icon: FileText },
  { name: "Encontro", href: "/admin/encontro", icon: BookOpen },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { usuario, isAuthenticated, isLoading, logout, canEdit } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = navigationBase.filter((item) => {
    const tipo = usuario?.tipoUsuario ?? "";
    if (item.href === "/admin/aprovar-membros") {
      return isAdmin(tipo) || isPastor(tipo);
    }
    if ("adminOnly" in item && item.adminOnly) {
      return isAdmin(tipo);
    }
    return true;
  });

  const isWriteRoute = pathname && (
    pathname.endsWith("/novo") ||
    /\/admin\/[^/]+\/\d+$/.test(pathname)
  );

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
      return;
    }
    const tipo = usuario?.tipoUsuario ?? "";
    if (pathname?.startsWith("/admin/tipo-usuario") || pathname?.startsWith("/admin/tipo-sala-infantil") || pathname?.startsWith("/admin/sala-infantil")) {
      if (!isAdmin(tipo)) {
        router.replace("/admin");
        return;
      }
    }
    if (isAuthenticated && !canEdit && isWriteRoute) {
      const base = pathname?.replace(/\/(novo|\d+)$/, "") || "/admin";
      router.replace(base);
    }
  }, [isLoading, isAuthenticated, canEdit, isWriteRoute, pathname, router, usuario]);

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBF9F5]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#A47C3B] border-r-transparent" />
          <p className="mt-4 text-[#242D3F]/80 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[var(--background)]">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 bg-[var(--card)] border-r border-[var(--border)] flex-col shrink-0">
        {/* Logo/Header */}
        <div className="h-16 flex items-center px-6 border-b border-[var(--border)]">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
          >
            <div className="w-8 h-8 bg-[#083262] dark:bg-[#6B9BD1] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">MVV</span>
            </div>
            <span className="font-bold text-lg">Gestão</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-semibold transition-all
                  ${
                    active
                      ? "bg-[var(--muted)] text-[#083262] dark:text-[#6B9BD1]"
                      : "text-[var(--foreground)] hover:bg-[var(--muted)]/50 hover:text-[#083262] dark:hover:text-[#6B9BD1]"
                  }
                `}
              >
                <item.icon className={`h-5 w-5 shrink-0 ${active ? "text-[#083262] dark:text-[#6B9BD1]" : "text-[var(--foreground)]"}`} />
                <span className="flex-1">{item.name}</span>
                {active && (
                  <ChevronRight className="h-4 w-4 text-[#083262] dark:text-[#6B9BD1]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border)]">
          <div className="text-xs text-[var(--foreground)]/60 text-center">
            Sistema MVV © 2026
          </div>
        </div>
      </aside>

      {/* Mobile sidebar (drawer) */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-opacity ${
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setSidebarOpen(false)}
        />
        {/* Drawer panel */}
        <aside
          className={`relative h-full w-64 bg-[var(--card)] border-r border-[var(--border)] flex flex-col transform transition-transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--border)]">
            <Link
              href="/admin"
              className="flex items-center gap-2 text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <div className="w-8 h-8 bg-[#083262] dark:bg-[#6B9BD1] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">MVV</span>
              </div>
              <span className="font-bold text-lg">Gestão</span>
            </Link>
            <button
              className="p-2 rounded-full text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
              onClick={() => setSidebarOpen(false)}
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-semibold transition-all
                    ${
                      active
                        ? "bg-[var(--muted)] text-[#083262] dark:text-[#6B9BD1]"
                        : "text-[var(--foreground)] hover:bg-[var(--muted)]/50 hover:text-[#083262] dark:hover:text-[#6B9BD1]"
                    }
                  `}
                >
                  <item.icon
                    className={`h-5 w-5 shrink-0 ${
                      active ? "text-[#083262] dark:text-[#6B9BD1]" : "text-[var(--foreground)]"
                    }`}
                  />
                  <span className="flex-1">{item.name}</span>
                  {active && (
                    <ChevronRight className="h-4 w-4 text-[#083262] dark:text-[#6B9BD1]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </aside>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-[var(--border)] bg-[var(--card)] shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-full text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <p className="text-sm sm:text-base font-semibold text-[var(--foreground)] truncate">
              Bem vindo(a),{" "}
              <span className="text-[var(--primary)]">
                {usuario?.nomeCompleto ?? "Usuário"}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
              title={theme === "light" ? "Modo escuro" : "Modo claro"}
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={logout}
              className="p-2.5 rounded-full text-[var(--foreground)] hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors"
              title="Sair"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-[var(--background)]">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
