import Link from "next/link";
import { O1onMark } from "./o1on-mark";

export function Brand() {
  return (
    <Link className="brand" href="/" aria-label="o1on home">
      <O1onMark size={20} className="brand-mark" />
      <span>o1on</span>
    </Link>
  );
}
