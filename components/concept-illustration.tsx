import Image from "next/image";
import { conceptArt, type ConceptArtId } from "@/lib/concept-art";

export function ConceptIllustration({
  concept,
  className = "",
  priority = false,
}: {
  concept: ConceptArtId;
  className?: string;
  priority?: boolean;
}) {
  const art = conceptArt[concept];
  return (
    <figure className={`concept-illustration ${className}`}>
      <Image
        src={`/illustrations/${concept}.svg`}
        alt={art.alt}
        width={concept === "engineering-desk" ? 1200 : 720}
        height={concept === "engineering-desk" ? 410 : 420}
        loading={priority ? "eager" : "lazy"}
      />
      <figcaption>{art.caption}</figcaption>
    </figure>
  );
}
