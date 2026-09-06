-- Schema inicial da Carteira de Aluguéis, com isolamento por conta via RLS.
-- Cada "account" é um cliente pagante do produto (pode ter 2+ pessoas via profiles).

create extension if not exists "pgcrypto";

create table accounts (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  modo text not null default 'pessoal' check (modo in ('pessoal', 'profissional')),
  created_at timestamptz not null default now()
);

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  account_id uuid not null references accounts (id) on delete cascade,
  nome text not null,
  created_at timestamptz not null default now()
);

create table clients (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts (id) on delete cascade,
  nome text not null,
  telefone text default '',
  email text default '',
  obs text default '',
  created_at timestamptz not null default now()
);

create table properties (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts (id) on delete cascade,
  client_id uuid references clients (id) on delete set null,
  endereco text not null,
  conta_recebimento text default '',
  comissao_percent numeric(5, 2) not null default 0,
  created_at timestamptz not null default now()
);

create table units (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts (id) on delete cascade,
  property_id uuid not null references properties (id) on delete cascade,
  label text not null,
  created_at timestamptz not null default now()
);

create table tenants (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts (id) on delete cascade,
  unit_id uuid not null references units (id) on delete cascade,
  valor_aluguel numeric(12, 2) not null default 0,
  dia_vencimento smallint not null default 10 check (dia_vencimento between 1 and 28),
  data_inicio date not null,
  data_fim date,
  prazo_indeterminado boolean not null default false,
  multa_percent numeric(5, 2) not null default 0,
  juros_mes_percent numeric(5, 2) not null default 0,
  indice_correcao text not null default 'Nenhum' check (indice_correcao in ('Nenhum', 'IPCA', 'IGP-M', 'INPC')),
  contrato_assinado boolean not null default false,
  obs_contrato text default '',
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table moradores (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants (id) on delete cascade,
  nome text not null,
  telefone text default '',
  email text default ''
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts (id) on delete cascade,
  tenant_id uuid not null references tenants (id) on delete cascade,
  mes_referencia text not null, -- formato 'YYYY-MM'
  data_pagamento date,
  luz_paga boolean not null default false,
  agua_paga boolean not null default false,
  obs text default '',
  comprovante_path text,
  created_at timestamptz not null default now(),
  unique (tenant_id, mes_referencia)
);

create table maintenance (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts (id) on delete cascade,
  unit_id uuid not null references units (id) on delete cascade,
  descricao text not null,
  data_solicitacao date not null default current_date,
  data_prevista_fim date,
  status text not null default 'Planejada' check (status in ('Planejada', 'Em andamento', 'Concluída')),
  custo numeric(12, 2) not null default 0,
  obs text default '',
  created_at timestamptz not null default now()
);

create table maintenance_items (
  id uuid primary key default gen_random_uuid(),
  maintenance_id uuid not null references maintenance (id) on delete cascade,
  tipo text not null,
  responsavel text default '',
  contato text default '',
  custo numeric(12, 2) not null default 0,
  status text not null default 'Pendente' check (status in ('Pendente', 'Contratado', 'Concluído')),
  data date
);

create table repasses (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts (id) on delete cascade,
  client_id uuid not null references clients (id) on delete cascade,
  mes_referencia text not null,
  data_repasse date,
  valor numeric(12, 2) not null default 0,
  obs text default '',
  created_at timestamptz not null default now(),
  unique (client_id, mes_referencia)
);

create table indices (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts (id) on delete cascade,
  tipo text not null check (tipo in ('IPCA', 'IGP-M', 'INPC')),
  mes_referencia text not null,
  valor_percent numeric(6, 4) not null,
  created_at timestamptz not null default now(),
  unique (account_id, tipo, mes_referencia)
);

create table documents (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts (id) on delete cascade,
  tenant_id uuid not null references tenants (id) on delete cascade,
  nome text not null,
  storage_path text not null,
  created_at timestamptz not null default now()
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts (id) on delete cascade,
  unit_id uuid references units (id) on delete cascade, -- null = tarefa geral
  titulo text not null,
  concluida boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- índices de performance ----------
create index on profiles (account_id);
create index on clients (account_id);
create index on properties (account_id);
create index on units (property_id);
create index on tenants (unit_id);
create index on moradores (tenant_id);
create index on payments (tenant_id, mes_referencia);
create index on maintenance (unit_id);
create index on maintenance_items (maintenance_id);
create index on repasses (client_id, mes_referencia);
create index on indices (account_id, tipo, mes_referencia);
create index on documents (tenant_id);
create index on tasks (account_id, unit_id);

-- ---------- helper: conta do usuário logado ----------
-- SECURITY DEFINER para poder ler profiles antes de qualquer política de RLS
-- entrar em ação (evita recursão), consultando sempre a própria linha do usuário.
create or replace function auth_account_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select account_id from profiles where id = auth.uid()
$$;

-- ---------- RLS ----------
alter table accounts enable row level security;
alter table profiles enable row level security;
alter table clients enable row level security;
alter table properties enable row level security;
alter table units enable row level security;
alter table tenants enable row level security;
alter table moradores enable row level security;
alter table payments enable row level security;
alter table maintenance enable row level security;
alter table maintenance_items enable row level security;
alter table repasses enable row level security;
alter table indices enable row level security;
alter table documents enable row level security;
alter table tasks enable row level security;

create policy "membros veem a propria conta" on accounts
  for select using (id = auth_account_id());
create policy "membros atualizam a propria conta" on accounts
  for update using (id = auth_account_id());
create policy "qualquer usuario autenticado cria uma conta" on accounts
  for insert with check (auth.role() = 'authenticated');

create policy "membros veem perfis da propria conta" on profiles
  for select using (account_id = auth_account_id());
create policy "usuario cria o proprio perfil" on profiles
  for insert with check (id = auth.uid());
create policy "usuario atualiza o proprio perfil" on profiles
  for update using (id = auth.uid());

create policy "isolamento por conta: clients" on clients
  for all using (account_id = auth_account_id()) with check (account_id = auth_account_id());
create policy "isolamento por conta: properties" on properties
  for all using (account_id = auth_account_id()) with check (account_id = auth_account_id());
create policy "isolamento por conta: units" on units
  for all using (account_id = auth_account_id()) with check (account_id = auth_account_id());
create policy "isolamento por conta: tenants" on tenants
  for all using (account_id = auth_account_id()) with check (account_id = auth_account_id());
create policy "isolamento por conta: payments" on payments
  for all using (account_id = auth_account_id()) with check (account_id = auth_account_id());
create policy "isolamento por conta: maintenance" on maintenance
  for all using (account_id = auth_account_id()) with check (account_id = auth_account_id());
create policy "isolamento por conta: repasses" on repasses
  for all using (account_id = auth_account_id()) with check (account_id = auth_account_id());
create policy "isolamento por conta: indices" on indices
  for all using (account_id = auth_account_id()) with check (account_id = auth_account_id());
create policy "isolamento por conta: documents" on documents
  for all using (account_id = auth_account_id()) with check (account_id = auth_account_id());
create policy "isolamento por conta: tasks" on tasks
  for all using (account_id = auth_account_id()) with check (account_id = auth_account_id());

-- tabelas-filha sem account_id proprio: isolamento via join na tabela pai
create policy "isolamento por conta: moradores" on moradores
  for all using (
    exists (select 1 from tenants where tenants.id = moradores.tenant_id and tenants.account_id = auth_account_id())
  ) with check (
    exists (select 1 from tenants where tenants.id = moradores.tenant_id and tenants.account_id = auth_account_id())
  );
create policy "isolamento por conta: maintenance_items" on maintenance_items
  for all using (
    exists (select 1 from maintenance where maintenance.id = maintenance_items.maintenance_id and maintenance.account_id = auth_account_id())
  ) with check (
    exists (select 1 from maintenance where maintenance.id = maintenance_items.maintenance_id and maintenance.account_id = auth_account_id())
  );
