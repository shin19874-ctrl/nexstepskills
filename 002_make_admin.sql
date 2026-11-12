-- Run this ONLY AFTER you have signed up on your website with shin19874@gmail.com and verified the email.
insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users where email = 'shin19874@gmail.com'
on conflict do nothing;
