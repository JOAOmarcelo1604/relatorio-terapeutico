"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export function CopyText({ text }: { text: string }) {
  const [copiado, setCopiado] = useState(false)

  async function copiar() {
    try {
      await navigator.clipboard.writeText(text)
      setCopiado(true)
      toast.success("Texto copiado! É só colar no WhatsApp ou e-mail.")
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      toast.error("Não foi possível copiar automaticamente. Selecione e copie manualmente.")
    }
  }

  return (
    <div className="space-y-3">
      <Button onClick={copiar} className="w-full sm:w-auto">
        {copiado ? <Check className="size-4" /> : <Copy className="size-4" />}
        {copiado ? "Copiado!" : "Copiar texto"}
      </Button>
      <pre className="whitespace-pre-wrap rounded-xl border border-border bg-card p-4 font-sans text-sm leading-relaxed text-foreground">
        {text}
      </pre>
    </div>
  )
}
