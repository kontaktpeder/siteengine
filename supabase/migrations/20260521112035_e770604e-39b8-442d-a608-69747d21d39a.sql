ALTER TABLE public.site_recipes
  ADD COLUMN IF NOT EXISTS page_template text NOT NULL DEFAULT 'organization_documentary',
  ADD COLUMN IF NOT EXISTS visual_tone text;

ALTER TABLE public.client_brains
  ADD COLUMN IF NOT EXISTS format_brief jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.site_recipes.page_template IS
  'organization_documentary | brand_poster | local_conversion | portfolio_editorial';
COMMENT ON COLUMN public.client_brains.format_brief IS
  'JSON: digital_object, feels_like, must_not_feel_like, information_budget, hero_job, first_3_seconds, anti_patterns';