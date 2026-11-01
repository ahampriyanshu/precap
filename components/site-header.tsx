import type { ReactNode } from "react";
import { Menu } from "lucide-react";
import { Brand } from "./brand";
import { NavbarSearch } from "./navbar-search";

export interface SiteHeaderProps {
  breadcrumb?: ReactNode;
  showBrand?: boolean;
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
  showBrand,
  onMenuClick,
  menuAriaLabel = "Open navigation",
  query,
  onQueryChange,
  searchAriaLabel,
  searchPlaceholder,
  showDropdown,
  className = "",
}: SiteHeaderProps = {}) {
  const shouldShowBrand = showBrand ?? !breadcrumb;

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
        {shouldShowBrand && <Brand />}
        {shouldShowBrand && breadcrumb && (
          <span className="breadcrumb-slash">/</span>
        )}
        {breadcrumb && <div className="studio-breadcrumb">{breadcrumb}</div>}
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
