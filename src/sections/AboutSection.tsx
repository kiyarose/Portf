import { SectionContainer } from "../components/SectionContainer";
import { SectionHeader } from "../components/SectionHeader";
import { useTheme } from "../hooks/useTheme";
import { useTranslation } from "../hooks/useTranslation";
import { themedClass } from "../utils/themeClass";

export function AboutSection() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  return (
    <SectionContainer id="about" className="pb-20">
      <div className="card-surface space-y-6">
        <SectionHeader
          id="about"
          icon="material-symbols:person-rounded"
          label={t.about.title}
          eyebrow={t.about.eyebrow}
        />
        <p
          className={themedClass(
            theme,
            "text-base leading-relaxed text-slate-600",
            "text-base leading-relaxed text-slate-300",
          )}
        >
          {t.about.description}
        </p>
      </div>
    </SectionContainer>
  );
}
