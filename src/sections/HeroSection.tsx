import { motion, useReducedMotion } from "framer-motion";
import {
  SOCIALS_RESOURCE,
  socialsFallback,
  socialsPlaceholder,
  type SocialLink,
} from "../data/socials";
import { SectionContainer } from "../components/SectionContainer";
import AdminHint from "../components/AdminHint";
import { SocialChip } from "../components/SocialChip";
import { useTheme } from "../hooks/useTheme";
import { useTranslation } from "../hooks/useTranslation";
import { useRemoteData } from "../hooks/useRemoteData";
import type { Theme } from "../providers/theme-context";
import { themedClass } from "../utils/themeClass";
import { cn } from "../utils/cn";

type HeroCardProps = {
  prefersReducedMotion: boolean;
  theme: Theme;
  socialLinks: SocialLink[];
  t: ReturnType<typeof useTranslation>["t"];
};

function HeroCard({
  prefersReducedMotion,
  theme,
  socialLinks,
  t,
}: HeroCardProps) {
  const surfaceGradient = themedClass(
    theme,
    "from-white/90 via-[#ffe9f2]/80 to-accent/15",
    "from-slate-900/90 via-slate-900/70 to-indigo-500/10",
  );
  const greetingChip = themedClass(theme, "!bg-accent/15", "!bg-accent/20");
  const headlineColor = themedClass(theme, "text-slate-900", "text-white");
  const blurbColor = themedClass(theme, "text-slate-600", "text-slate-300");
  const accentOrb = themedClass(theme, "bg-accent/30", "bg-accent/30");
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl bg-gradient-to-br p-10 shadow-card backdrop-blur-lg",
        surfaceGradient,
      )}
    >
      <motion.div
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 24 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col gap-6"
      >
        <span
          className={cn(
            "chip !text-accent text-sm font-medium uppercase tracking-wide",
            greetingChip,
          )}
        >
          {t.hero.greeting} <AdminHint>{t.hero.name}</AdminHint>! {t.hero.wave}
        </span>
        <div className="space-y-4">
          <h1
            className={cn(
              "text-4xl font-semibold tracking-tight md:text-6xl",
              headlineColor,
            )}
          >
            {t.hero.headline}
          </h1>
          <p className={cn("max-w-2xl text-lg", blurbColor)}>
            {t.hero.description}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {socialLinks.map((social) => (
            <SocialChip key={social.id} {...social} />
          ))}
        </div>
      </motion.div>
      <motion.div
        className={cn(
          "absolute -right-10 -top-10 hidden h-48 w-48 rounded-full blur-3xl md:block",
          accentOrb,
        )}
        animate={prefersReducedMotion ? undefined : { scale: [1, 1.1, 1] }}
        transition={{
          repeat: prefersReducedMotion ? 0 : Infinity,
          duration: 10,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

export function HeroSection() {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { data: socialLinks, debugAttributes: socialDebugAttributes } =
    useRemoteData<SocialLink[]>({
      resource: SOCIALS_RESOURCE,
      fallbackData: socialsFallback,
      placeholderData: socialsPlaceholder,
    });

  return (
    <SectionContainer
      id="hero"
      className="pt-32 pb-20"
      debugAttributes={socialDebugAttributes}
    >
      <HeroCard
        prefersReducedMotion={prefersReducedMotion}
        theme={theme}
        socialLinks={socialLinks}
        t={t}
      />
    </SectionContainer>
  );
}
