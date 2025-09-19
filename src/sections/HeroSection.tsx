import { motion, useReducedMotion } from "framer-motion";
import { socials } from "../data/socials";
import { SectionContainer } from "../components/SectionContainer";
import { SocialChip } from "../components/SocialChip";

type HeroCardProps = {
  prefersReducedMotion: boolean;
};

function HeroCard({ prefersReducedMotion }: HeroCardProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/90 via-white/70 to-accent/10 p-10 shadow-card backdrop-blur-lg dark:from-slate-900/90 dark:via-slate-900/70 dark:to-indigo-500/10">
      <motion.div
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 24 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col gap-6"
      >
        <span className="chip !bg-accent/15 !text-accent dark:!bg-accent/20 text-sm font-medium uppercase tracking-wide">
          Hello, I’m Kiya Rose
        </span>
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-white md:text-6xl">
            IT Professional Pursuing Medical Billing and Coding
          </h1>
          <p className="max-w-2xl text-lg text-slate-600 dark:text-slate-300">
            I build thoughtful digital experiences, blending technical support,
            customer care, and emerging medical administration skills.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {socials.map((social) => (
            <SocialChip key={social.id} {...social} />
          ))}
        </div>
      </motion.div>
      <motion.div
        className="absolute -right-10 -top-10 hidden h-48 w-48 rounded-full bg-accent/20 blur-3xl md:block dark:bg-accent/30"
        animate={prefersReducedMotion ? undefined : { scale: [1, 1.1, 1] }}
        transition={{ repeat: prefersReducedMotion ? 0 : Infinity, duration: 10, ease: "easeInOut" }}
      />
    </div>
  );
}

export function HeroSection() {
  const prefersReducedMotion = useReducedMotion() ?? false;

  return (
    <SectionContainer id="hero" className="pt-32 pb-20">
      <HeroCard prefersReducedMotion={prefersReducedMotion} />
    </SectionContainer>
  );
}
