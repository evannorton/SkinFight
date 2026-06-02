"use client";

import {
  DropdownMenu,
  Flex,
  Heading,
  IconButton,
  Link,
} from "@radix-ui/themes";
import NextLink from "next/link";
import type { ReactElement } from "react";

type SiteHeaderNavigationProps = {
  hasCurrentOngoingEvent: boolean;
  isUserSignedIn: boolean;
  isSessionUserAdmin: boolean;
};

type SiteHeaderNavLinkItem = {
  href: string;
  label: string;
};

function buildSiteHeaderNavLinkItems(
  props: SiteHeaderNavigationProps,
): SiteHeaderNavLinkItem[] {
  const navLinkItems: SiteHeaderNavLinkItem[] = [
    { href: "/characters", label: "Characters" },
  ];
  if (props.hasCurrentOngoingEvent === true) {
    navLinkItems.push({
      href: "/current-event",
      label: "Current event",
    });
  }
  if (props.isUserSignedIn === true && props.isSessionUserAdmin === true) {
    navLinkItems.push({ href: "/dashboard", label: "Dashboard" });
  }
  if (props.isUserSignedIn === false) {
    navLinkItems.push({ href: "/api/auth/signin", label: "Sign in" });
  }
  if (props.isUserSignedIn === true) {
    navLinkItems.push({ href: "/api/auth/signout", label: "Sign out" });
  }
  return navLinkItems;
}

function SiteHeaderNavLink(props: {
  href: string;
  label: string;
}): ReactElement {
  return (
    <Link asChild size="2" weight="medium" underline="hover">
      <NextLink href={props.href}>{props.label}</NextLink>
    </Link>
  );
}

function SiteHeaderHamburgerMenuIcon(): ReactElement {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 15 15"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.5 3C1.22386 3 1 2.77614 1 2.5C1 2.22386 1.22386 2 1.5 2H13.5C13.7761 2 14 2.22386 14 2.5C14 2.77614 13.7761 3 13.5 3H1.5ZM1 7.5C1 7.22386 1.22386 7 1.5 7H13.5C13.7761 7 14 7.22386 14 7.5C14 7.77614 13.7761 8 13.5 8H1.5C1.22386 8 1 7.77614 1 7.5ZM1 12.5C1 12.2239 1.22386 12 1.5 12H13.5C13.7761 12 14 12.2239 14 12.5C14 12.7761 13.7761 13 13.5 13H1.5C1.22386 13 1 12.7761 1 12.5Z"
      />
    </svg>
  );
}

export function SiteHeaderNavigation(
  props: SiteHeaderNavigationProps,
): ReactElement {
  const navLinkItems = buildSiteHeaderNavLinkItems(props);
  const charactersNavLinkItem = navLinkItems.find((navLinkItem) => {
    return navLinkItem.href === "/characters";
  });
  const secondaryNavLinkItems = navLinkItems.filter((navLinkItem) => {
    return navLinkItem.href !== "/characters";
  });

  return (
    <Flex align="center" justify="between" width="100%">
      <Flex align="center" gap="4">
        <Heading as="h1" size="5" weight="bold">
          <Link asChild underline="hover" color="gray" highContrast>
            <NextLink href="/">SkinFight</NextLink>
          </Link>
        </Heading>
        {charactersNavLinkItem !== undefined && (
          <Flex display={{ initial: "none", md: "flex" }} align="center" gap="4">
            <SiteHeaderNavLink
              href={charactersNavLinkItem.href}
              label={charactersNavLinkItem.label}
            />
          </Flex>
        )}
      </Flex>

      <Flex
        align="center"
        gap="4"
        display={{ initial: "none", md: "flex" }}
        asChild
      >
        <nav>
          {secondaryNavLinkItems.map((navLinkItem) => {
            return (
              <SiteHeaderNavLink
                key={navLinkItem.href}
                href={navLinkItem.href}
                label={navLinkItem.label}
              />
            );
          })}
        </nav>
      </Flex>

      <Flex display={{ initial: "flex", md: "none" }}>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <IconButton
              type="button"
              variant="ghost"
              aria-label="Open navigation menu"
            >
              <SiteHeaderHamburgerMenuIcon />
            </IconButton>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end">
            {navLinkItems.map((navLinkItem) => {
              return (
                <DropdownMenu.Item key={navLinkItem.href} asChild>
                  <NextLink href={navLinkItem.href}>{navLinkItem.label}</NextLink>
                </DropdownMenu.Item>
              );
            })}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Flex>
    </Flex>
  );
}
