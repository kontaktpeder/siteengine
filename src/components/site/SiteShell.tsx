import type { SiteData } from "@/lib/site-types";
import { renderModule } from "./modules";

interface NavItem {
  label: string;
  href: string;
}

export function SiteShell({ data }: { data: SiteData }) {
  const recipe = data.recipe;
  const nav = (Array.isArray(recipe?.navigation) ? recipe?.navigation : []) as unknown as NavItem[];
  const footer = (recipe?.footer ?? {}) as unknown as { tagline?: string; email?: string };
  const brain = data.brain;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5 md:px-10">
          <a href="/" className="font-display text-xl tracking-tight">
            {data.client.name}
          </a>
          <nav className="hidden items-center gap-7 md:flex">
            {nav.map((n, i) => (
              <a
                key={i}
                href={n.href}
                className="text-sm text-muted-foreground transition hover:text-foreground"
              >
                {n.label}
              </a>
            ))}
            {brain?.cta_primary_label && brain?.cta_primary_href ? (
              <a
                href={brain.cta_primary_href}
                className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                {brain.cta_primary_label}
              </a>
            ) : null}
          </nav>
        </div>
      </header>

      <main>
        {data.sections.map((s) => (
          <div key={s.id}>{renderModule({ section: s, brain, site: data })}</div>
        ))}
      </main>

      <footer className="mt-10 border-t border-border bg-card">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-12 md:flex-row md:items-end md:justify-between md:px-10">
          <div>
            <div className="font-display text-2xl">{data.client.name}</div>
            {footer.tagline ? (
              <div className="mt-1 text-sm text-muted-foreground">{footer.tagline}</div>
            ) : null}
          </div>
          <div className="text-sm text-muted-foreground">
            {footer.email ? (
              <a className="hover:text-foreground" href={`mailto:${footer.email}`}>
                {footer.email}
              </a>
            ) : null}
            <div className="mt-1">© {new Date().getFullYear()} {data.client.name}</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function EmptySiteState() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <div className="max-w-md">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-primary">
          ✦
        </div>
        <h1 className="mt-6 text-4xl">Nettstedet er klart for innhold.</h1>
        <p className="mt-4 text-muted-foreground">
          Det er ingen publisert klient eller side ennå. Gå til{" "}
          <a href="/studio" className="underline underline-offset-4">
            /studio
          </a>{" "}
          for å opprette en klient eller seede første utkast.
        </p>
      </div>
    </div>
  );
}
