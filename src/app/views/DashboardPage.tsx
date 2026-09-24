import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import Container from "../../components/layout/Container";
import DashboardHero from "../../components/dashboard/DashboardHero";
import SEOHead from "../../components/ui/SEOHead";
import {
  AFFILIATIONS,
  DEEPER,
  PROFILE,
  PROJECTS,
  STATS,
  type Project,
} from "../../content/profile";

/**
 * DashboardPage — the recruiter surface.
 *
 * Identical on phone and laptop. The only thing the two platforms disagree
 * about is how you *arrive* here (see EntryPage); once you land, the content,
 * the order, and the wording are the same. That is deliberate: a recruiter who
 * scans the QR on a phone at the booth and then opens the site on a laptop that
 * evening must see the same page, or the card stops being trustworthy.
 *
 * Budget above the fold: text plus one 105 KB portrait, loaded eagerly because
 * on a phone it is the LCP element and on a laptop it is the frame the intro
 * hands off (see DashboardHero). Still no video, no fetch, no layout that waits
 * on JavaScript.
 */

/**
 * Motion on this page comes in two kinds, split by where a block sits.
 *
 * Above the fold, `.reveal` (DashboardHero) fires once on mount. Below it,
 * `.scroll-rise` is tied to scroll position, because a mount animation on a
 * section four seconds away has already finished by the time anyone looks at
 * it — the page goes still exactly when the reading starts.
 *
 * Neither touches opacity. This page used to carry a Framer Motion
 * `initial={{ opacity: 0, y: 12 }}` per section, which meant every word on the
 * recruiter front door was invisible until a JS animation completed. Open it in
 * a background tab: rAF is paused, the animation never advances, the page
 * renders blank. That is the failure that used to blank /story too. Both CSS
 * animations here move position only, so the worst case is a block sitting a
 * little low — never a block nobody can read.
 */
function ProjectCard({ project }: { project: Project }) {
  return (
    <article
      className="scroll-rise group relative flex flex-col rounded-xl border border-white/10 bg-white/[0.03] p-5 transition-colors duration-200 hover:border-white/20 hover:bg-white/[0.05] sm:p-6"
    >
      <header className="mb-3">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="text-lg font-semibold tracking-tight text-[rgb(var(--fg-0))] sm:text-xl">
            {project.name}
          </h3>
          <span className="text-xs font-medium uppercase tracking-wider text-[rgb(var(--accent))]">
            {project.role}
          </span>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-[rgb(var(--fg-1))]/70">
          {project.org} · {project.period}
        </p>
      </header>

      <p className="mb-4 text-sm leading-relaxed text-[rgb(var(--fg-1))]">
        {project.summary}
      </p>

      <ul className="mb-5 space-y-1.5">
        {project.metrics.map((metric) => (
          <li
            key={metric}
            className="flex gap-2 text-[13px] leading-snug text-[rgb(var(--fg-1))]/85"
          >
            <span aria-hidden="true" className="mt-[7px] h-px w-2.5 flex-none bg-[rgb(var(--accent))]/60" />
            <span>{metric}</span>
          </li>
        ))}
      </ul>

      {/* Card links.
          Measured at 386px these were the worst targets on the page: bare inline
          text, 20px tall, ~50px wide, sitting 16px apart. Picking "Docs" over
          "Code" with a thumb was a coin flip.
          On a phone they become bordered chips with a 44px height. From `sm` up —
          where there is a cursor — the chrome is dropped and they go back to
          being quiet underlined text links. */}
      <footer className="mt-auto flex flex-wrap items-center gap-2 pt-1 sm:gap-x-4 sm:gap-y-2">
        {project.links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-white/15 bg-white/[0.04] px-3 text-[13px] font-medium text-[rgb(var(--fg-0))] underline-offset-4 transition-colors hover:text-[rgb(var(--accent))] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 sm:min-h-0 sm:rounded-sm sm:border-0 sm:bg-transparent sm:px-0 sm:hover:underline"
          >
            {link.label}
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        ))}
        {project.more && (
          <Link
            to={project.more}
            className="inline-flex min-h-11 items-center rounded-lg border border-white/10 px-3 text-[13px] text-[rgb(var(--fg-1))]/70 underline-offset-4 transition-colors hover:text-[rgb(var(--fg-0))] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 sm:min-h-0 sm:rounded-sm sm:border-0 sm:px-0 sm:hover:underline"
          >
            Case file
          </Link>
        )}
      </footer>
    </article>
  );
}

export default function DashboardPage() {

  return (
    <>
      {/* The front door carries the canonical title verbatim — the same string
          index.html ships — rather than the section-page "X — site" pattern. */}
      <SEOHead
        exactTitle
        title={`${PROFILE.name} — ${PROFILE.pitch}`}
        description={`${PROFILE.name} — ${PROFILE.classYear}, ${PROFILE.courseCode}. ${PROFILE.pitch}. Peptide Visual Lab, Interlock, MEET Crowdfunding, RoofMate.`}
      />

      <Container size="6xl" className="py-10 sm:py-14 lg:py-20">
        <DashboardHero />

        {/* ---------- Stats ---------- */}
        <dl
          className="scroll-rise mt-12 grid grid-cols-2 gap-x-4 gap-y-6 border-y border-white/10 py-6 sm:grid-cols-4 sm:gap-x-6"
        >
          {STATS.map((stat) => (
            <div key={stat.label}>
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="block text-2xl font-semibold tracking-tight text-[rgb(var(--fg-0))] sm:text-3xl">
                  {stat.value}
                </span>
                <span className="mt-1 block text-xs leading-snug text-[rgb(var(--fg-1))]/70">
                  {stat.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>

        {/* ---------- Projects ---------- */}
        <section className="mt-12" aria-labelledby="work-heading">
          <h2
            id="work-heading"
            className="scroll-rise mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-[rgb(var(--fg-1))]/60"
          >
            Selected work
          </h2>

          <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
            {PROJECTS.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>

        {/* ---------- Affiliations ---------- */}
        <section
          className="scroll-rise mt-12"
          aria-labelledby="affiliations-heading"
        >
          <h2
            id="affiliations-heading"
            className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[rgb(var(--fg-1))]/60"
          >
            Also
          </h2>
          <ul className="flex flex-wrap gap-2">
            {AFFILIATIONS.map((item) => (
              <li
                key={item}
                className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-[rgb(var(--fg-1))]"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- Deeper ---------- */}
        <section
          className="scroll-rise mt-12"
          aria-labelledby="deeper-heading"
        >
          <h2
            id="deeper-heading"
            className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[rgb(var(--fg-1))]/60"
          >
            If you have more than forty seconds
          </h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {DEEPER.map((entry) => (
              <Link
                key={entry.to}
                to={entry.to}
                className="group flex min-h-14 items-center justify-between gap-3 rounded-lg border border-white/10 px-4 py-3 transition-colors hover:border-white/25 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 sm:min-h-0"
              >
                <span>
                  <span className="block text-sm font-medium text-[rgb(var(--fg-0))]">
                    {entry.label}
                  </span>
                  <span className="block text-xs text-[rgb(var(--fg-1))]/65">
                    {entry.note}
                  </span>
                </span>
                <ArrowUpRight
                  className="h-4 w-4 flex-none text-[rgb(var(--fg-1))]/50 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[rgb(var(--accent))]"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        </section>
      </Container>
    </>
  );
}
