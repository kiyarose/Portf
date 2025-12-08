import { Icon } from "@iconify/react";
import { useReducedMotion } from "framer-motion";
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
import { useTheme } from "./hooks/useTheme";
import type { Theme } from "./providers/theme-context";
import { themedClass } from "./utils/themeClass";
import { DecorativeBackground } from "./components/DecorativeBackground";
import { SiteFooter } from "./components/SiteFooter";
import { FeedbackBubble } from "./components/FeedbackBubble";
import AdminHint from "./components/AdminHint";
import { useAnimatedScroll } from "./hooks/useAnimatedScroll";

const sections = [
  { id: "hero", label: "Home", icon: "material-symbols:home-rounded" },
  { id: "about", label: "About", icon: "material-symbols:person-rounded" },
  {
    id: "experience",
    label: "Experience",
    icon: "material-symbols:work",
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
      <SiteFooter />
      <FeedbackBubble />
    </div>
  );
}

function SiteHeader({ theme }: { theme: Theme }) {
  const headerSurface = themedClass(theme, "bg-white/75", "bg-slate-950/70");
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
  const labelColor = themedClass(theme, "text-slate-600", "text-slate-300");
  const { scrollToElement } = useAnimatedScroll({ offset: -80 });

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    scrollToElement("hero");
  };

  return (
    <a
      href="#hero"
      onClick={handleClick}
      className={`flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] ${labelColor} sm:gap-3`}
    >
      <Icon
        icon="material-symbols:apps-rounded"
        className="text-xl text-accent sm:text-2xl"
        aria-hidden="true"
      />
      <AdminHint>Kiya Rose</AdminHint>
    </a>
  );
}

function PrimaryNav({ theme }: { theme: Theme }) {
  const navSurface = themedClass(theme, "bg-white/70", "bg-slate-900/70");
  const linkColor = themedClass(theme, "text-slate-600", "text-slate-300");
  const prefersReducedMotion = useReducedMotion();
  const hoverScale = prefersReducedMotion ? "" : "hover:scale-105";
  const { scrollToElement } = useAnimatedScroll({ offset: -80 });

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    scrollToElement(sectionId);
  };

  return (
    <nav
      className={`hidden items-center gap-2 rounded-full ${navSurface} px-2 py-1.5 shadow-md backdrop-blur md:flex`}
    >
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          onClick={(e) => handleNavClick(e, section.id)}
          className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-all duration-200 ${hoverScale} hover:bg-accent/10 hover:text-accent hover:shadow-lg hover:shadow-accent/20 ${linkColor}`}
        >
          <Icon icon={section.icon} className="text-lg" aria-hidden="true" />
          {section.label}
        </a>
      ))}
    </nav>
  );
}
