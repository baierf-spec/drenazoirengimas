// Plain link with the TanStack-style props the components were written with (to + params).
import type { AnchorHTMLAttributes } from "react";
type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { to: string; params?: Record<string, string> };
export function Link({ to, params, ...rest }: Props) {
  const href = to.replace(/\$([a-zA-Z]+)/g, (_, k: string) => encodeURIComponent(params?.[k] ?? ""));
  return <a href={href} {...rest} />;
}
