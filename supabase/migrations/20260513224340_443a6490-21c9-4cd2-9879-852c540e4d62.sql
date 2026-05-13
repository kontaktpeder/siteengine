-- 1) Add human identity fields to client_brains (idempotent)
ALTER TABLE public.client_brains
  ADD COLUMN IF NOT EXISTS flagship_story text,
  ADD COLUMN IF NOT EXISTS emotional_trigger text,
  ADD COLUMN IF NOT EXISTS anti_brand text,
  ADD COLUMN IF NOT EXISTS memorable_takeaway text,
  ADD COLUMN IF NOT EXISTS representative_scene text,
  ADD COLUMN IF NOT EXISTS desired_feelings text;

-- 2) Create media_notes table
CREATE TABLE IF NOT EXISTS public.media_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  title text,
  description text,
  emotional_value text,
  suggested_usage text,
  is_hero_candidate boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS media_notes_client_id_idx ON public.media_notes(client_id);

ALTER TABLE public.media_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read media notes for published clients" ON public.media_notes;
CREATE POLICY "Public can read media notes for published clients"
ON public.media_notes
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.clients c
  WHERE c.id = media_notes.client_id AND c.status = 'published'
));

DROP POLICY IF EXISTS "Client admins can manage media notes" ON public.media_notes;
CREATE POLICY "Client admins can manage media notes"
ON public.media_notes
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.client_users cu
  WHERE cu.client_id = media_notes.client_id
    AND cu.user_id = auth.uid()
    AND cu.role = ANY (ARRAY['owner','admin'])
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.client_users cu
  WHERE cu.client_id = media_notes.client_id
    AND cu.user_id = auth.uid()
    AND cu.role = ANY (ARRAY['owner','admin'])
));