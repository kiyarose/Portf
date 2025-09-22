import { useId, useMemo } from "react";
import { Icon } from "@iconify/react";
import { motion, useReducedMotion } from "framer-motion";
import { ScrollSpy } from "./components/ScrollSpy";
import { ThemeToggle } from "./components/ThemeToggle";
import { MobileNav } from "./components/MobileNav";
import { AboutSection } from "./sections/AboutSection";
import { CertificationsSection } from "./sections/CertificationsSection";
import { ContactSection } from "./sections/ContactSection";
import { EducationSection } from "./sections/EducationSection";
import { ExperienceSection } from "./sections/ExperienceSection";
import { HeroSection } from "./sections/HeroSection";
import { ProjectsSection } from "./sections/ProjectsSection";
import { SkillsSection } from "./sections/SkillsSection";
import { generateBuildLabel } from "./data/build";
import { useTheme } from "./hooks/useTheme";
import type { Theme } from "./providers/theme-context";
import { themedClass } from "./utils/themeClass";

const sections = [
  { id: "hero", label: "Home", icon: "material-symbols:home-rounded" },
  { id: "about", label: "About", icon: "material-symbols:person-rounded" },
  {
    id: "experience",
    label: "Experience",
    icon: "material-symbols:work-rounded",
  },
  {
    id: "education",
    label: "Education",
    icon: "material-symbols:school-rounded",
  },
  {
    id: "certifications",
    label: "Certifications",
    icon: "material-symbols:workspace-premium-rounded",
  },
  {
    id: "projects",
    label: "Hobby Builds",
    icon: "material-symbols:rocket-launch-rounded",
  },
  {
    id: "skills",
    label: "Skills",
    icon: "material-symbols:auto-awesome-rounded",
  },
  {
    id: "contact",
    label: "Contact",
    icon: "material-symbols:contact-mail-rounded",
  },
];

