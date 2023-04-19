import React, { useMemo } from "react";

import Link from "@/components/content/Link";

export type HeadingProps = {
  children?: React.ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6 | -1;
  className?: string;
  id?: string;
  link?: boolean;
};

const Heading: React.FC<HeadingProps> = ({
  children,
  level = 1,
  className,
  id,
  link = false,
}) => {
  const Tag = level === -1 ? "p" : (`h${level}` as keyof JSX.IntrinsicElements);
  const headingClass = useMemo(
    () =>
      [
        !/\bmy-\d+\b/.test(className || "") && "my-2",
        !/\btext-(xs|sm|base|lg|[2-6]?xl)\b/.test(className || "") &&
          "text-3xl",
        "font-serif font-bold",
        className,
      ]
        .filter(Boolean)
        .join(" "),
    [className]
  );

  return (
    <Tag className={headingClass} id={id}>
      {id && link ? (
        <Link href={`#${id}`} custom>
          {children}
        </Link>
      ) : (
        children
      )}
    </Tag>
  );
};

export default Heading;
