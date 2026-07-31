# Relatório Terapêutico

Aplicação Next.js para registrar feedbacks terapêuticos diários por paciente, com export semanal.

## Requisitos

- Node.js 20+ e [pnpm](https://pnpm.io/)
- [Docker](https://www.docker.com/) (para subir o PostgreSQL)

## 1. Subir o banco de dados

O `docker-compose.yml` cria o container do PostgreSQL e roda o `scripts/schema.sql`
automaticamente na primeira vez (criando as tabelas).

```bash
docker compose up -d
```

Isso cria:

- Container: `relatorio-terapeutico-db`
- Banco: `relatorio_terapeutico`
- Usuário/senha: `relatorio` / `relatorio`
- Porta: `5432`

Para conferir se subiu:

```bash
docker compose ps
docker exec -it relatorio-terapeutico-db psql -U relatorio -d relatorio_terapeutico -c "\dt"
```

Você deve ver as tabelas `pacientes`, `feedbacks` e `feedback_atividades`.

### Recriar o schema manualmente

O schema só roda automaticamente quando o volume está vazio. Se precisar aplicar
de novo (ex.: já tinha o container), rode:

```bash
docker exec -i relatorio-terapeutico-db psql -U relatorio -d relatorio_terapeutico < scripts/schema.sql
```

### Zerar tudo e começar do zero

```bash
docker compose down -v   # apaga o container E o volume de dados
docker compose up -d      # sobe de novo e reaplica o schema.sql
```

## 2. Configurar a aplicação

As credenciais já estão no arquivo `.env.local` (apontando para o banco acima).
Se usar outro host/senha, ajuste lá.

## 3. Rodar a aplicação

```bash
pnpm install
pnpm dev
```

Acesse http://localhost:3000

## Deploy em produção (servidor / Portainer)

O `docker-compose.yml` já inclui **dois serviços**: o banco (`db`) e a aplicação
(`app`, construída a partir do `Dockerfile`). A app conecta no banco pela rede
interna do compose (host `db`), então não depende do `.env.local`.

### Opção A — linha de comando no servidor

```bash
docker compose up -d --build
```

A aplicação fica em `http://IP_DO_SERVIDOR:3000` e o schema é criado
automaticamente na primeira subida do banco.

### Opção B — Portainer (Stacks)

1. No Portainer: **Stacks → Add stack**.
2. Dê um nome (ex.: `relatorio-terapeutico`).
3. Em **Build method**, escolha **Repository** (apontando para o Git do projeto)
   ou **Upload** / **Web editor** colando o conteúdo do `docker-compose.yml`.
   > O serviço `app` usa `build:`, então o Portainer precisa ter acesso ao
   > código-fonte (repositório ou upload). Se preferir não buildar no servidor,
   > veja a nota abaixo.
4. Clique em **Deploy the stack**.

O Portainer sobe os dois containers e o schema é aplicado automaticamente.

### Alterar senha / credenciais em produção

Edite as variáveis `POSTGRES_*` (serviço `db`) e a `DATABASE_URL` (serviço `app`)
no `docker-compose.yml` — as duas precisam bater. No Portainer você também pode
definir isso em **Environment variables** da stack.

### Nota: buildar imagem separadamente (registry)

Se o Portainer não puder buildar, gere a imagem em outra máquina e envie para um
registry:

```bash
docker build -t SEU_REGISTRY/relatorio-terapeutico:latest .
docker push SEU_REGISTRY/relatorio-terapeutico:latest
```

Depois, no `docker-compose.yml`, troque o bloco `build:` do serviço `app` por
`image: SEU_REGISTRY/relatorio-terapeutico:latest`.

## Banco em outro provedor (sem Docker)

Basta definir as variáveis de ambiente em `.env.local` apontando para o seu
PostgreSQL e rodar o schema uma vez:

```bash
psql -h SEU_HOST -p 5432 -U SEU_USUARIO -d NOME_DO_BANCO -f scripts/schema.sql
```
