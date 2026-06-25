import { Box, Flex, Heading, Text } from "@radix-ui/themes";
import type { ReactElement } from "react";
import React from "react";

import type { CurrentEventWeekForDisplay } from "~/lib/event-for-display-types";

type CurrentEventWeekSectionProps = {
  currentEventWeekForDisplay: CurrentEventWeekForDisplay | null;
};

export function CurrentEventWeekSection(
  props: CurrentEventWeekSectionProps,
): ReactElement {
  const { currentEventWeekForDisplay } = props;

  return (
    <Box mt="3">
      {currentEventWeekForDisplay !== null && (
        <>
          <Heading as="h3" size="3" weight="bold" mb="2">
            Week {currentEventWeekForDisplay.weekNumber}
          </Heading>
          {currentEventWeekForDisplay.themes.length === 0 && (
            <Text as="p" size="2" color="gray">
              No themes this week.
            </Text>
          )}
          {currentEventWeekForDisplay.themes.length > 0 && (
            <Flex direction="column" gap="1">
              <Text as="p" size="2">
                {"Themes: "}
                {currentEventWeekForDisplay.themes.map(
                  (themeRow, themeIndex) => {
                    return (
                      <>
                        {themeIndex > 0 && ", "}
                        <React.Fragment
                          key={themeRow.themeId}
                        >{`${themeRow.themeName}`}</React.Fragment>
                      </>
                    );
                  },
                )}
              </Text>
            </Flex>
          )}
        </>
      )}
    </Box>
  );
}
