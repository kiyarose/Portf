import { Icon } from "@iconify/react";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { SectionContainer } from "../components/SectionContainer";
import { SectionHeader } from "../components/SectionHeader";

const EMAIL = "kiya.rose@sillylittle.tech";

export function ContactSection() {
  const [copied, setCopied] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (error) {
      console.warn("Clipboard copy failed", error);
      setCopied(false);
    }
  };

  return (
    <SectionContainer id="contact" className="pb-28">
      <div className="card-surface space-y-8">
        <SectionHeader
          id="contact"
          icon="material-symbols:contact-mail-rounded"
          label="Contact"
          eyebrow="Let’s Talk"
        />
        <div className="flex flex-col gap-8 md:flex-row">
          <div className="flex-1 space-y-4">
            <p className="text-base text-slate-600 dark:text-slate-300">
              Have an opportunity or just want to say hello? Copy my email or
              drop a note using the form. I respond within two business days.
            </p>
            <button
              type="button"
              onClick={handleCopy}
              className="chip !bg-accent !text-white hover:translate-y-[-2px] hover:shadow-lg"
            >
              <Icon
                icon="material-symbols:content-copy-rounded"
                className="text-lg"
                aria-hidden="true"
              />
              {copied ? "Copied!" : "Copy my email"}
            </button>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {EMAIL}
            </p>
          </div>
          <form
            className="flex-1 space-y-4"
            action={`mailto:${EMAIL}`}
            method="post"
            encType="text/plain"
          >
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">
              Name
              <input
                required
                name="name"
                className="mt-1 w-full rounded-2xl border border-slate-200/60 bg-white/80 px-4 py-3 text-sm placeholder:text-slate-400 focus:border-accent focus:outline-none dark:border-slate-700/60 dark:bg-slate-900/70"
                placeholder="How should I address you?"
              />
            </label>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">
              Message
              <textarea
                required
                name="message"
                rows={4}
                className="mt-1 w-full rounded-2xl border border-slate-200/60 bg-white/80 px-4 py-3 text-sm placeholder:text-slate-400 focus:border-accent focus:outline-none dark:border-slate-700/60 dark:bg-slate-900/70"
                placeholder="Let me know how I can help."
              />
            </label>
            <motion.button
              type="submit"
              className="w-full rounded-2xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/30 transition hover:shadow-xl"
              whileHover={prefersReducedMotion ? undefined : { scale: 1.01 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
            >
              Send email
            </motion.button>
          </form>
        </div>
      </div>
    </SectionContainer>
  );
}
