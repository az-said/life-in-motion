import { motion } from "framer-motion";
import { Linkedin, Mail, Github, ExternalLink } from "lucide-react";
import { clsx } from "clsx";
import SEOHead from "../../components/ui/SEOHead";
import Avatar from "../../components/ui/Avatar";

export default function ContactPage() {
  return (
    <>
      <SEOHead title="Contact" />
      <div className="min-h-[100dvh] py-12 px-6 md:px-12 lg:px-16 pb-24 flex items-center justify-center">
      <div className="max-w-4xl mx-auto w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <div className="flex flex-col items-center gap-6 mb-6">
            <Avatar
              src="/images/profile/hero.JPEG"
              alt="Said Azaizah"
              size="w-16 h-16 md:w-20 md:h-20"
            />
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[rgb(var(--fg-0))] mb-4">
                Get in Touch
              </h1>
              <p className="text-lg md:text-xl text-[rgb(var(--fg-1))] max-w-2xl mx-auto leading-relaxed">
                Let's connect and explore possibilities together.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Contact Methods */}
        <div className="space-y-6 mb-12">
          {/* LinkedIn */}
          <motion.a
            href="https://www.linkedin.com/in/said-azaizah/"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            whileHover={{ scale: 1.02, y: -3 }}
            whileTap={{ scale: 0.98, y: 0 }}
            className={clsx(
              "group relative flex items-center justify-between gap-6",
              "glass rounded-lg border border-white/10 p-6 md:p-8",
              "backdrop-blur-xl transition-all duration-200 ease-out",
              "hover:border-white/20 hover:bg-white/5",
              "hover:shadow-[0_4px_16px_rgba(120,220,255,0.15)]",
              "focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-transparent"
            )}
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex-shrink-0">
                <Linkedin className="w-6 h-6 text-[rgb(var(--fg-0))] group-hover:text-[rgb(var(--accent))] transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl md:text-2xl font-semibold text-[rgb(var(--fg-0))] mb-1">
                  LinkedIn
                </h3>
                <p className="text-sm md:text-base text-[rgb(var(--fg-1))] truncate">
                  Professional network and updates
                </p>
              </div>
            </div>
            <ExternalLink className="w-5 h-5 text-[rgb(var(--fg-1))] group-hover:text-[rgb(var(--accent))] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all flex-shrink-0" />
          </motion.a>

          {/* GitHub */}
          <motion.a
            href="https://github.com/az-said/"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            whileHover={{ scale: 1.02, y: -3 }}
            whileTap={{ scale: 0.98, y: 0 }}
            className={clsx(
              "group relative flex items-center justify-between gap-6",
              "glass rounded-lg border border-white/10 p-6 md:p-8",
              "backdrop-blur-xl transition-all duration-200 ease-out",
              "hover:border-white/20 hover:bg-white/5",
              "hover:shadow-[0_4px_16px_rgba(120,220,255,0.15)]",
              "focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-transparent"
            )}
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex-shrink-0">
                <Github className="w-6 h-6 text-[rgb(var(--fg-0))] group-hover:text-[rgb(var(--accent))] transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl md:text-2xl font-semibold text-[rgb(var(--fg-0))] mb-1">
                  GitHub
                </h3>
                <p className="text-sm md:text-base text-[rgb(var(--fg-1))] truncate">
                  Code and projects
                </p>
              </div>
            </div>
            <ExternalLink className="w-5 h-5 text-[rgb(var(--fg-1))] group-hover:text-[rgb(var(--accent))] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all flex-shrink-0" />
          </motion.a>

          {/* Email */}
          <motion.a
            href="mailto:az.said2007@gmail.com"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ scale: 1.02, y: -3 }}
            whileTap={{ scale: 0.98, y: 0 }}
            className={clsx(
              "group relative flex items-center justify-between gap-6",
              "glass rounded-lg border border-white/10 p-6 md:p-8",
              "backdrop-blur-xl transition-all duration-200 ease-out",
              "hover:border-white/20 hover:bg-white/5",
              "hover:shadow-[0_4px_16px_rgba(120,220,255,0.15)]",
              "focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-transparent"
            )}
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex-shrink-0">
                <Mail className="w-6 h-6 text-[rgb(var(--fg-0))] group-hover:text-[rgb(var(--accent))] transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl md:text-2xl font-semibold text-[rgb(var(--fg-0))] mb-1">
                  Email
                </h3>
                <p className="text-sm md:text-base text-[rgb(var(--fg-1))] truncate">
                  Direct communication
                </p>
              </div>
            </div>
            <ExternalLink className="w-5 h-5 text-[rgb(var(--fg-1))] group-hover:text-[rgb(var(--accent))] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all flex-shrink-0" />
          </motion.a>
        </div>

        {/* Social Media Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="glass rounded-lg border border-white/10 p-6 md:p-8 backdrop-blur-xl text-center"
        >
          <p className="text-base md:text-lg text-[rgb(var(--fg-0))] leading-relaxed">
            <span className="font-medium">Note:</span> I don't have Instagram or TikTok—and I'm proud of it.{" "}
            <span className="text-[rgb(var(--fg-1))]">
              Quality connections over quantity.
            </span>
          </p>
        </motion.div>
      </div>
    </div>
    </>
  );
}
