import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Menu } from "lucide-react";
import { Brand } from "./brand";
import { NavbarSearch } from "./navbar-search";
import { ThemeToggle } from "./theme-toggle";

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
  backHref?: string;
  backLabel?: string;
  title?: string;
  showThemeToggle?: boolean;
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
  backHref,
  backLabel = "Back to lesson",
  title,
  showThemeToggle = false,
}: SiteHeaderProps = {}) {
  return (
    <header className={`site-header ${className}`.trim()}>
      <div className="header-left">
        {backHref ? (
          <>
            <Link
              href={backHref}
              className="practice-back-btn"
              aria-label={backLabel}
            >
              <ArrowLeft size={18} />
              <span>{backLabel}</span>
            </Link>
            {title && <h1 className="practice-header-title">{title}</h1>}
          </>
        ) : (
          <>
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
          </>
        )}
      </div>

      <div className="header-right">
        <NavbarSearch
          query={query}
          onQueryChange={onQueryChange}
          ariaLabel={searchAriaLabel}
          placeholder={searchPlaceholder}
          showDropdown={showDropdown}
        />
        {showThemeToggle && <ThemeToggle />}
      </div>
    </header>
  );
}
