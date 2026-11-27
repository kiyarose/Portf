import { motion, useReducedMotion } from "framer-motion";
import { Icon } from "@iconify/react";
import { SectionContainer } from "../components/SectionContainer";
import { SectionHeader } from "../components/SectionHeader";
import {
  CERTIFICATIONS_RESOURCE,
  certificationsFallback,
  certificationsPlaceholder,
  type Certification,
} from "../data/certifications";
import { useTheme } from "../hooks/useTheme";
import { useTranslation } from "../hooks/useTranslation";
import { useRemoteData } from "../hooks/useRemoteData";
import { themedClass } from "../utils/themeClass";
import { cn } from "../utils/cn";

export function CertificationsSection() {
  const prefersReducedMotion = useReducedMotion();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const {
    data: certificationEntries,
    debugAttributes: certificationDebugAttributes,
  } = useRemoteData<Certification[]>({
    resource: CERTIFICATIONS_RESOURCE,
    fallbackData: certificationsFallback,
    placeholderData: certificationsPlaceholder,
  });

  return (
    <SectionContainer
      id="certifications"
      className="pb-20"
      debugAttributes={certificationDebugAttributes}
    >
      <div className="card-surface space-y-8">
        <SectionHeader
          id="certifications"
          icon="material-symbols:workspace-premium-rounded"
          label={t.certifications.title}
          eyebrow={t.certifications.eyebrow}
        />
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {certificationEntries.map((cert, index) => (
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
              {cert.link ? (
                <a
                  href={cert.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "mt-2 inline-flex items-center gap-2 text-sm font-medium transition-colors hover:underline sm:mt-3",
                    "text-accent hover:text-accent/80",
                  )}
                >
                  <Icon
                    icon="mdi:check-decagram"
                    className="text-base"
                    aria-hidden="true"
                  />
                  <span>Verify</span>
                </a>
              ) : null}
            </motion.div>
          ))}
        </div>
      </div>
    </SectionContainer>
  );
}
