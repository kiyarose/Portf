import { SectionContainer } from "../components/SectionContainer";
import { SectionHeader } from "../components/SectionHeader";
import { useTheme } from "../hooks/useTheme";
import { themedClass } from "../utils/themeClass";

export function AboutSection() {
  const { theme } = useTheme();
  return (
    <SectionContainer id="about" className="pb-20">
      <div className="card-surface space-y-6">
        <SectionHeader
          id="about"
          icon="material-symbols:person-rounded"
          label="About"
          eyebrow="Profile"
        />
        <p
          className={themedClass(
            theme,
            "text-base leading-relaxed text-slate-600",
            "text-base leading-relaxed text-slate-300",
          )}
        >
          I am an IT professional looking to gain office administration
          experience as I pursue my Billing and Coding Certificate. I love
          single player story games and overthinking. I also like to write
          sometimes :3
        </p>
      </div>
    </SectionContainer>
  );
}
