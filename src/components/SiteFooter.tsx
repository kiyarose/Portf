import { useId, useMemo } from "react";
import { generateBuildLabel } from "../data/build";
import { useTheme } from "../hooks/useTheme";
import AdminHint from "./AdminHint";
import type { Theme } from "../providers/theme-context";
import { themedClass } from "../utils/themeClass";

export function SiteFooter() {
  const { theme } = useTheme();
  const currentYear = new Date().getFullYear();
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
  theme: Theme;
};

function FooterContent({
  currentYear,
  buildLabel,
  tooltipId,
  theme,
}: FooterContentProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 sm:flex-row sm:flex-wrap sm:gap-3">
      <FooterBranding currentYear={currentYear} theme={theme} />
      <FooterAttribution theme={theme} />
      <FooterBuildLabel
        label={buildLabel}
        tooltipId={tooltipId}
        theme={theme}
      />
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
  const brandingColor = themedClass(theme, "text-slate-600", "text-slate-300");
  return (
    <span className={`inline-flex items-center gap-1 ${brandingColor}`}>
  <span className="text-base text-accent">©</span>
  <span>{currentYear}</span>
  {/* Replace the name below with your display name. AdminHint supports a long-press link to an admin URL. */}
  <AdminHint>Your Name</AdminHint>
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
  const labelColor = themedClass(theme, "text-slate-600", "text-slate-300");
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
      <span className={`ml-1 ${metaColor}`}>Last update · Latest refresh</span>
    </span>
  );
}
