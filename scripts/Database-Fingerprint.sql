CREATE TEMP TABLE astra_fingerprint (table_name text, row_count bigint, digest text);
DO $$
DECLARE t record;
BEGIN
 FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename LOOP
  EXECUTE format('INSERT INTO astra_fingerprint SELECT %L, count(*), md5(coalesce(string_agg(to_jsonb(r)::text, E''\\n'' ORDER BY to_jsonb(r)::text), '''')) FROM public.%I r', t.tablename, t.tablename);
 END LOOP;
END $$;
SELECT coalesce(jsonb_agg(to_jsonb(f) ORDER BY table_name), '[]'::jsonb) FROM astra_fingerprint f;
