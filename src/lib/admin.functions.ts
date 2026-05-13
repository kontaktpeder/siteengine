import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { OPPLEV_SEED } from "./seed-opplev.server";

export const listClients = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
});

export const getClientBundle = createServerFn({ method: "GET" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const [{ data: client }, { data: brains }] = await Promise.all([
      supabaseAdmin.from("clients").select("*").eq("id", data.id).single(),
      supabaseAdmin
        .from("client_brains")
        .select("*")
        .eq("client_id", data.id)
        .limit(1),
    ]);
    return { client, brain: brains?.[0] ?? null };
  });

export const upsertClient = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      id?: string;
      name: string;
      slug: string;
      status: string;
      email?: string | null;
      phone?: string | null;
      address?: string | null;
      organization_number?: string | null;
      primary_domain?: string | null;
    }) => input,
  )
  .handler(async ({ data }) => {
    if (data.id) {
      const { data: row, error } = await supabaseAdmin
        .from("clients")
        .update({
          name: data.name,
          slug: data.slug,
          status: data.status,
          email: data.email ?? null,
          phone: data.phone ?? null,
          address: data.address ?? null,
          organization_number: data.organization_number ?? null,
          primary_domain: data.primary_domain ?? null,
        })
        .eq("id", data.id)
        .select("*")
        .single();
      if (error) throw error;
      return row;
    }
    const { data: row, error } = await supabaseAdmin
      .from("clients")
      .insert({
        name: data.name,
        slug: data.slug,
        status: data.status,
        email: data.email ?? null,
        phone: data.phone ?? null,
        address: data.address ?? null,
        organization_number: data.organization_number ?? null,
        primary_domain: data.primary_domain ?? null,
      })
      .select("*")
      .single();
    if (error) throw error;
    return row;
  });

export const upsertBrain = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      client_id: string;
      site_type?: string;
      primary_goal?: string | null;
      secondary_goal?: string | null;
      audience?: unknown;
      brand_keywords?: unknown;
      tone_keywords?: unknown;
      short_description?: string | null;
      long_description?: string | null;
      mission?: string | null;
      vision?: string | null;
      problem_statement?: string | null;
      solution_statement?: string | null;
      trust_points?: unknown;
      services?: unknown;
      partners?: unknown;
      faq?: unknown;
      cta_primary_label?: string | null;
      cta_primary_href?: string | null;
      cta_secondary_label?: string | null;
      cta_secondary_href?: string | null;
      raw_notes?: string | null;
      internal_notes?: string | null;
    }) => input,
  )
  .handler(async ({ data }) => {
    const { data: existing } = await supabaseAdmin
      .from("client_brains")
      .select("id")
      .eq("client_id", data.client_id)
      .limit(1);

    const payload = {
      client_id: data.client_id,
      site_type: data.site_type ?? "landing_page",
      primary_goal: data.primary_goal ?? null,
      secondary_goal: data.secondary_goal ?? null,
      audience: (data.audience ?? []) as never,
      brand_keywords: (data.brand_keywords ?? []) as never,
      tone_keywords: (data.tone_keywords ?? []) as never,
      short_description: data.short_description ?? null,
      long_description: data.long_description ?? null,
      mission: data.mission ?? null,
      vision: data.vision ?? null,
      problem_statement: data.problem_statement ?? null,
      solution_statement: data.solution_statement ?? null,
      trust_points: (data.trust_points ?? []) as never,
      services: (data.services ?? []) as never,
      partners: (data.partners ?? []) as never,
      faq: (data.faq ?? []) as never,
      cta_primary_label: data.cta_primary_label ?? null,
      cta_primary_href: data.cta_primary_href ?? null,
      cta_secondary_label: data.cta_secondary_label ?? null,
      cta_secondary_href: data.cta_secondary_href ?? null,
      raw_notes: data.raw_notes ?? null,
      internal_notes: data.internal_notes ?? null,
    };

    if (existing && existing.length) {
      const { data: row, error } = await supabaseAdmin
        .from("client_brains")
        .update(payload)
        .eq("id", existing[0].id)
        .select("*")
        .single();
      if (error) throw error;
      return row;
    }
    const { data: row, error } = await supabaseAdmin
      .from("client_brains")
      .insert(payload)
      .select("*")
      .single();
    if (error) throw error;
    return row;
  });

/**
 * Seed Foreningen Opplev: client + brain + recipe + home page + sections.
 * Idempotent — looks up by slug "opplev".
 */
export const seedOpplev = createServerFn({ method: "POST" }).handler(async () => {
  const seed = OPPLEV_SEED;

  // 1. Client
  let { data: client } = await supabaseAdmin
    .from("clients")
    .select("*")
    .eq("slug", seed.client.slug)
    .maybeSingle();

  if (!client) {
    const { data, error } = await supabaseAdmin
      .from("clients")
      .insert(seed.client)
      .select("*")
      .single();
    if (error) throw error;
    client = data;
  } else {
    const { data, error } = await supabaseAdmin
      .from("clients")
      .update(seed.client)
      .eq("id", client.id)
      .select("*")
      .single();
    if (error) throw error;
    client = data;
  }

  // 2. Brain
  const { data: existingBrain } = await supabaseAdmin
    .from("client_brains")
    .select("id")
    .eq("client_id", client.id)
    .limit(1);
  const brainPayload = { ...seed.brain, client_id: client.id } as never;
  if (existingBrain && existingBrain.length) {
    await supabaseAdmin
      .from("client_brains")
      .update(brainPayload)
      .eq("id", existingBrain[0].id);
  } else {
    await supabaseAdmin.from("client_brains").insert(brainPayload);
  }

  // 3. Recipe
  const { data: existingRecipe } = await supabaseAdmin
    .from("site_recipes")
    .select("id")
    .eq("client_id", client.id)
    .limit(1);
  const recipePayload = { ...seed.recipe, client_id: client.id } as never;
  if (existingRecipe && existingRecipe.length) {
    await supabaseAdmin
      .from("site_recipes")
      .update(recipePayload)
      .eq("id", existingRecipe[0].id);
  } else {
    await supabaseAdmin.from("site_recipes").insert(recipePayload);
  }

  // 4. Home page
  let { data: page } = await supabaseAdmin
    .from("site_pages")
    .select("*")
    .eq("client_id", client.id)
    .eq("slug", "/")
    .maybeSingle();
  const pagePayload = { ...seed.page, client_id: client.id };
  if (!page) {
    const { data, error } = await supabaseAdmin
      .from("site_pages")
      .insert(pagePayload)
      .select("*")
      .single();
    if (error) throw error;
    page = data;
  } else {
    const { data, error } = await supabaseAdmin
      .from("site_pages")
      .update(pagePayload)
      .eq("id", page.id)
      .select("*")
      .single();
    if (error) throw error;
    page = data;
  }

  // 5. Replace sections
  await supabaseAdmin.from("page_sections").delete().eq("page_id", page.id);
  const sectionRows = seed.sections.map((s: Record<string, unknown>, i: number) => ({
    ...s,
    page_id: page!.id,
    sort_order: i,
  }));
  const { error: secErr } = await supabaseAdmin
    .from("page_sections")
    .insert(sectionRows as never);
  if (secErr) throw secErr;

  return { ok: true, client_id: client.id };
});
