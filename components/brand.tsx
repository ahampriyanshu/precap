import Link from "next/link";

export function Brand() {
  return (
    <Link className="brand" href="/" aria-label="o1on home">
      o1on
      <span className="brand-period" aria-hidden="true">
        .
      </span>
    </Link>
  );
}
