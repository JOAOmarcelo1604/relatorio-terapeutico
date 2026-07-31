import { Database } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DbSetupNotice({ detail }: { detail?: string }) {
  return (
    <Card className="border-accent bg-accent/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading text-accent-foreground">
          <Database className="size-5" />
          Banco de dados ainda não conectado
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm leading-relaxed text-foreground">
        <p>
          Para salvar os dados de forma permanente, aponte a aplicação para o seu
          PostgreSQL definindo as variáveis de ambiente. Você pode usar uma única
          URL de conexão:
        </p>
        <pre className="overflow-x-auto rounded-lg bg-card p-3 font-mono text-xs text-foreground">
          {`DATABASE_URL=postgres://usuario:senha@host:5432/nome_do_banco`}
        </pre>
        <p>ou as variáveis separadas:</p>
        <pre className="overflow-x-auto rounded-lg bg-card p-3 font-mono text-xs text-foreground">
          {`PGHOST=seu_host
PGPORT=5432
PGUSER=seu_usuario
PGPASSWORD=sua_senha
PGDATABASE=nome_do_banco`}
        </pre>
        <p className="text-muted-foreground">
          Antes disso, rode o arquivo <code className="font-mono">scripts/schema.sql</code>{" "}
          no seu banco para criar as tabelas. Os passos completos estão no{" "}
          <code className="font-mono">README.md</code>.
        </p>
        {detail ? (
          <p className="rounded-lg bg-destructive/10 p-3 font-mono text-xs text-destructive">
            {detail}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
