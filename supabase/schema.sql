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
  settlement_mode text not null default 'invoice' check (settlement_mode in ('invoice', 'profile')),
  created_at timestamptz not null,
  updated_at timestamptz not null
);

alter table payment_links
  add column if not exists settlement_mode text not null default 'invoice'
  check (settlement_mode in ('invoice', 'profile'));

create index if not exists payment_links_creator_wallet_idx on payment_links (lower(creator_wallet));
create index if not exists payment_links_slug_idx on payment_links (slug);
create index if not exists payment_links_status_idx on payment_links (status);
create unique index if not exists payment_links_contract_link_id_idx on payment_links (contract_link_id);

alter table payment_links enable row level security;

-- SELECT: anyone with the link can read it (payers don't authenticate).
drop policy if exists "public can read payment links" on payment_links;
create policy "public can read payment links"
on payment_links for select
using (true);

-- INSERT: public clients can initiate profile payments, which are payer-created.
-- Invoice rows are inserted only by /api/payments/create after Arc createLink verification.
drop policy if exists "anyone can create payment links" on payment_links;
create policy "anyone can create payment links"
on payment_links for insert
with check (status = 'unpaid' and settlement_mode = 'profile');

-- UPDATE: transitional processing/error state is writable by the payer UI.
-- Final paid and cancelled states are accepted only from server-verification routes.
drop policy if exists "anyone can update payment links" on payment_links;
drop policy if exists "public can update non-final payment metadata" on payment_links;
create policy "public can update non-final payment metadata"
on payment_links for update
using (status <> 'paid' and status <> 'cancelled')
with check (status in ('unpaid', 'processing', 'expired', 'failed'));

-- DELETE: nobody. Deletes must happen with the service role key.
drop policy if exists "no deletes" on payment_links;
create policy "no deletes"
on payment_links for delete
using (false);

-- Trigger: enforce immutable columns and seal paid rows.
create or replace function public.lock_payment_link_fields()
returns trigger
language plpgsql
set search_path = public, pg_temp
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
  if old.settlement_mode is distinct from new.settlement_mode then
    raise exception 'payment_links.settlement_mode is immutable';
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
  if new.status = 'paid' and auth.role() <> 'service_role' then
    raise exception 'paid status requires server-verified Arc settlement';
  end if;
  if new.status = 'cancelled' and auth.role() <> 'service_role' then
    raise exception 'cancelled status requires server-verified Arc cancellation';
  end if;
  return new;
end;
$$;

drop trigger if exists payment_links_lock_immutable on payment_links;
create trigger payment_links_lock_immutable
  before update on payment_links
  for each row execute function lock_payment_link_fields();

create table if not exists freelancer_profiles (
  handle text primary key check (handle ~ '^[a-z0-9][a-z0-9-]{0,31}$'),
  wallet text not null,
  display_name text not null,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

alter table freelancer_profiles enable row level security;

drop policy if exists "public can read freelancer profiles" on freelancer_profiles;
create policy "public can read freelancer profiles"
on freelancer_profiles for select using (true);

-- Claims and updates go through /api/profiles, which verifies a wallet
-- signature and writes using the server-only service role key.
drop policy if exists "public can save freelancer profiles" on freelancer_profiles;
drop policy if exists "public can update freelancer profiles" on freelancer_profiles;
