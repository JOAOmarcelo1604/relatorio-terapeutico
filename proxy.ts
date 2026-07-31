import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { COOKIE_SESSAO, verificarToken } from "@/lib/session"

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get(COOKIE_SESSAO)?.value
  const sessao = token ? await verificarToken(token) : null
  const naTelaLogin = pathname === "/login"

  if (!sessao && !naTelaLogin) {
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  if (sessao && naTelaLogin) {
    const url = req.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  // Protege tudo, exceto assets estáticos e imagens públicas.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
