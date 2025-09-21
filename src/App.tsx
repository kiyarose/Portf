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
import { HeroSection } from "./sections/HeroSection";
import { ProjectsSection } from "./sections/ProjectsSection";
import { SkillsSection } from "./sections/SkillsSection";
import { generateBuildLabel } from "./data/build";

const sections = [
  { id: "hero", label: "Home", icon: "material-symbols:home-rounded" },
  { id: "about", label: "About", icon: "material-symbols:person-rounded" },
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

function DecorativeBackground() {
  const prefersReducedMotion = useReducedMotion();
  return (
    <>
      <motion.div
        className="pointer-events-none absolute inset-x-0 -top-40 mx-auto h-[520px] w-[520px] rounded-full bg-orange-400/30 blur-3xl dark:bg-accent/30"
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
        className="pointer-events-none absolute bottom-10 left-[10%] h-64 w-64 rounded-full bg-rose-400/20 blur-3xl dark:bg-indigo-500/20"
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
  return (
    <div className="relative min-h-screen overflow-hidden">
      <DecorativeBackground />
      <SiteHeader />
      <ScrollSpy sections={sections} />
      <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-16 pt-6 sm:gap-12">
        <HeroSection />
        <AboutSection />
        <EducationSection />
        <CertificationsSection />
        <ProjectsSection />
        <SkillsSection />
        <ContactSection />
      </main>
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-white/75 backdrop-blur-xl transition dark:bg-slate-950/70">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:gap-4 sm:py-4">
        <LogoLink />
        <div className="flex items-center gap-4">
          <PrimaryNav />
          <MobileNav sections={sections} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

function LogoLink() {
  return (
    <a
      href="#hero"
      className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300 sm:gap-3"
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

function PrimaryNav() {
  return (
    <nav className="hidden items-center gap-2 rounded-full bg-white/70 px-2 py-1.5 shadow-md backdrop-blur dark:bg-slate-900/70 md:flex">
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-accent/10 hover:text-accent dark:text-slate-300"
        >
          <Icon icon={section.icon} className="text-lg" aria-hidden="true" />
          {section.label}
        </a>
      ))}
    </nav>
  );
}

function SiteFooter() {
  const currentYear = new Date().getFullYear();
  // Tag the current view with a build label: prefix notes last edit, suffix marks this render.
  const buildLabel = useMemo(() => generateBuildLabel(), []);
  const buildTooltipId = useId();

  return (
    <footer className="border-t border-white/10 bg-white/50 py-6 text-center text-sm text-slate-500 backdrop-blur dark:bg-slate-950/70 dark:text-slate-400">
<<<<<<< Updated upstream
      <div className="flex flex-col items-center justify-center gap-1 sm:flex-row sm:flex-wrap sm:gap-3">
        <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300">
          <span className="text-base text-accent">©</span>
          <span>{currentYear}</span>
          <span className="font-kiya">Kiya Rose</span>
        </span>
        <span className="text-slate-500 dark:text-slate-400">
          Crafted with React, Tailwind CSS, and Firebase.
        </span>
        {/* Surface the build label so viewers can see the last edit (prefix) and this refresh (suffix). */}
        <span
          className="group relative inline-flex cursor-help outline-none"
          tabIndex={0}
          aria-describedby={buildTooltipId}
        >
          <span className="text-xs uppercase tracking-[0.3em] text-slate-400 transition group-hover:text-accent group-focus-visible:text-accent dark:text-slate-500">
            {buildLabel}
          </span>
          <span
            id={buildTooltipId}
            role="tooltip"
            className="pointer-events-none absolute bottom-full left-1/2 hidden w-max -translate-x-1/2 -translate-y-3 rounded-2xl bg-white/90 px-3 py-2 text-[11px] font-medium text-slate-600 shadow-lg ring-1 ring-black/5 backdrop-blur group-hover:flex group-focus-visible:flex dark:bg-slate-900/90 dark:text-slate-200 dark:ring-white/10"
          >
            <span className="font-semibold text-accent">Prefix</span>
            <span className="mx-1 text-slate-400">|</span>
            <span className="font-semibold text-rose-400">Suffix</span>
            <span className="ml-1 text-slate-500 dark:text-slate-300">
              Last update · Latest refresh
            </span>
          </span>
        </span>
      </div>
=======
      <FooterContent
        currentYear={currentYear}
        buildLabel={buildLabel}
        tooltipId={buildTooltipId}
      />
>>>>>>> Stashed changes
    </footer>
  );
}

type FooterContentProps = {
  currentYear: number;
  buildLabel: string;
  tooltipId: string;
};

function FooterContent({ currentYear, buildLabel, tooltipId }: FooterContentProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 sm:flex-row sm:flex-wrap sm:gap-3">
      <FooterBranding currentYear={currentYear} />
      <FooterAttribution />
      <FooterBuildLabel label={buildLabel} tooltipId={tooltipId} />
    </div>
  );
}

function FooterBranding({ currentYear }: { currentYear: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300">
      <span className="text-base text-accent">©</span>
      <span>{currentYear}</span>
      <span className="font-kiya">Kiya Rose</span>
    </span>
  );
}

function FooterAttribution() {
  return (
    <span className="text-slate-500 dark:text-slate-400">
      Crafted with React, Tailwind CSS, and Firebase.
    </span>
  );
}

function FooterBuildLabel({
  label,
  tooltipId,
}: {
  label: string;
  tooltipId: string;
}) {
  return (
    <button
      type="button"
      className="group relative inline-flex cursor-help border-0 bg-transparent p-0 outline-none"
      aria-describedby={tooltipId}
    >
      <span className="text-xs uppercase tracking-[0.3em] text-slate-400 transition group-hover:text-accent group-focus-visible:text-accent dark:text-slate-500">
        {label}
      </span>
      <FooterBuildTooltip tooltipId={tooltipId} />
    </button>
  );
}

function FooterBuildTooltip({ tooltipId }: { tooltipId: string }) {
  return (
    <span
      id={tooltipId}
      role="tooltip"
      className="pointer-events-none absolute bottom-full left-1/2 hidden w-max -translate-x-1/2 -translate-y-3 rounded-2xl bg-white/90 px-3 py-2 text-[11px] font-medium text-slate-600 shadow-lg ring-1 ring-black/5 backdrop-blur group-hover:flex group-focus-visible:flex dark:bg-slate-900/90 dark:text-slate-200 dark:ring-white/10"
    >
      <span className="font-semibold text-accent">Prefix</span>
      <span className="mx-1 text-slate-400">|</span>
      <span className="font-semibold text-rose-400">Suffix</span>
      <span className="ml-1 text-slate-500 dark:text-slate-300">
        Last update · Latest refresh
      </span>
    </span>
  );
}
