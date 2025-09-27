import { useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { Icon } from "@iconify/react";
import { DecorativeBackground } from "../components/DecorativeBackground";
import { SiteFooter } from "../components/SiteFooter";
import { useTheme } from "../hooks/useTheme";
import { themedClass } from "../utils/themeClass";
import { cn } from "../utils/cn";
import { goBackOrNavigateHome } from "../utils/navigation";
import { getBuildUpdatedAt } from "../data/build";

const CONTACT_EMAIL = "kiya.rose@sillylittle.tech";

type PolicySection = {
  title: string;
  body: ReactNode;
};

const paragraphClass = "text-base leading-7 text-slate-600 dark:text-slate-300";
const listClass =
  "list-disc space-y-3 pl-6 text-base leading-7 text-slate-600 dark:text-slate-300";

const policySections: PolicySection[] = [
  {
    title: "Information I Collect",
    body: (
      <>
        <p className={paragraphClass}>
          I collect only the information needed to respond to inquiries and to
          understand how the site is used so I can keep improving it.
        </p>
        <ul className={listClass}>
          <li>
            <strong>Contact form details:</strong> When you submit the “Contact
            Me” form, I receive the name you share, your email address, and the
            contents of your message. The form routes through Pageclip so that I
            can receive and manage your message securely.
          </li>
          <li>
            <strong>Usage analytics:</strong> Firebase Hosting and the built-in
            Google Analytics integrations collect standard event and device
            information (such as page views, browser type, approximate
            geolocation, and device identifiers). These analytics are aggregated
            and help me measure site performance.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "How I Use Your Information",
    body: (
      <ul className={listClass}>
        <li>Responding to you directly when you reach out through the form.</li>
        <li>
          Monitoring site performance, debugging issues, and improving features
          using aggregated analytics insights.
        </li>
        <li>
          Maintaining the security and reliability of the hosting
          infrastructure.
        </li>
      </ul>
    ),
  },
  {
    title: "Services and Third Parties",
    body: (
      <>
        <p className={paragraphClass}>
          The portfolio is hosted with <strong>Firebase Hosting</strong> and
          uses Google’s analytics tooling. These providers process data on my
          behalf in accordance with their own policies, which you can review
          here:
        </p>
        <ul className={listClass}>
          <li>
            <a
              href="https://firebase.google.com/support/privacy"
              target="_blank"
              rel="noreferrer"
            >
              Firebase Privacy and Security
            </a>
          </li>
          <li>
            <a
              href="https://support.google.com/analytics/answer/7318509"
              target="_blank"
              rel="noreferrer"
            >
              Google Analytics Privacy Overview
            </a>
          </li>
        </ul>
        <p className={paragraphClass}>
          I do not sell your personal information or share it with advertisers.
          Access is limited to what is required to run this website.
        </p>
      </>
    ),
  },
  {
    title: "Legal Bases for Processing (GDPR)",
    body: (
      <>
        <p className={paragraphClass}>
          If you reside in the European Economic Area or United Kingdom, I rely
          on the following legal bases under the General Data Protection
          Regulation:
        </p>
        <ul className={listClass}>
          <li>
            <strong>Consent</strong> for analytics and form submissions; you can
            withdraw consent at any time by contacting me.
          </li>
          <li>
            <strong>Legitimate interest</strong> in operating and securing the
            portfolio.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "Your Privacy Rights",
    body: (
      <>
        <p className={paragraphClass}>
          Depending on where you live, you may have rights to access, correct,
          delete, or restrict the use of your personal data.
        </p>
        <ul className={listClass}>
          <li>
            <strong>California residents (CCPA/CPRA):</strong> You can request a
            copy of the data collected about you, ask for deletion, or opt out
            of data sharing. I do not sell personal data, as defined by
            California law.
          </li>
          <li>
            <strong>EEA & UK residents (GDPR):</strong> You can request access
            to your personal data, correction of inaccuracies, deletion, or a
            copy for portability. You may also object to or request restriction
            of certain processing.
          </li>
        </ul>
        <p className={paragraphClass}>
          To exercise any of these rights, email me at
          <a className="ml-1" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </>
    ),
  },
  {
    title: "Data Retention",
    body: (
      <p className={paragraphClass}>
        Contact messages are retained only as long as needed to respond to you
        or maintain a conversation record. Aggregated analytics data is stored
        according to Google’s default retention schedule, which is currently 14
        months unless a shorter period is chosen.
      </p>
    ),
  },
  {
    title: "Security",
    body: (
      <p className={paragraphClass}>
        Firebase provides managed infrastructure with encryption in transit and
        at rest. I also review analytics and access logs to monitor for
        unexpected activity. No system can be perfectly secure, but I take
        reasonable precautions to protect your data.
      </p>
    ),
  },
  {
    title: "International Data Transfers",
    body: (
      <p className={paragraphClass}>
        Firebase and Google Analytics may process data on servers located in the
        United States or other countries. These transfers follow Google’s global
        infrastructure and incorporate appropriate safeguards.
      </p>
    ),
  },
  {
    title: "Changes to This Policy",
    body: (
      <p className={paragraphClass}>
        I may update this Privacy Policy at any time to reflect new features,
        legal requirements, or provider changes. Updates will be posted on this
        page with a new <span className="text-yellow-400">Last updated</span>
        date, so please check back periodically.
      </p>
    ),
  },
  {
    title: "Contact",
    body: (
      <p className={paragraphClass}>
        Questions about this Privacy Policy or your data rights? Reach out any
        time at
        <a className="ml-1" href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>
        .
      </p>
    ),
  },
];

export function PrivacyPolicyPage() {
  const { theme } = useTheme();

  useEffect(() => {
    document.title = "Privacy Policy • Kiya Rose";
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0 });
    }
  }, []);

  const lastUpdatedDate = useMemo(() => getBuildUpdatedAt(), []);
  const formattedDate = useMemo(() => {
    if (!lastUpdatedDate) return null;
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(lastUpdatedDate);
  }, [lastUpdatedDate]);
  const lastUpdatedIso = lastUpdatedDate
    ? lastUpdatedDate.toISOString().split("T")[0]
    : null;

  const cardSurface = themedClass(
    theme,
    "border-white/60 bg-white/80 text-slate-700 shadow-card",
    "border-slate-800/60 bg-slate-950/70 text-slate-200 shadow-[0_25px_55px_rgba(2,6,23,0.65)]",
  );
  const mutedText = themedClass(
    theme,
    "text-slate-500",
    "text-slate-400",
  );
  const backButtonClass = cn(
    "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition shadow-card backdrop-blur",
    themedClass(theme, "bg-white/80 text-slate-700 hover:bg-white", "bg-slate-900/80 text-slate-100 hover:bg-slate-900"),
    themedClass(theme, "border-slate-200/60", "border-slate-700/60"),
  );
  return (
    <div className="relative min-h-screen overflow-hidden px-4 pb-16 pt-12 sm:px-6 sm:pt-16">
      <DecorativeBackground theme={theme} />
      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col gap-8">
        <PolicyHeader backButtonClass={backButtonClass} onBack={goBackOrNavigateHome} />
        <main>
          <PolicyArticle
            cardSurface={cardSurface}
            formattedDate={formattedDate}
            lastUpdatedIso={lastUpdatedIso}
            mutedText={mutedText}
          />
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}

type PolicyArticleProps = {
  cardSurface: string;
  formattedDate: string | null;
  lastUpdatedIso: string | null;
  mutedText: string;
};

function PolicyHeader({
  backButtonClass,
  onBack,
}: {
  backButtonClass: string;
  onBack: () => void;
}) {
  return (
    <header className="flex flex-wrap items-center gap-4">
      <button type="button" onClick={onBack} className={backButtonClass}>
        <Icon
          icon="material-symbols:arrow-back-rounded"
          className="text-lg"
          aria-hidden="true"
        />
        Back
      </button>
    </header>
  );
}

function PolicyArticle({
  cardSurface,
  formattedDate,
  lastUpdatedIso,
  mutedText,
}: PolicyArticleProps) {
  return (
    <article
      className={cn(
        "rounded-3xl border px-6 py-8 backdrop-blur-md sm:px-10 sm:py-12",
        cardSurface,
      )}
      aria-labelledby="privacy-policy-title"
    >
      <PolicyMeta
        formattedDate={formattedDate}
        lastUpdatedIso={lastUpdatedIso}
        mutedText={mutedText}
      />
      <PolicyIntro />
      {policySections.map((section) => (
        <PolicySectionEntry key={section.title} section={section} />
      ))}
    </article>
  );
}

function PolicyMeta({
  formattedDate,
  lastUpdatedIso,
  mutedText,
}: {
  formattedDate: string | null;
  lastUpdatedIso: string | null;
  mutedText: string;
}) {
  return (
    <p className={cn("text-sm font-medium", mutedText)}>
      Last updated:{" "}
      {formattedDate ? (
        <time dateTime={lastUpdatedIso ?? undefined} className="text-yellow-500">
          {formattedDate}
        </time>
      ) : (
        <span>—</span>
      )}
    </p>
  );
}

function PolicyIntro() {
  return (
    <p className={paragraphClass}>
      Your privacy matters. This Privacy Policy explains how I,{" "}
      <span className="font-kiya">Kiya Rose</span>, collect, use, and safeguard
      personal information when you visit{" "}
      <a href="https://sillylittle.tech" rel="noreferrer">
        sillylittle.tech
      </a>
      , interact with the contact form, or engage with the analytics services
      that power the site.
    </p>
  );
}

function PolicySectionEntry({ section }: { section: PolicySection }) {
  return (
    <section className="mt-10 space-y-4 text-base leading-7 first:mt-6">
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
        {section.title}
      </h2>
      {section.body}
    </section>
  );
}
