import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Download,
  Github,
  Linkedin,
  Mail,
  Phone,
} from "lucide-react";
import Container from "../../components/layout/Container";
import SEOHead from "../../components/ui/SEOHead";
import { useReducedMotion } from "../../hooks/useReducedMotion";
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
 * Budget: everything above the fold is text. No images, no video, no fetch.
 */

const EASE = [0.4, 0, 0.2, 1] as const;

function useStagger(reduced: boolean) {
  return (index: number) =>
    reduced
      ? { initial: false as const, animate: { opacity: 1 } }
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay: index * 0.06, ease: EASE },
        };
}

function ProjectCard({ project, index, reduced }: { project: Project; index: number; reduced: boolean }) {
  const stagger = useStagger(reduced);

  return (
    <motion.article
      {...stagger(index)}
      className="group relative flex flex-col rounded-xl border border-white/10 bg-white/[0.03] p-5 transition-colors duration-200 hover:border-white/20 hover:bg-white/[0.05] sm:p-6"
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

      <footer className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
        {project.links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[13px] font-medium text-[rgb(var(--fg-0))] underline-offset-4 transition-colors hover:text-[rgb(var(--accent))] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 rounded-sm"
          >
            {link.label}
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        ))}
        {project.more && (
          <Link
            to={project.more}
            className="text-[13px] text-[rgb(var(--fg-1))]/70 underline-offset-4 transition-colors hover:text-[rgb(var(--fg-0))] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 rounded-sm"
          >
            Case file
          </Link>
        )}
      </footer>
    </motion.article>
  );
}

export default function DashboardPage() {
  const reduced = useReducedMotion();
  const stagger = useStagger(reduced);

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
        {/* ---------- Hero ---------- */}
        <motion.header {...stagger(0)} className="max-w-3xl">
          <h1 className="text-[clamp(2rem,7vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-[rgb(var(--fg-0))]">
            {PROFILE.name}
          </h1>

          <div
            aria-hidden="true"
            className="mt-5 h-[2px] w-12 bg-[rgb(var(--accent))]"
          />

          <p className="mt-5 text-[clamp(1.05rem,3.4vw,1.6rem)] font-medium leading-snug tracking-[-0.01em] text-[rgb(var(--fg-0))]">
            {PROFILE.pitch}
          </p>

          <p className="mt-3 text-sm leading-relaxed text-[rgb(var(--fg-1))] sm:text-base">
            {PROFILE.classYear} · {PROFILE.courseCode} — {PROFILE.course} · {PROFILE.location}
          </p>
        </motion.header>

        {/* ---------- Actions ---------- */}
        <motion.div
          {...stagger(1)}
          className="mt-7 flex flex-wrap items-center gap-2.5 sm:gap-3"
        >
          <a
            href={PROFILE.cvPath}
            className="inline-flex items-center gap-2 rounded-lg bg-[rgb(var(--fg-0))] px-4 py-2.5 text-sm font-semibold text-[rgb(var(--bg-0))] transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Download CV
          </a>

          <a
            href={`mailto:${PROFILE.email}`}
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium text-[rgb(var(--fg-0))] transition-colors hover:border-white/30 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            {PROFILE.email}
          </a>

          <a
            href={`tel:${PROFILE.phoneHref}`}
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium text-[rgb(var(--fg-0))] transition-colors hover:border-white/30 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            <span>{PROFILE.phone}</span>
          </a>

          <a
            href={PROFILE.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="inline-flex items-center justify-center rounded-lg border border-white/15 p-2.5 text-[rgb(var(--fg-0))] transition-colors hover:border-white/30 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            <Linkedin className="h-4 w-4" aria-hidden="true" />
          </a>

          <a
            href={PROFILE.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="inline-flex items-center justify-center rounded-lg border border-white/15 p-2.5 text-[rgb(var(--fg-0))] transition-colors hover:border-white/30 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            <Github className="h-4 w-4" aria-hidden="true" />
          </a>
        </motion.div>

        {/* ---------- Stats ---------- */}
        <motion.dl
          {...stagger(2)}
          className="mt-10 grid grid-cols-2 gap-x-4 gap-y-6 border-y border-white/10 py-6 sm:grid-cols-4 sm:gap-x-6"
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
        </motion.dl>

        {/* ---------- Projects ---------- */}
        <section className="mt-12" aria-labelledby="work-heading">
          <motion.h2
            {...stagger(3)}
            id="work-heading"
            className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-[rgb(var(--fg-1))]/60"
          >
            Selected work
          </motion.h2>

          <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
            {PROJECTS.map((project, i) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={i + 4}
                reduced={reduced}
              />
            ))}
          </div>
        </section>

        {/* ---------- Affiliations ---------- */}
        <motion.section
          {...stagger(9)}
          className="mt-12"
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
        </motion.section>

        {/* ---------- Deeper ---------- */}
        <motion.section
          {...stagger(10)}
          className="mt-12"
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
                className="group flex items-center justify-between gap-3 rounded-lg border border-white/10 px-4 py-3 transition-colors hover:border-white/25 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
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
        </motion.section>
      </Container>
    </>
  );
}
