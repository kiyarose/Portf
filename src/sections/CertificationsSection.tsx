import { motion, useReducedMotion } from "framer-motion";
import { SectionContainer } from "../components/SectionContainer";
import { SectionHeader } from "../components/SectionHeader";
import { certifications } from "../data/certifications";
import { useTheme } from "../hooks/useTheme";
import { themedClass } from "../utils/themeClass";
import { cn } from "../utils/cn";

export function CertificationsSection() {
  const prefersReducedMotion = useReducedMotion();
  const { theme } = useTheme();

  return (
    <SectionContainer id="certifications" className="pb-20">
      <div className="card-surface space-y-8">
        <SectionHeader
          id="certifications"
          icon="material-symbols:workspace-premium-rounded"
          label="Certifications"
          eyebrow="Validated Skills"
        />
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {certifications.map((cert, index) => (
            <motion.div
              key={cert.name}
              className={cn(
                "rounded-3xl border p-4 shadow-card sm:p-6",
                themedClass(
                  theme,
                  "border-slate-200/60 bg-white/60",
                  "border-slate-700/60 bg-slate-900/60",
                ),
              )}
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
              whileInView={
                prefersReducedMotion ? undefined : { opacity: 1, y: 0 }
              }
              viewport={{ once: true, amount: 0.5 }}
              transition={{
                delay: prefersReducedMotion ? 0 : index * 0.1,
                duration: 0.4,
              }}
            >
              <span
                className={cn(
                  "chip !text-accent",
                  themedClass(theme, "!bg-accent/15", "!bg-accent/20"),
                )}
              >
                {cert.issuer}
              </span>
              <h3
                className={cn(
                  "mt-3 text-lg font-semibold sm:mt-4 sm:text-xl",
                  themedClass(theme, "text-slate-900", "text-slate-50"),
                )}
              >
                {cert.name}
              </h3>
              <p
                className={cn(
                  "mt-1 text-sm sm:mt-2",
                  themedClass(theme, "text-slate-500", "text-slate-300"),
                )}
              >
                Issued {cert.date}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionContainer>
  );
}
