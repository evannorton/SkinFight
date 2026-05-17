import { Box, Heading, Text } from "@radix-ui/themes";
import type { ReactElement } from "react";

import { HomeNextEventSection } from "~/app/_components/home-next-event-section";
import { formatEventDateTimeRangeLabel } from "~/lib/format-event-datetime-range-label";
import { db } from "~/server/db";

type HomeEventHighlightMode = "current" | "next";

type FeaturedEventForHomePage = {
  eventHighlightMode: HomeEventHighlightMode;
  displayName: string;
  startsAtIso: string;
  endsAtIso: string;
  dateTimeRangeLabel: string;
};

function buildFeaturedEventForHomePage(
  eventRow: { name: string; date: Date; endDate: Date },
  eventHighlightMode: HomeEventHighlightMode,
): FeaturedEventForHomePage {
  let displayName = "Untitled";
  if (eventRow.name.trim().length > 0) {
    displayName = eventRow.name.trim();
  }
  return {
    eventHighlightMode,
    displayName,
    startsAtIso: eventRow.date.toISOString(),
    endsAtIso: eventRow.endDate.toISOString(),
    dateTimeRangeLabel: formatEventDateTimeRangeLabel(
      eventRow.date,
      eventRow.endDate,
    ),
  };
}

export default async function Home(): Promise<ReactElement> {
  const now = new Date();
  const eventSelectFields = {
    name: true,
    date: true,
    endDate: true,
  } as const;

  const currentOngoingEvent = await db.event.findFirst({
    where: {
      date: { lte: now },
      endDate: { gte: now },
    },
    orderBy: { date: "asc" },
    select: eventSelectFields,
  });

  let featuredEvent: FeaturedEventForHomePage | null = null;
  if (currentOngoingEvent !== null) {
    featuredEvent = buildFeaturedEventForHomePage(
      currentOngoingEvent,
      "current",
    );
  } else {
    const nextUpcomingEvent = await db.event.findFirst({
      where: { date: { gt: now } },
      orderBy: { date: "asc" },
      select: eventSelectFields,
    });
    if (nextUpcomingEvent !== null) {
      featuredEvent = buildFeaturedEventForHomePage(
        nextUpcomingEvent,
        "next",
      );
    }
  }

  const hasFeaturedEventSection = featuredEvent !== null;

  return (
    <Box px="6" py="6" style={{ maxWidth: "42rem" }}>
      {hasFeaturedEventSection === true && featuredEvent !== null && (
        <HomeNextEventSection
          eventHighlightMode={featuredEvent.eventHighlightMode}
          eventDisplayName={featuredEvent.displayName}
          eventStartsAtIso={featuredEvent.startsAtIso}
          eventEndsAtIso={featuredEvent.endsAtIso}
          eventDateTimeRangeLabel={featuredEvent.dateTimeRangeLabel}
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
