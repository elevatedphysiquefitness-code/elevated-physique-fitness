interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  centered?: boolean;
  light?: boolean;
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  centered = true,
  light = false,
}: SectionHeadingProps) {
  return (
    <div className={`max-w-3xl ${centered ? 'mx-auto text-center' : ''}`}>
      {eyebrow && (
        <p className={`text-sm font-semibold uppercase tracking-widest mb-3 ${
          light ? 'text-blue-400' : 'text-blue-600'
        }`}>
          {eyebrow}
        </p>
      )}
      <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight ${
        light ? 'text-white' : 'text-black'
      }`}>
        {title}
      </h2>
      {description && (
        <p className={`mt-4 text-lg ${
          light ? 'text-grey-300' : 'text-grey-600'
        }`}>
          {description}
        </p>
      )}
    </div>
  );
}