function DecorativeBackground({ theme }: { theme: Theme }) {
  const prefersReducedMotion = useReducedMotion();
  const topGlowClass = themedClass(
    theme,
    "bg-orange-400/30",
    "bg-accent/30",
  );
  const bottomGlowClass = themedClass(
    theme,
    "bg-rose-400/20",
    "bg-indigo-500/20",
  );
  return (
    <>
      <motion.div
        className={`pointer-events-none absolute inset-x-0 -top-40 mx-auto h-[520px] w-[520px] rounded-full blur-3xl ${topGlowClass}`}
        animate={
          prefersReducedMotion ? undefined : { opacity: [0.35, 0.6, 0.35] }
        }
        transition={{
          repeat: prefersReducedMotion ? 0 : Infinity,
          duration: 18,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className={`pointer-events-none absolute bottom-10 left-[10%] h-64 w-64 rounded-full blur-3xl ${bottomGlowClass}`}
        animate={prefersReducedMotion ? undefined : { y: [0, -12, 0] }}
        transition={{
          repeat: prefersReducedMotion ? 0 : Infinity,
          duration: 12,
          ease: "easeInOut",
        }}
      />
    </>
  );
}

export default function App() {
  const { theme } = useTheme();
  return (
    <div className="relative min-h-screen overflow-hidden">
      <DecorativeBackground theme={theme} />
      <SiteHeader theme={theme} />
      <ScrollSpy sections={sections} />
      <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-16 pt-6 sm:gap-12">
        <HeroSection />
        <AboutSection />
        <ExperienceSection />
        <EducationSection />
        <CertificationsSection />
        <ProjectsSection />
        <SkillsSection />
        <ContactSection />
      </main>
      <SiteFooter theme={theme} />
    </div>
  );
}

function SiteHeader({ theme }: { theme: Theme }) {
  const headerSurface = themedClass(
    theme,
    "bg-white/75",
    "bg-slate-950/70",
  );
  return (
    <header
      className={`sticky top-0 z-20 border-b border-white/10 ${headerSurface} backdrop-blur-xl transition`}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:gap-4 sm:py-4">
        <LogoLink theme={theme} />
        <div className="flex items-center gap-4">
          <PrimaryNav theme={theme} />
          <MobileNav sections={sections} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

function LogoLink({ theme }: { theme: Theme }) {
  const labelColor = themedClass(
    theme,
    "text-slate-600",
    "text-slate-300",
  );
  return (
    <a
      href="#hero"
      className={`flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] ${labelColor} sm:gap-3`}
    >
      <Icon
        icon="material-symbols:apps-rounded"
        className="text-xl text-accent sm:text-2xl"
        aria-hidden="true"
      />
      <span className="font-kiya">Kiya Rose</span>
    </a>
  );
}

function PrimaryNav({ theme }: { theme: Theme }) {
  const navSurface = themedClass(
    theme,
    "bg-white/70",
    "bg-slate-900/70",
  );
  const linkColor = themedClass(theme, "text-slate-600", "text-slate-300");
  return (
    <nav
      className={`hidden items-center gap-2 rounded-full ${navSurface} px-2 py-1.5 shadow-md backdrop-blur md:flex`}
    >
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition hover:bg-accent/10 hover:text-accent ${linkColor}`}
        >
          <Icon icon={section.icon} className="text-lg" aria-hidden="true" />
          {section.label}
        </a>
      ))}
    </nav>
  );
}

function SiteFooter({ theme }: { theme: Theme }) {
  const currentYear = new Date().getFullYear();
  // Tag the current view with a build label: prefix notes last edit, suffix marks this render.
  const buildLabel = useMemo(() => generateBuildLabel(), []);
  const buildTooltipId = useId();
  const footerSurface = themedClass(
    theme,
    "bg-white/50 text-slate-500",
    "bg-slate-950/70 text-slate-400",
  );

  return (
    <footer
      className={`border-t border-white/10 py-6 text-center text-sm backdrop-blur ${footerSurface}`}
    >
      <FooterContent
        currentYear={currentYear}
        buildLabel={buildLabel}
        tooltipId={buildTooltipId}
        theme={theme}
      />
    </footer>
  );
}

type FooterContentProps = {
  currentYear: number;
  buildLabel: string;
  tooltipId: string;
};

function FooterContent({
  currentYear,
  buildLabel,
  tooltipId,
  theme,
}: FooterContentProps & { theme: Theme }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 sm:flex-row sm:flex-wrap sm:gap-3">
      <FooterBranding currentYear={currentYear} theme={theme} />
      <FooterAttribution theme={theme} />
      <FooterBuildLabel label={buildLabel} tooltipId={tooltipId} theme={theme} />
    </div>
  );
}

function FooterBranding({
  currentYear,
  theme,
}: {
  currentYear: number;
  theme: Theme;
}) {
  const brandingColor = themedClass(
    theme,
    "text-slate-600",
    "text-slate-300",
  );
  return (
    <span className={`inline-flex items-center gap-1 ${brandingColor}`}>
      <span className="text-base text-accent">©</span>
      <span>{currentYear}</span>
      <span className="font-kiya">Kiya Rose</span>
    </span>
  );
}

function FooterAttribution({ theme }: { theme: Theme }) {
  const attributionColor = themedClass(
    theme,
    "text-slate-500",
    "text-slate-400",
  );
  return (
    <span className={attributionColor}>
      Crafted with React, Tailwind CSS, and Firebase.
    </span>
  );
}

function FooterBuildLabel({
  label,
  tooltipId,
  theme,
}: {
  label: string;
  tooltipId: string;
  theme: Theme;
}) {
  const labelColor = themedClass(
    theme,
    "text-slate-400",
    "text-slate-500",
  );
  return (
    <button
      type="button"
      className="group relative inline-flex cursor-help border-0 bg-transparent p-0 outline-none"
      aria-describedby={tooltipId}
    >
      <span
        className={`text-xs uppercase tracking-[0.3em] transition group-hover:text-accent group-focus-visible:text-accent ${labelColor}`}
      >
        {label}
      </span>
      <FooterBuildTooltip tooltipId={tooltipId} theme={theme} />
    </button>
  );
}

function FooterBuildTooltip({
  tooltipId,
  theme,
}: {
  tooltipId: string;
  theme: Theme;
}) {
  const tooltipSurface = themedClass(
    theme,
    "bg-white/90 text-slate-600 ring-black/5",
    "bg-slate-900/90 text-slate-200 ring-white/10",
  );
  const dividerColor = themedClass(theme, "text-slate-400", "text-slate-500");
  const metaColor = themedClass(theme, "text-slate-500", "text-slate-300");
  return (
    <span
      id={tooltipId}
      role="tooltip"
      className={`pointer-events-none absolute bottom-full left-1/2 hidden w-max -translate-x-1/2 -translate-y-3 rounded-2xl px-3 py-2 text-[11px] font-medium shadow-lg ring-1 backdrop-blur group-hover:flex group-focus-visible:flex ${tooltipSurface}`}
    >
      <span className="font-semibold text-accent">Prefix</span>
      <span className={`mx-1 ${dividerColor}`}>|</span>
      <span className="font-semibold text-rose-400">Suffix</span>
      <span className={`ml-1 ${metaColor}`}>
        Last update · Latest refresh
      </span>
    </span>
  );
}
