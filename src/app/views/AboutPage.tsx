import { motion } from "framer-motion";
import { TAGS } from "../../content/meta";
import { clsx } from "clsx";
import SEOHead from "../../components/ui/SEOHead";

export default function AboutPage() {
  return (
    <>
      <SEOHead title="About" />
      <div className="min-h-[100dvh] py-12 px-6 md:px-12 lg:px-16 pb-24">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-16">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[rgb(var(--fg-0))] mb-4"
        >
          About
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-lg md:text-xl text-[rgb(var(--fg-1))] max-w-2xl leading-relaxed"
        >
          A journey shaped by identity, driven by bridge-building, and expressed through making.
        </motion.p>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
        {/* Identity */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="glass rounded-lg border border-line/10 p-8 md:p-12 lg:p-16 backdrop-blur-xl"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-[rgb(var(--fg-0))] mb-6">
            Identity
          </h2>
          <p className="text-base md:text-lg text-[rgb(var(--fg-1))] leading-relaxed max-w-prose">
            Growing up at the intersection of cultures, languages, and perspectives, I learned early that identity isn't a fixed point—it's a dynamic space where different worlds converge. This multiplicity isn't a challenge to resolve, but a source of strength and insight. It's taught me to see connections where others see boundaries, to find common ground in seemingly disparate places, and to build bridges not despite differences, but because of them.
          </p>
        </motion.section>

        {/* Bridge-building */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass rounded-lg border border-line/10 p-8 md:p-12 lg:p-16 backdrop-blur-xl"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-[rgb(var(--fg-0))] mb-6">
            Bridge-building
          </h2>
          <p className="text-base md:text-lg text-[rgb(var(--fg-1))] leading-relaxed max-w-prose mb-6">
            The work I'm drawn to isn't about choosing sides—it's about creating spaces where different perspectives can coexist and collaborate. Whether through research that opens new pathways, ventures that connect communities, or teaching that empowers others, the thread that runs through everything is bridge-building. It's the belief that the most interesting solutions emerge when we bring together what seems separate, when we translate between worlds, and when we create systems that work for everyone.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div className="p-4 rounded-lg bg-ink/5 border border-line/10">
              <h3 className="text-lg font-semibold text-[rgb(var(--fg-0))] mb-2">Research</h3>
              <p className="text-sm text-[rgb(var(--fg-1))]">
                Opening doors through innovation and creating opportunities for others to follow.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-ink/5 border border-line/10">
              <h3 className="text-lg font-semibold text-[rgb(var(--fg-0))] mb-2">Community</h3>
              <p className="text-sm text-[rgb(var(--fg-1))]">
                Building networks of support and creating spaces where everyone can thrive.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Maker Mindset */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass rounded-lg border border-line/10 p-8 md:p-12 lg:p-16 backdrop-blur-xl"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-[rgb(var(--fg-0))] mb-6">
            Maker Mindset
          </h2>
          <p className="text-base md:text-lg text-[rgb(var(--fg-1))] leading-relaxed max-w-prose mb-6">
            Ideas are only as powerful as their execution. The maker mindset is about turning vision into reality—whether that's code, research, ventures, or movements. It's the discipline of craft, the patience to iterate, and the courage to build even when the path isn't clear. This isn't just about creating things; it's about creating things that matter, that solve real problems, and that leave the world better than we found it.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="p-4 rounded-lg bg-ink/5 border border-line/10">
              <h3 className="text-lg font-semibold text-[rgb(var(--fg-0))] mb-2">Craft</h3>
              <p className="text-sm text-[rgb(var(--fg-1))]">
                Excellence through iteration, attention to detail, and continuous learning.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-ink/5 border border-line/10">
              <h3 className="text-lg font-semibold text-[rgb(var(--fg-0))] mb-2">Movement</h3>
              <p className="text-sm text-[rgb(var(--fg-1))]">
                Finding clarity and purpose through physical expression and motion.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-ink/5 border border-line/10">
              <h3 className="text-lg font-semibold text-[rgb(var(--fg-0))] mb-2">Entrepreneurship</h3>
              <p className="text-sm text-[rgb(var(--fg-1))]">
                Building solutions that create value and drive meaningful impact.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Values */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="glass rounded-lg border border-line/10 p-8 md:p-12 lg:p-16 backdrop-blur-xl"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-[rgb(var(--fg-0))] mb-6">
            Values
          </h2>
          <div className="flex flex-wrap gap-3 md:gap-4">
            {TAGS.map((tag, index) => (
              <motion.span
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className={clsx(
                  "px-4 py-2 md:px-6 md:py-3 rounded-full",
                  "bg-ink/5 hover:bg-ink/10 border border-line/10 hover:border-line/20",
                  "text-base md:text-lg font-medium text-[rgb(var(--fg-0))]",
                  "transition-all cursor-default"
                )}
              >
                {tag}
              </motion.span>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
    </>
  );
}
