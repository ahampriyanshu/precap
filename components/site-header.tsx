import { Brand } from "./brand";
import { LanguageSelect } from "./language-select";
export function SiteHeader() {
  return (
    <header className="site-header">
      <Brand />
      <LanguageSelect />
    </header>
  );
}
