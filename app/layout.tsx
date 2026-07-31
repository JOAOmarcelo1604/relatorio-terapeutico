import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import { Inter, Nunito } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { SiteHeader } from "@/components/site-header"
import { getSessao } from "@/lib/auth"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" })

export const metadata: Metadata = {
  title: "Feedbacks Terapêuticos",
  description:
    "Registre e organize os feedbacks diários de evolução dos pacientes e gere o texto pronto para enviar aos pais.",
  generator: "v0.app",
}

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f3f7f4",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const sessao = await getSessao()
  return (
    <html lang="pt-BR" className={`light ${inter.variable} ${nunito.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <SiteHeader nome={sessao?.nome} />
        <main className="mx-auto w-full max-w-3xl px-4 pb-24 pt-6">{children}</main>
        <Toaster position="top-center" richColors />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
