/**
 * Types for the feedback system
 */

export type FeedbackType = "suggestion" | "bug";

export type FeedbackImpact =
  | "hero"
  | "about"
  | "experience"
  | "education"
  | "certifications"
  | "projects"
  | "skills"
  | "contact"
  | "site-wide"
  | "other";

export interface FeedbackFormData {
  email: string;
  feedbackType: FeedbackType;
  feedbackTitle: string;
  feedbackDescription: string;
  impact: FeedbackImpact;
}

export const FEEDBACK_IMPACT_OPTIONS: Array<{
  value: FeedbackImpact;
  label: string;
}> = [
  { value: "hero", label: "Home/Hero" },
  { value: "about", label: "About" },
  { value: "experience", label: "Experience" },
  { value: "education", label: "Education" },
  { value: "certifications", label: "Certifications" },
  { value: "projects", label: "Projects" },
  { value: "skills", label: "Skills" },
  { value: "contact", label: "Contact" },
  { value: "site-wide", label: "Site-Wide" },
  { value: "other", label: "Other" },
];
