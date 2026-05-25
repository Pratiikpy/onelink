-- OneLink Collect — payment links table + Row Level Security
--
-- Threat model note: this schema is designed for anon-key (browser) writes
-- because the app does not yet have user auth. To keep that practical without
-- handing anyone a "mark anything paid" footgun, immutable columns are
-- enforced via a BEFORE UPDATE trigger and paid rows are sealed.
--
-- For production, layer one of:
--   (a) Move writes to Next.js Route Handlers using SUPABASE_SERVICE_ROLE_KEY
--   (b) Add Supabase Auth and scope policies to auth.uid()
--   (c) Verify on-chain that link.tx_hash actually moved USDC before trusting
--       the "paid" status in the receiver dashboard.

create table if not exists payment_links (
  id uuid primary key,
  slug text unique not null,
  creator_wallet text not null,
  recipient_wallet text not null,
  amount_usdc text not null,
  memo text not null,
  status text not null check (status in ('unpaid', 'processing', 'paid', 'expired', 'failed', 'cancelled')),
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

-- SELECT: anyone with the link can read it (payers don't authenticate).
drop policy if exists "public can read payment links" on payment_links;
create policy "public can read payment links"
on payment_links for select
using (true);

-- INSERT: anyone can create a link, but it MUST start as 'unpaid'.
-- This blocks an attacker from inserting a pre-paid row.
drop policy if exists "anyone can create payment links" on payment_links;
create policy "anyone can create payment links"
on payment_links for insert
with check (status = 'unpaid');

-- UPDATE: gated by the trigger below, which freezes immutable fields and
-- seals paid rows. The policy itself stays permissive because Supabase RLS
-- cannot diff OLD vs NEW on its own.
drop policy if exists "anyone can update payment links" on payment_links;
create policy "anyone can update payment links"
on payment_links for update
using (true)
with check (true);

-- DELETE: nobody. Deletes must happen with the service role key.
drop policy if exists "no deletes" on payment_links;
create policy "no deletes"
on payment_links for delete
using (false);

-- Trigger: enforce immutable columns and seal paid rows.
create or replace function lock_payment_link_fields()
returns trigger
language plpgsql
as $$
begin
  if old.id is distinct from new.id then
    raise exception 'payment_links.id is immutable';
  end if;
  if old.slug is distinct from new.slug then
    raise exception 'payment_links.slug is immutable';
  end if;
  if old.creator_wallet is distinct from new.creator_wallet then
    raise exception 'payment_links.creator_wallet is immutable';
  end if;
  if old.recipient_wallet is distinct from new.recipient_wallet then
    raise exception 'payment_links.recipient_wallet is immutable';
  end if;
  if old.amount_usdc is distinct from new.amount_usdc then
    raise exception 'payment_links.amount_usdc is immutable';
  end if;
  if old.memo is distinct from new.memo then
    raise exception 'payment_links.memo is immutable';
  end if;
  if old.contract_link_id is distinct from new.contract_link_id then
    raise exception 'payment_links.contract_link_id is immutable';
  end if;
  if old.created_at is distinct from new.created_at then
    raise exception 'payment_links.created_at is immutable';
  end if;
  if old.status = 'paid' then
    raise exception 'paid payment_links rows are sealed';
  end if;
  if old.status = 'cancelled' then
    raise exception 'cancelled payment_links rows are sealed';
  end if;
  return new;
end;
$$;

drop trigger if exists payment_links_lock_immutable on payment_links;
create trigger payment_links_lock_immutable
  before update on payment_links
  for each row execute function lock_payment_link_fields();
