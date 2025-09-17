-- Fix recursive RLS policy on public.users that caused
-- "infinite recursion detected in policy for relation 'users'"

-- Safely drop the problematic policy if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'users'
      AND policyname = 'Admins can view all users'
  ) THEN
    EXECUTE 'DROP POLICY "Admins can view all users" ON public.users';
  END IF;
END $$;

-- Note:
-- We purposely do not recreate an admin-wide SELECT policy on public.users here,
-- because any policy on public.users that queries public.users will recurse.
-- If you need admin access to list users, prefer a SECURITY DEFINER function
-- or use the service role on the server side.


