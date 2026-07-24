import Image from "next/image";

export function QuizIllustration({ src, alt, className = "", priority = false, sizes }: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes: string;
}) {
  return (
    <figure className={`quiz-illustration ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
      />
    </figure>
  );
}
