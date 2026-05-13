
-- Public read policies for site rendering
CREATE POLICY "Public can read published clients"
ON public.clients FOR SELECT
USING (status = 'published');

CREATE POLICY "Public can read brains of published clients"
ON public.client_brains FOR SELECT
USING (EXISTS (SELECT 1 FROM public.clients c WHERE c.id = client_brains.client_id AND c.status = 'published'));

CREATE POLICY "Public can read recipes of published clients"
ON public.site_recipes FOR SELECT
USING (EXISTS (SELECT 1 FROM public.clients c WHERE c.id = site_recipes.client_id AND c.status = 'published'));

CREATE POLICY "Public can read pages of published clients"
ON public.site_pages FOR SELECT
USING (EXISTS (SELECT 1 FROM public.clients c WHERE c.id = site_pages.client_id AND c.status = 'published'));

CREATE POLICY "Public can read visible sections of published clients"
ON public.page_sections FOR SELECT
USING (
  is_visible = true AND EXISTS (
    SELECT 1 FROM public.site_pages p
    JOIN public.clients c ON c.id = p.client_id
    WHERE p.id = page_sections.page_id AND c.status = 'published'
  )
);
