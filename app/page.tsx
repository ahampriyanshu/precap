import { cheatsheets } from "@/lib/cheatsheets";
import { Catalog } from "@/components/catalog";
import { chapters } from "@/lib/curriculum";

import { guides } from "@/lib/guides";

export default function Home() {
  return (
    <Catalog chapters={chapters} guides={guides} cheatsheets={cheatsheets} />
  );
}
