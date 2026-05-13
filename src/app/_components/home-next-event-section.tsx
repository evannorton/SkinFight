"use client";

import { Heading, Text } from "@radix-ui/themes";
import type { ReactElement } from "react";
import { useEffect, useState } from "react";

type HomeNextEventSectionProps = {
  eventDisplayName: string | null;
  eventStartsAtIso: string | null;
};

function formatRemainingMillisecondsUntilStart(
  totalMillisecondsRemaining: number,
): string {
  if (totalMillisecondsRemaining <= 0) {
    return "Starting now";
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
  const { eventDisplayName, eventStartsAtIso } = props;
  const [currentTimeMs, setCurrentTimeMs] = useState<number>(() => Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentTimeMs(Date.now());
    }, 1000);
    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  if (eventStartsAtIso === null) {
    return (
      <>
        <Heading as="h2" size="5" weight="bold" mb="3">
          Next event
        </Heading>
        <Text as="p" size="3" color="gray">
          No upcoming events scheduled.
        </Text>
      </>
    );
  }

  const eventStartInstant = new Date(eventStartsAtIso);
  const millisecondsUntilStart = eventStartInstant.getTime() - currentTimeMs;
  const countdownLabel = formatRemainingMillisecondsUntilStart(
    millisecondsUntilStart,
  );
  const startsAtLabel = eventStartInstant.toLocaleString(undefined, {
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <>
      <Heading as="h2" size="5" weight="bold" mb="3">
        Next event
      </Heading>
      <Text as="p" size="4" weight="medium">
        {eventDisplayName ?? "Untitled"}
      </Text>
      <Text as="p" size="2" color="gray">
        {startsAtLabel}
      </Text>
      <Text as="p" size="3" mb="1" mt="1">
        Starts in{" "}
        <Text as="span" weight="bold" size="3">
          {countdownLabel}
        </Text>
      </Text>
    </>
  );
}
