'use client';

export interface ContentPlaceholderProps {
  /** Page title to display. */
  title: string;
  /** Subtitle text. */
  subtitle?: string;
}

export function ContentPlaceholder({
  title,
  subtitle = 'Coming soon',
}: ContentPlaceholderProps) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}
