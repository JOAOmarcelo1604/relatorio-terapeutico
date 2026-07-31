"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ClipboardList, Users, HeartHandshake } from "lucide-react"
import { cn } from "@/lib/utils"

const links = [
  { href: "/", label: "Feedbacks", icon: ClipboardList },
  { href: "/pacientes", label: "Pacientes", icon: Users },
]

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <HeartHandshake className="size-5" />
          </span>
          <span className="font-heading text-lg font-bold leading-tight text-foreground">
            Feedbacks
            <span className="block text-xs font-medium text-muted-foreground">
              Acompanhamento terapêutico
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
