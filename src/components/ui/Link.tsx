import React from "react";
import { Link as TanstackLink } from "@tanstack/react-router";

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to?: string;
  href?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export const Link: React.FC<LinkProps> = ({
  to,
  href,
  children,
  className,
  onClick,
  ...rest
}) => {
  const targetPath = to || href || "/";

  // External links
  if (
    targetPath.startsWith("http") ||
    targetPath.startsWith("//") ||
    targetPath.startsWith("mailto:") ||
    targetPath.startsWith("tel:")
  ) {
    return (
      <a
        href={targetPath}
        className={className}
        onClick={onClick}
        target="_blank"
        rel="noreferrer"
        {...rest}
      >
        {children}
      </a>
    );
  }

  // TanStack Router link
  return (
    <TanstackLink
      to={targetPath as never}
      className={className}
      onClick={onClick}
      {...(rest as Record<string, unknown>)}
    >
      {children}
    </TanstackLink>
  );
};

export default Link;
