import { cheatsheets } from "@/lib/cheatsheets";
import { caseStudies } from "@/lib/case-studies";
import { Catalog } from "@/components/catalog";
import { chapters } from "@/lib/curriculum";
import { guides } from "@/lib/guides";

export default function Home() {
  return (
    <Catalog
      chapters={chapters}
      guides={guides}
      cheatsheets={cheatsheets}
      caseStudies={caseStudies}
    />
  );
}
