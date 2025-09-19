import { Icon } from "@iconify/react";
import { motion, useReducedMotion } from "framer-motion";
import { ScrollSpy } from "./components/ScrollSpy";
import { ThemeToggle } from "./components/ThemeToggle";
import { AboutSection } from "./sections/AboutSection";
import { CertificationsSection } from "./sections/CertificationsSection";
import { ContactSection } from "./sections/ContactSection";
import { EducationSection } from "./sections/EducationSection";
import { HeroSection } from "./sections/HeroSection";
import { ProjectsSection } from "./sections/ProjectsSection";
import { SkillsSection } from "./sections/SkillsSection";

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
  { id: "skills", label: "Skills", icon: "material-symbols:sparkles-rounded" },
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
        className="pointer-events-none absolute inset-x-0 -top-40 mx-auto h-[520px] w-[520px] rounded-full bg-accent/20 blur-3xl dark:bg-accent/30"
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
        className="pointer-events-none absolute bottom-10 left-[10%] h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-500/20"
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
      <header className="sticky top-0 z-20 border-b border-white/10 bg-white/75 backdrop-blur-xl transition dark:bg-slate-950/70">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <a
            href="#hero"
            className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300"
          >
            <Icon
              icon="material-symbols:apps-rounded"
              className="text-2xl text-accent"
              aria-hidden="true"
            />
            <span className="font-kiya">Kiya Rose</span>
          </a>
          <nav className="hidden items-center gap-2 rounded-full bg-white/70 px-2 py-1.5 shadow-md backdrop-blur dark:bg-slate-900/70 md:flex">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-accent/10 hover:text-accent dark:text-slate-300"
              >
                <Icon
                  icon={section.icon}
                  className="text-lg"
                  aria-hidden="true"
                />
                {section.label}
              </a>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </header>
      <ScrollSpy sections={sections} />
      <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pb-16 pt-6">
        <HeroSection />
        <AboutSection />
        <EducationSection />
        <CertificationsSection />
        <ProjectsSection />
        <SkillsSection />
        <ContactSection />
      </main>
      <footer className="border-t border-white/10 bg-white/50 py-6 text-center text-sm text-slate-500 backdrop-blur dark:bg-slate-950/70 dark:text-slate-400">
        © {new Date().getFullYear()} <span className="font-kiya">Kiya Rose</span>. Crafted with React, Tailwind
        CSS, and Firebase.
      </footer>
    </div>
  );
}
