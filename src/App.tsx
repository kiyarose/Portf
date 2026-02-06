import { Icon } from "@iconify/react";
import { useReducedMotion } from "framer-motion";
import { useCallback } from "react";
import { ScrollSpy } from "./components/ScrollSpy";
import { ThemeToggle } from "./components/ThemeToggle";
import { LanguageToggle } from "./components/LanguageToggle";
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
import { useTranslation } from "./hooks/useTranslation";
import type { Theme } from "./providers/theme-context";
import { themedClass } from "./utils/themeClass";
import { DecorativeBackground } from "./components/DecorativeBackground";
import { SiteFooter } from "./components/SiteFooter";
import { FeedbackBubble } from "./components/FeedbackBubble";
import AdminHint from "./components/AdminHint";
import { useAnimatedScroll } from "./hooks/useAnimatedScroll";

export default function App() {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const sections = [
    { id: "hero", label: t.nav.home, icon: "material-symbols:home-rounded" },
    {
      id: "about",
      label: t.nav.about,
      icon: "material-symbols:person-rounded",
    },
    {
      id: "experience",
      label: t.nav.experience,
      icon: "material-symbols:work",
    },
    {
      id: "education",
      label: t.nav.education,
      icon: "material-symbols:school-rounded",
    },
    {
      id: "certifications",
      label: t.nav.certifications,
      icon: "material-symbols:workspace-premium-rounded",
    },
    {
      id: "projects",
      label: t.nav.projects,
      icon: "material-symbols:rocket-launch-rounded",
    },
    {
      id: "skills",
      label: t.nav.skills,
      icon: "material-symbols:auto-awesome-rounded",
    },
    {
      id: "contact",
      label: t.nav.contact,
      icon: "material-symbols:contact-mail-rounded",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      <DecorativeBackground theme={theme} />
      <SiteHeader theme={theme} sections={sections} />
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

function SiteHeader({
  theme,
  sections,
}: {
  theme: Theme;
  sections: { id: string; label: string; icon: string }[];
}) {
  const headerSurface = themedClass(theme, "bg-white/75", "bg-slate-950/70");
  return (
    <header
      className={`sticky top-0 z-20 border-b border-white/10 ${headerSurface} backdrop-blur-xl transition`}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:gap-4 sm:py-4">
        <LogoLink theme={theme} />
        <div className="flex items-center gap-4">
          <PrimaryNav theme={theme} sections={sections} />
          <MobileNav sections={sections} />
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}

function LogoLink({ theme }: { theme: Theme }) {
  const labelColor = themedClass(theme, "text-slate-600", "text-slate-300");
  const { scrollToElement } = useAnimatedScroll({ offset: -80 });

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      scrollToElement("hero");
    },
    [scrollToElement],
  );

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

function PrimaryNav({
  theme,
  sections,
}: {
  theme: Theme;
  sections: { id: string; label: string; icon: string }[];
}) {
  const navSurface = themedClass(theme, "bg-white/70", "bg-slate-900/70");
  const linkColor = themedClass(theme, "text-slate-600", "text-slate-300");
  const prefersReducedMotion = useReducedMotion();
  const hoverScale = prefersReducedMotion ? "" : "hover:scale-105";
  const { scrollToElement } = useAnimatedScroll({ offset: -80 });

  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
      e.preventDefault();
      scrollToElement(sectionId);
    },
    [scrollToElement],
  );

  const createNavClickHandler = useCallback(
    (sectionId: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      handleNavClick(e, sectionId);
    },
    [handleNavClick],
  );

  return (
    <nav
      className={`hidden items-center gap-2 rounded-full ${navSurface} px-2 py-1.5 shadow-md backdrop-blur md:flex`}
    >
      {sections.map((section) => {
        const navClickHandler = createNavClickHandler(section.id);
        return (
          <a
            key={section.id}
            href={`#${section.id}`}
            onClick={navClickHandler}
            className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-all duration-200 ${hoverScale} hover:bg-accent/10 hover:text-accent hover:shadow-lg hover:shadow-accent/20 ${linkColor}`}
          >
            <Icon icon={section.icon} className="text-lg" aria-hidden="true" />
            {section.label}
          </a>
        );
      })}
    </nav>
  );
}
