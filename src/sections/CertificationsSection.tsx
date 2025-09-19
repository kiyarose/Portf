import { motion, useReducedMotion } from "framer-motion";
import { SectionContainer } from "../components/SectionContainer";
import { SectionHeader } from "../components/SectionHeader";
import { certifications } from "../data/certifications";

export function CertificationsSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <SectionContainer id="certifications" className="pb-20">
      <div className="card-surface space-y-8">
        <SectionHeader
          id="certifications"
          icon="material-symbols:workspace-premium-rounded"
          label="Certifications"
          eyebrow="Validated Skills"
        />
        <div className="grid gap-6 md:grid-cols-2">
          {certifications.map((cert, index) => (
            <motion.div
              key={cert.name}
              className="rounded-3xl border border-slate-200/60 bg-white/60 p-6 shadow-card dark:border-slate-700/60 dark:bg-slate-900/60"
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
              <span className="chip !bg-accent/15 !text-accent dark:!bg-accent/20">
                {cert.issuer}
              </span>
              <h3 className="mt-4 text-xl font-semibold text-slate-900 dark:text-slate-50">
                {cert.name}
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                Issued {cert.date}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionContainer>
  );
}
