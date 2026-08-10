ALTER POLICY "condiciones_create_propio" ON "condiciones" TO authenticated WITH CHECK ((select auth.uid()) = "condiciones"."perfil_id");
