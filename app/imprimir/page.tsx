import { requireSessao } from "@/lib/auth"
import { getFeedbacksPorIds } from "@/lib/queries"
import type { Feedback } from "@/lib/types"
import { PrintView } from "@/components/print-view"
import { DbSetupNotice } from "@/components/db-setup-notice"

export const dynamic = "force-dynamic"

export default async function ImprimirPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>
}) {
  await requireSessao()
  const sp = await searchParams

  const ids = String(sp.ids ?? "")
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0)

  let feedbacks: Feedback[] = []
  let erro: string | null = null
  try {
    feedbacks = await getFeedbacksPorIds(ids)
  } catch (e) {
    erro = e instanceof Error ? e.message : "Erro ao carregar os feedbacks."
  }

  if (erro) return <DbSetupNotice detail={erro} />
  return <PrintView feedbacks={feedbacks} />
}
