"use client";

import { NavigationSubmenu, type NavigationSubmenuLink } from "./NavigationSubmenu";

export { isNavigationPathCurrent } from "./NavigationSubmenu";
export type MacNavigationLink = NavigationSubmenuLink;

export function MacNavigation(props: {
  links: readonly MacNavigationLink[];
  pathname: string;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  return <NavigationSubmenu name="mac" label="Mac" {...props} />;
}
