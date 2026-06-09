import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

type Variant = "primary" | "lime" | "ghost";

type CommonProps = {
  variant?: Variant;
  className?: string;
  children: ReactNode;
};

type Props =
  | (CommonProps & { href: string } & AnchorHTMLAttributes<HTMLAnchorElement>)
  | (CommonProps & { href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>);

/**
 * Pill button matching the demo's `.btn` family. Renders an <a> when `href`
 * is supplied (nav / scroll-jump links), otherwise a <button>.
 */
export function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}: Props) {
  const cls = `btn btn-${variant}${className ? ` ${className}` : ""}`;

  if (rest.href !== undefined) {
    return (
      <a className={cls} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    );
  }

  const buttonProps = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button className={cls} type={buttonProps.type ?? "button"} {...buttonProps}>
      {children}
    </button>
  );
}
