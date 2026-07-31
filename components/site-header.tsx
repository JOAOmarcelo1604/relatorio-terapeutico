"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ClipboardList,
  Users,
  UserCog,
  HeartHandshake,
  LogOut,
} from "lucide-react"
import { sair } from "@/lib/auth-actions"
import { cn } from "@/lib/utils"

const links = [
  { href: "/", label: "Feedbacks", icon: ClipboardList, adminOnly: false },
  { href: "/pacientes", label: "Pacientes", icon: Users, adminOnly: false },
  { href: "/terapeutas", label: "Terapeutas", icon: UserCog, adminOnly: true },
]

export function SiteHeader({
  nome,
  admin = false,
}: {
  nome?: string | null
  admin?: boolean
}) {
  const pathname = usePathname()
  const logada = Boolean(nome)
  const linksVisiveis = links.filter((l) => !l.adminOnly || admin)

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-soft transition-transform group-hover:scale-105">
            <HeartHandshake className="size-5" />
          </span>
          <span className="font-heading text-lg font-extrabold leading-tight tracking-tight text-foreground">
            <span className="text-gradient-brand">Feedbacks</span>
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Acompanhamento terapêutico
            </span>
          </span>
        </Link>

        {logada ? (
          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-1 rounded-2xl bg-muted/40 p-1">
              {linksVisiveis.map(({ href, label, icon: Icon }) => {
                const active =
                  href === "/" ? pathname === "/" : pathname.startsWith(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-all",
                      active
                        ? "bg-card text-primary shadow-soft"
                        : "text-muted-foreground hover:bg-card/60 hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4" />
                    <span className="hidden sm:inline">{label}</span>
                  </Link>
                )
              })}
            </nav>

            <form action={sair}>
              <button
                type="submit"
                title={`Sair (${nome})`}
                aria-label="Sair"
                className="flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="size-4" />
                <span className="hidden md:inline">Sair</span>
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </header>
  )
}
