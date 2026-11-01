import type { ReactNode } from "react";
import { Menu } from "lucide-react";
import { Brand } from "./brand";
import { NavbarSearch } from "./navbar-search";

export interface SiteHeaderProps {
  breadcrumb?: ReactNode;
  onMenuClick?: () => void;
  menuAriaLabel?: string;
  query?: string;
  onQueryChange?: (q: string) => void;
  searchAriaLabel?: string;
  searchPlaceholder?: string;
  showDropdown?: boolean;
  className?: string;
}

export function SiteHeader({
  breadcrumb,
  onMenuClick,
  menuAriaLabel = "Open navigation",
  query,
  onQueryChange,
  searchAriaLabel,
  searchPlaceholder,
  showDropdown,
  className = "",
}: SiteHeaderProps = {}) {
  return (
    <header className={`site-header ${className}`.trim()}>
      <div className="header-left">
        {onMenuClick && (
          <button
            type="button"
            className="icon-button nav-open"
            onClick={onMenuClick}
            aria-label={menuAriaLabel}
          >
            <Menu size={19} />
          </button>
        )}
        <Brand />
        {breadcrumb && (
          <div className="studio-breadcrumb">
            <span className="breadcrumb-slash">/</span>
            {breadcrumb}
          </div>
        )}
      </div>

      <NavbarSearch
        query={query}
        onQueryChange={onQueryChange}
        ariaLabel={searchAriaLabel}
        placeholder={searchPlaceholder}
        showDropdown={showDropdown}
      />
    </header>
  );
}
