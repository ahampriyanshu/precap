import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Workspace } from "@/components/workspace";
import { chapters, chaptersForLanguage, getLesson } from "@/lib/curriculum";

export const dynamicParams = false;
export function generateStaticParams() {
  return chapters.map(({ track, slug }) => ({ track, slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ track: string; slug: string }>;
}): Promise<Metadata> {
  const { track, slug } = await params;
  return { title: getLesson(track, slug)?.title ?? "Chapter not found" };
}
export default async function LessonPage({
  params,
}: {
  params: Promise<{ track: string; slug: string }>;
}) {
  const { track, slug } = await params;
  const lesson = getLesson(track, slug);
  if (!lesson) notFound();
  return (
    <Workspace
      key={lesson.id}
      lesson={lesson}
      chapters={chaptersForLanguage(lesson.language || "python")}
    />
  );
}
