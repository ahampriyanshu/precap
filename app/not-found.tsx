import Link from "next/link";
import { Brand } from "@/components/brand";

export default function NotFound() {
  return (
    <main className="not-found">
      <Brand />

      <h1>Lesson not found.</h1>
      <p>Choose a lesson from the course index.</p>
      <Link className="button primary" href="/">
        Back to courses
      </Link>
    </main>
  );
}
