import { SectionContainer } from "../components/SectionContainer";
import { SectionHeader } from "../components/SectionHeader";

export function AboutSection() {
  return (
    <SectionContainer id="about" className="pb-20">
      <div className="card-surface space-y-6">
        <SectionHeader
          id="about"
          icon="material-symbols:person-rounded"
          label="About"
          eyebrow="Profile"
        />
        <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
          I am an IT professional looking to gain office administration
          experience as I pursue my Billing and Coding Certificate. I love
          single player story games and overthinking.
        </p>
      </div>
    </SectionContainer>
  );
}
