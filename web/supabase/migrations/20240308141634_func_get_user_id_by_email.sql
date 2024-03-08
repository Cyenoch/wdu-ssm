create or replace function get_user_id_by_email(user_email text) returns uuid language plpgsql security definer
set search_path = public as $$
declare user_id uuid;
begin
select id
from auth.users
where email = user_email into user_id;
return user_id;
end;
$$;
