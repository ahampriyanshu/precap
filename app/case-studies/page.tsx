import { caseStudies } from "@/lib/case-studies";
import { CaseStudyIndex } from "@/components/case-study-index";
import { CaseStudyShell } from "@/components/case-study-shell";

export const metadata = {
  title: "Case Studies",
  description:
    "Real-world engineering case studies — how companies handled scale or recovered from incidents.",
};

export default function CaseStudiesPage() {
  return (
    <CaseStudyShell caseStudies={caseStudies}>
      <CaseStudyIndex caseStudies={caseStudies} />
    </CaseStudyShell>
  );
}
