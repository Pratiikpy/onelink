create table if not exists payment_links (
  id uuid primary key,
  slug text unique not null,
  creator_wallet text not null,
  recipient_wallet text not null,
  amount_usdc text not null,
  memo text not null,
  status text not null check (status in ('unpaid', 'processing', 'paid', 'expired', 'failed')),
  expires_at timestamptz,
  contract_link_id text not null,
  tx_hash text,
  payer_wallet text,
  payment_method text,
  source_chain text,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create index if not exists payment_links_creator_wallet_idx on payment_links (lower(creator_wallet));
create index if not exists payment_links_slug_idx on payment_links (slug);
create index if not exists payment_links_status_idx on payment_links (status);

alter table payment_links enable row level security;

drop policy if exists "public can read payment links" on payment_links;
create policy "public can read payment links"
on payment_links for select
using (true);

drop policy if exists "public can insert payment links" on payment_links;
create policy "public can insert payment links"
on payment_links for insert
with check (true);

drop policy if exists "public can update payment links" on payment_links;
create policy "public can update payment links"
on payment_links for update
using (true)
with check (true);
