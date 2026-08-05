import { Box, Heading, Text } from "@radix-ui/themes";
import type { ReactElement } from "react";

import { HomeNextEventSection } from "~/app/_components/home-next-event-section";
import { getFeaturedEventForHomePage } from "~/server/event-for-display";

export default async function Home(): Promise<ReactElement> {
  const featuredEvent = await getFeaturedEventForHomePage();
  const hasFeaturedEventSection = featuredEvent !== null;

  return (
    <Box px="6" py="6" style={{ maxWidth: "42rem" }}>
      {hasFeaturedEventSection === true && featuredEvent !== null && (
        <HomeNextEventSection
          eventHighlightMode={featuredEvent.eventHighlightMode}
          eventDisplayName={featuredEvent.displayName}
          eventStartsAtIso={featuredEvent.startsAtIso}
          eventEndsAtIso={featuredEvent.endsAtIso}
          shouldShowLinkToCurrentEventPage={
            featuredEvent.eventHighlightMode === "current"
          }
        />
      )}
      <Heading
        as="h2"
        size="5"
        weight="bold"
        mb="3"
        mt={hasFeaturedEventSection === true ? "6" : undefined}
      >
        Welcome to SkinFight
      </Heading>

      <Text as="p" size="3" color="gray">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
      </Text>

      <Heading as="h2" size="5" weight="bold" mb="3" mt="6">
        Rules
      </Heading>
      <Text as="p" size="3" color="gray" mb="2">
        Rule 1: Example text.
      </Text>
      <Text as="p" size="3" color="gray" mb="2">
        Rule 2: Example text.
      </Text>
      <Text as="p" size="3" color="gray" mb="2">
        Rule 3: Example text.
      </Text>
      <Text as="p" size="3" color="gray" mb="2">
        Rule 4: Example text.
      </Text>
      <Text as="p" size="3" color="gray" mb="2">
        Rule 5: Example text.
      </Text>
      <Text as="p" size="3" color="gray">
        Rule 6: Example text.
      </Text>
    </Box>
  );
}
