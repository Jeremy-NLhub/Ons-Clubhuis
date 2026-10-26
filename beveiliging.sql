-- Uitvoeren in Supabase SQL Editor voordat de website wordt gebruikt.
-- Vermijdt recursie in RLS-beleid voor de ledenlijst.
create or replace function public.clubhuis_is_member()
returns boolean language sql stable security definer
set search_path = ''
as $$
  select exists (select 1 from public.clubhuis_members where user_id = (select auth.uid()));
$$;
revoke all on function public.clubhuis_is_member() from public;
grant execute on function public.clubhuis_is_member() to authenticated;

drop policy if exists "Members can view members" on public.clubhuis_members;
drop policy if exists "Members can read messages" on public.clubhuis_messages;
drop policy if exists "Members can send messages" on public.clubhuis_messages;

create policy "Members can view members" on public.clubhuis_members
for select to authenticated using (public.clubhuis_is_member());
create policy "Members can read messages" on public.clubhuis_messages
for select to authenticated using (public.clubhuis_is_member());
create policy "Members can send messages" on public.clubhuis_messages
for insert to authenticated with check (user_id = (select auth.uid()) and public.clubhuis_is_member());

-- Voorkom brede toegang voor anonieme bezoekers.
revoke all on public.clubhuis_members, public.clubhuis_messages from anon;
grant select on public.clubhuis_members to authenticated;
grant select, insert on public.clubhuis_messages to authenticated;
grant usage, select on sequence public.clubhuis_messages_id_seq to authenticated;
