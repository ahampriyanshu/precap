import Link from "next/link";

export function Brand() {
  return (
    <Link className="brand" href="/" aria-label="precap home">
      precap
      <span className="brand-period" aria-hidden="true">
        .
      </span>
    </Link>
  );
}
