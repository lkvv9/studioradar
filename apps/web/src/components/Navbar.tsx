"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Radio, MapPin, Users, LayoutDashboard, LogOut, Menu, X, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";
import type { User } from "@supabase/supabase-js";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setUser(s?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  const links = [
    { href: "/map",      label: "Radar",     icon: MapPin },
    { href: "/studios",  label: "Studios",   icon: Radio },
    { href: "/match",    label: "Match",     icon: Users },
    ...(user ? [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }] : []),
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-radar-dark/90 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center group-hover:bg-brand-500 transition-colors">
              <Radio className="w-4 h-4 text-white" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-radar-green rounded-full animate-pulse" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Studio<span className="text-brand-400">Radar</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                pathname?.startsWith(href)
                  ? "bg-brand-600/20 text-brand-400"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </div>

        {/* Auth */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-700 flex items-center justify-center text-sm font-bold text-white select-none">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={signOut}
                className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/80 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm text-white/70 hover:text-white transition-colors">
                Connexion
              </Link>
              <Link
                href="/auth/register"
                className="text-sm bg-brand-600 hover:bg-brand-500 px-4 py-2 rounded-full transition-colors font-medium"
              >
                S'inscrire
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-white/60 hover:text-white transition-colors" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-radar-card border-t border-white/5 px-4 py-3 flex flex-col gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                pathname?.startsWith(href) ? "bg-brand-600/20 text-brand-400" : "text-white/60 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
          <div className="border-t border-white/5 mt-1 pt-1">
            {user ? (
              <button
                onClick={() => { setOpen(false); signOut(); }}
                className="flex items-center gap-3 px-4 py-3 text-sm text-white/50 hover:text-white w-full transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            ) : (
              <Link href="/auth/login" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-white/60 hover:text-white">
                Connexion
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
