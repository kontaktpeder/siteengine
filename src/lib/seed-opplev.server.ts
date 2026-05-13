// Seed payload for Foreningen Opplev. Server-only (kept out of client bundles).

export const OPPLEV_SEED = {
  client: {
    name: "Foreningen Opplev",
    slug: "opplev",
    status: "published",
    email: "post@opplev.no",
    phone: null,
    address: null,
    organization_number: null,
    primary_domain: null,
  },
  brain: {
    site_type: "landing_page",
    primary_goal: "Bygge tillit og synliggjøre tilbudet til barn, unge, familier og samarbeidspartnere.",
    secondary_goal: "Gjøre det enkelt å ta kontakt for samarbeid, deltakelse og støtte.",
    audience: [
      { label: "Barn og unge", description: "Barn og unge med fysiske og sosiale utfordringer." },
      { label: "Fosterfamilier", description: "Fosterbarn sammen med fosterforeldre og biologiske foreldre." },
      { label: "Tegnspråkmiljø", description: "Døve, hørselshemmede og tegnspråkbrukere." },
      { label: "Blinde og svaksynte", description: "Personer som trenger tilrettelagte aktiviteter." },
      { label: "Samarbeidspartnere", description: "Kommuner, organisasjoner og bedrifter som vil bidra." },
    ],
    brand_keywords: [
      "mestring",
      "trygghet",
      "tilhørighet",
      "universell utforming",
      "inkludering",
      "alle i førersetet",
    ],
    tone_keywords: ["varm", "rolig", "troverdig", "profesjonell", "tydelig", "uten salgspress"],
    short_description:
      "Foreningen Opplev skaper trygge arenaer for mestring, tilhørighet og inkludering — der alle skal få sitte i førersetet.",
    long_description:
      "Foreningen Opplev jobber for at barn, unge og familier med ulike forutsetninger skal få oppleve mestring og fellesskap på sine egne premisser. Vi tilrettelegger aktiviteter for fosterfamilier, tegnspråkmiljø, blinde og svaksynte, og barn og unge med fysiske og sosiale utfordringer.",
    mission:
      "Å skape trygge, tilrettelagte og meningsfulle opplevelser for de som trenger det mest — der ingen står på sidelinjen.",
    vision: "Et samfunn der alle får sitte i førersetet i sitt eget liv.",
    problem_statement:
      "For mange barn, unge og familier opplever at vanlige aktiviteter ikke er tilrettelagt for dem. Det skaper utenforskap.",
    solution_statement:
      "Vi tilrettelegger arenaer som Kragerø Action Park, gokart for rullestolbrukere, ledsagerkart og aktiviteter for blinde og svaksynte — slik at alle kan delta på like vilkår.",
    trust_points: [
      { label: "Universell utforming", description: "Tilrettelagt for ulike behov fra første stund." },
      { label: "Erfarne ledsagere", description: "Trygge voksne med kompetanse på tilrettelegging." },
      { label: "Samarbeid med kommuner", description: "Vi jobber tett med offentlige aktører og fagmiljø." },
      { label: "Fokus på mestring", description: "Aktivitetene er bygget for opplevelsen, ikke prestasjonen." },
    ],
    services: [
      {
        title: "Tilrettelagt gokart",
        description:
          "Gokart for rullestolbrukere på Kragerø Action Park — alle skal i førersetet, bokstavelig talt.",
      },
      {
        title: "Ledsagerkart",
        description: "Tilbud som gjør det enklere å delta sammen med ledsager.",
      },
      {
        title: "Aktiviteter for blinde og svaksynte",
        description: "Tilpassede opplevelser med god tilrettelegging og trygge rammer.",
      },
      {
        title: "Tegnspråkvennlige arrangementer",
        description: "Aktiviteter med tegnspråk og tilrettelegging for døve og hørselshemmede.",
      },
      {
        title: "Fosterfamiliesamlinger",
        description:
          "Møteplasser for fosterbarn sammen med foster- og biologiske foreldre.",
      },
      {
        title: "Trygge arenaer for barn og unge",
        description: "Tilrettelagte tilbud for barn og unge med fysiske og sosiale utfordringer.",
      },
    ],
    partners: [
      { name: "Kragerø Action Park" },
      { name: "Kommunale tjenester" },
      { name: "Frivillige organisasjoner" },
      { name: "Lokale bedrifter og støttespillere" },
    ],
    faq: [
      {
        question: "Hvem er tilbudet for?",
        answer:
          "Foreningen Opplev er for barn, unge og familier som trenger ekstra tilrettelegging — fosterfamilier, tegnspråkmiljø, blinde og svaksynte, og barn og unge med fysiske eller sosiale utfordringer.",
      },
      {
        question: "Koster det noe å delta?",
        answer:
          "Vi jobber for at terskelen skal være så lav som mulig. Ta kontakt for informasjon om det enkelte arrangement.",
      },
      {
        question: "Hvordan kan vi samarbeide?",
        answer:
          "Vi tar gjerne en prat med kommuner, organisasjoner og bedrifter som vil bidra. Send oss en melding, så finner vi en god form.",
      },
      {
        question: "Er aktivitetene trygge?",
        answer:
          "Ja. Alle aktiviteter har erfarne ledsagere, og vi tilrettelegger ut fra hver enkelt deltakers behov.",
      },
    ],
    cta_primary_label: "Ta kontakt",
    cta_primary_href: "mailto:post@opplev.no",
    cta_secondary_label: "Se aktivitetene",
    cta_secondary_href: "#aktiviteter",
    raw_notes: "Fiken-inspirert: mintgrønt, kremhvit, rolig, luftig, serif-overskrifter, avrundede kort.",
    internal_notes: "Første versjon seedet av Studio P. A. Halvorsen Site Engine.",
  },
  recipe: {
    recipe_type: "trust_based_nonprofit",
    design_direction: "fiken_calm_mint",
    color_palette: { primary: "mint", background: "cream", accent: "deep_mint" },
    typography: { display: "Fraunces", body: "Inter" },
    layout_preferences: { density: "airy", radius: "rounded" },
    enabled_modules: [
      "hero",
      "trust_strip",
      "mission",
      "services_grid",
      "activities",
      "partners",
      "proof",
      "faq",
      "contact_cta",
    ],
    navigation: [
      { label: "Om oss", href: "#om" },
      { label: "Aktiviteter", href: "#aktiviteter" },
      { label: "Samarbeid", href: "#samarbeid" },
      { label: "Kontakt", href: "#kontakt" },
    ],
    footer: {
      tagline: "Alle skal i førersetet.",
      email: "post@opplev.no",
    },
  },
  page: {
    slug: "/",
    title: "Forsiden",
    status: "published",
    meta_title: "Foreningen Opplev — Alle skal i førersetet",
    meta_description:
      "Foreningen Opplev skaper trygge arenaer for mestring, tilhørighet og inkludering — for barn, unge og familier som trenger ekstra tilrettelegging.",
    sort_order: 0,
    noindex: false,
  },
  sections: [
    {
      module_type: "hero",
      variant: "default",
      title: "Alle skal i førersetet.",
      subtitle:
        "Foreningen Opplev skaper trygge arenaer for mestring, tilhørighet og inkludering.",
      content: {},
      settings: {},
      is_visible: true,
    },
    {
      module_type: "trust_strip",
      variant: "default",
      title: null,
      subtitle: null,
      content: {},
      settings: {},
      is_visible: true,
    },
    {
      module_type: "mission",
      variant: "default",
      title: "Vårt oppdrag",
      subtitle: null,
      content: {},
      settings: {},
      is_visible: true,
    },
    {
      module_type: "services_grid",
      variant: "default",
      title: "Det vi tilrettelegger",
      subtitle: "Aktiviteter og tilbud bygget for opplevelsen, ikke prestasjonen.",
      content: {},
      settings: { anchor: "aktiviteter" },
      is_visible: true,
    },
    {
      module_type: "activities",
      variant: "default",
      title: "På Kragerø Action Park",
      subtitle: "Ekte mestring, ekte fart, ekte tilrettelegging.",
      content: {
        items: [
          { title: "Gokart for rullestolbrukere", description: "Alle skal i førersetet — bokstavelig talt." },
          { title: "Ledsagerkjøring", description: "Trygge runder med erfaren ledsager ved siden." },
          { title: "Sansevennlige tider", description: "Roligere økter for de som trenger det." },
        ],
      },
      settings: {},
      is_visible: true,
    },
    {
      module_type: "partners",
      variant: "default",
      title: "Sammen med",
      subtitle: "Vi jobber tett med kommuner, organisasjoner og bedrifter.",
      content: {},
      settings: { anchor: "samarbeid" },
      is_visible: true,
    },
    {
      module_type: "proof",
      variant: "default",
      title: "Hvorfor det virker",
      subtitle: null,
      content: {},
      settings: {},
      is_visible: true,
    },
    {
      module_type: "faq",
      variant: "default",
      title: "Vanlige spørsmål",
      subtitle: null,
      content: {},
      settings: {},
      is_visible: true,
    },
    {
      module_type: "contact_cta",
      variant: "default",
      title: "Vil du samarbeide eller delta?",
      subtitle: "Vi tar gjerne en rolig prat. Ingen forpliktelser.",
      content: {},
      settings: { anchor: "kontakt" },
      is_visible: true,
    },
  ],
};
