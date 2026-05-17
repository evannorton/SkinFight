"use client";

import { Heading, Link, Text } from "@radix-ui/themes";
import NextLink from "next/link";
import type { ReactElement } from "react";
import { useEffect, useState } from "react";

type HomeEventHighlightMode = "current" | "next";

type HomeNextEventSectionProps = {
  eventHighlightMode: HomeEventHighlightMode;
  eventDisplayName: string;
  eventStartsAtIso: string;
  eventEndsAtIso: string;
  eventDateTimeRangeLabel: string;
  shouldShowLinkToCurrentEventPage: boolean;
};

function formatRemainingMilliseconds(
  totalMillisecondsRemaining: number,
  completeLabel: string,
): string {
  if (totalMillisecondsRemaining <= 0) {
    return completeLabel;
  }
  const totalSeconds = Math.floor(totalMillisecondsRemaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts: string[] = [];
  if (days > 0) {
    parts.push(`${days}d`);
  }
  if (hours > 0 || days > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0 || hours > 0 || days > 0) {
    parts.push(`${minutes}m`);
  }
  parts.push(`${seconds}s`);
  return parts.join(" ");
}

export function HomeNextEventSection(
  props: HomeNextEventSectionProps,
): ReactElement {
  const {
    eventHighlightMode,
    eventDisplayName,
    eventStartsAtIso,
    eventEndsAtIso,
    eventDateTimeRangeLabel,
    shouldShowLinkToCurrentEventPage,
  } = props;

  let countdownTargetIso = eventStartsAtIso;
  if (eventHighlightMode === "current") {
    countdownTargetIso = eventEndsAtIso;
  }
  const sectionTitle =
    eventHighlightMode === "current" ? "Current event" : "Next event";
  const countdownPrefix =
    eventHighlightMode === "current" ? "Ends in" : "Starts in";
  const countdownCompleteLabel =
    eventHighlightMode === "current" ? "Ending now" : "Starting now";

  const [currentTimeMs, setCurrentTimeMs] = useState<number>(() => Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentTimeMs(Date.now());
    }, 1000);
    return () => {
      window.clearInterval(intervalId);
    };
  }, [countdownTargetIso]);

  const countdownTargetInstant = new Date(countdownTargetIso);
  const millisecondsUntilCountdownTarget =
    countdownTargetInstant.getTime() - currentTimeMs;
  const countdownLabel = formatRemainingMilliseconds(
    millisecondsUntilCountdownTarget,
    countdownCompleteLabel,
  );

  return (
    <>
      <Heading as="h2" size="5" weight="bold" mb="3">
        {sectionTitle}
      </Heading>
      <Text as="p" size="4" weight="medium">
        {eventDisplayName}
      </Text>
      <Text as="p" size="2" color="gray">
        {eventDateTimeRangeLabel}
      </Text>
      <Text as="p" size="3" mb="1" mt="1">
        {countdownPrefix}{" "}
        <Text as="span" weight="bold" size="3">
          {countdownLabel}
        </Text>
      </Text>
      {eventHighlightMode === "current" &&
        shouldShowLinkToCurrentEventPage === true && (
          <Link asChild size="3" weight="medium" underline="hover" mt="2">
            <NextLink href="/current-event">View current event</NextLink>
          </Link>
        )}
    </>
  );
}
