// src/layouts/admin/AdminSidebar.tsx
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboardIcon,
  CalendarDaysIcon,
  UsersIcon,
  ClipboardListIcon,
  PackageIcon,
  LineChartIcon,
  HelpCircleIcon,
  LogOutIcon,
  SunIcon,
  MoonIcon,
  ActivityIcon,
  BellIcon,
  SettingsIcon,
  MenuIcon,
  XIcon,
  ShieldIcon,
} from "lucide-react";
import { clearAuth } from "../../components/ProtectedRoute";

type ThemeMode = "light" | "dark";
const THEME_KEY = "theme";

const getInitialTheme = (): ThemeMode => {
  if (typeof window === "undefined") return "dark";
  const saved = localStorage.getItem(THEME_KEY) as ThemeMode | null;
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};
const applyTheme = (mode: ThemeMode) => {
  document.documentElement.classList.toggle("dark", mode === "dark");
};

const navItems = [
  { to: "/admin/dashboard",     label: "Dashboard",    Icon: LayoutDashboardIcon },
  { to: "/admin/clinic-setup",  label: "Clinic Setup", Icon: SettingsIcon        },
  { to: "/admin/appointments",  label: "Appointments", Icon: CalendarDaysIcon    },
  { to: "/admin/patients",      label: "Patients",     Icon: UsersIcon           },
  { to: "/admin/cases",         label: "Cases",        Icon: ClipboardListIcon   },
  { to: "/admin/case-tracking", label: "Tracking",     Icon: ActivityIcon        },
  { to: "/admin/inventory",     label: "Inventory",    Icon: PackageIcon         },
  { to: "/admin/revenue",       label: "Revenue",      Icon: LineChartIcon       },
  { to: "/admin/notifications", label: "Alerts",       Icon: BellIcon            },
  { to: "/admin/help",          label: "Help",         Icon: HelpCircleIcon      },
];

export const AdminSidebar: React.FC = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "Admin";
  const initials = userName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "AD";

  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialTheme);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => { applyTheme(themeMode); localStorage.setItem(THEME_KEY, themeMode); }, [themeMode]);

  const toggleTheme = () => setThemeMode((p) => (p === "dark" ? "light" : "dark"));
  const handleLogout = () => { clearAuth(); navigate("/login", { replace: true }); };

  /* Nav link class — indigo accent for admin */
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "flex items-center gap-2 px-3 py-2 text-[13px] font-medium rounded-xl transition-all duration-150 whitespace-nowrap",
      isActive
        ? "bg-indigo-500/18 text-indigo-300 border border-indigo-500/25 shadow-[0_0_0_1px_rgba(99,102,241,0.15),0_2px_10px_-4px_rgba(99,102,241,0.25)]"
        : "text-slate-400 hover:text-slate-100 hover:bg-white/6",
    ].join(" ");

  return (
    <header className="w-full sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-xl shadow-[0_1px_0_rgba(255,255,255,0.04)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">

          {/* ── BRAND ── */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-md">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600" />
              <div className="absolute inset-0 flex items-center justify-center">
                <ShieldIcon size={16} className="text-white" />
              </div>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[14px] font-bold tracking-tight text-slate-50">Admin Panel</span>
              <span className="text-[10px] text-slate-500 mt-0.5">Dental Clinic Intelligence</span>
            </div>
          </div>

          {/* ── DESKTOP NAV ── */}
          <nav className="hidden xl:flex items-center gap-0.5 overflow-x-auto py-1 no-scrollbar flex-1 justify-center px-4">
            {navItems.map(({ to, label, Icon }) => (
              <NavLink key={to} to={to} className={navLinkClass}>
                <Icon size={14} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          {/* ── RIGHT CONTROLS ── */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Theme toggle */}
            <button type="button" onClick={toggleTheme} title="Toggle theme"
              className="h-8 w-8 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition grid place-items-center">
              {themeMode === "dark" ? <SunIcon size={14} /> : <MoonIcon size={14} />}
            </button>

            {/* User badge */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-[10px] shrink-0">
                {initials}
              </div>
              <span className="text-[12px] font-semibold text-slate-200 max-w-[90px] truncate">{userName}</span>
            </div>

            {/* Logout */}
            <button type="button" onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-800 bg-slate-900 text-[12px] font-medium text-slate-400 hover:bg-rose-500/15 hover:text-rose-400 hover:border-rose-500/30 transition">
              <LogOutIcon size={13} />
              <span className="hidden sm:inline">Logout</span>
            </button>

            {/* Hamburger */}
            <button type="button" onClick={() => setMobileMenuOpen((v) => !v)}
              className="xl:hidden h-8 w-8 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-100 transition grid place-items-center">
              {mobileMenuOpen ? <XIcon size={16} /> : <MenuIcon size={16} />}
            </button>
          </div>
        </div>

        {/* ── MOBILE DROPDOWN ── */}
        {mobileMenuOpen && (
          <nav className="xl:hidden border-t border-slate-800/80 py-3 grid grid-cols-2 sm:grid-cols-3 gap-1.5 animate-fade-in">
            {navItems.map(({ to, label, Icon }) => (
              <NavLink key={to} to={to} onClick={() => setMobileMenuOpen(false)} className={navLinkClass}>
                <Icon size={14} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};
