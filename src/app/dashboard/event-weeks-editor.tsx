"use client";

import { Box, Button, Card, Flex, Text, TextField } from "@radix-ui/themes";
import type { ReactElement } from "react";
import { useState } from "react";

export type DraftThemeForEventWeek = {
  clientKey: string;
  name: string;
};

export type DraftWeekForEvent = {
  clientKey: string;
  themes: DraftThemeForEventWeek[];
};

type EventWeeksEditorProps = {
  draftWeeks: DraftWeekForEvent[];
  onDraftWeeksChange: (draftWeeks: DraftWeekForEvent[]) => void;
  areInputsDisabled: boolean;
};

function createDraftClientKey(): string {
  return crypto.randomUUID();
}

export function EventWeeksEditor(props: EventWeeksEditorProps): ReactElement {
  const { draftWeeks, onDraftWeeksChange, areInputsDisabled } = props;
  const [newThemeNameByWeekClientKey, setNewThemeNameByWeekClientKey] =
    useState<Record<string, string>>({});

  return (
    <Box>
      <Text as="p" size="2" weight="medium" mb="2">
        Weeks
      </Text>
      {draftWeeks.length === 0 && (
        <Text as="p" size="2" color="gray" mb="2">
          No weeks on this event yet.
        </Text>
      )}
      {draftWeeks.length > 0 && (
        <Flex direction="column" gap="3" mb="3">
          {draftWeeks.map((draftWeek, weekIndex) => {
            const isFirstWeek = weekIndex === 0;
            const isLastWeek = weekIndex === draftWeeks.length - 1;
            const weekDisplayNumber = weekIndex + 1;
            const newThemeNameForWeek =
              newThemeNameByWeekClientKey[draftWeek.clientKey] ?? "";
            const trimmedNewThemeNameForWeek = newThemeNameForWeek.trim();
            const isAddThemeDisabled =
              trimmedNewThemeNameForWeek.length === 0 ||
              areInputsDisabled === true;

            return (
              <Card key={draftWeek.clientKey} size="1" variant="surface">
                <Box p="3">
                  <Flex align="center" gap="2" wrap="wrap" mb="3">
                    <Text
                      size="2"
                      weight="medium"
                      style={{ flex: "1 1 auto", minWidth: "6rem" }}
                    >
                      Week {weekDisplayNumber}
                    </Text>
                    <Button
                      type="button"
                      size="1"
                      variant="soft"
                      disabled={
                        isFirstWeek === true || areInputsDisabled === true
                      }
                      onClick={() => {
                        if (weekIndex === 0) {
                          return;
                        }
                        const reorderedDraftWeeks = [...draftWeeks];
                        const previousDraftWeek =
                          reorderedDraftWeeks[weekIndex - 1];
                        const currentDraftWeek = reorderedDraftWeeks[weekIndex];
                        if (
                          previousDraftWeek === undefined ||
                          currentDraftWeek === undefined
                        ) {
                          return;
                        }
                        reorderedDraftWeeks[weekIndex - 1] = currentDraftWeek;
                        reorderedDraftWeeks[weekIndex] = previousDraftWeek;
                        onDraftWeeksChange(reorderedDraftWeeks);
                      }}
                    >
                      Up
                    </Button>
                    <Button
                      type="button"
                      size="1"
                      variant="soft"
                      disabled={
                        isLastWeek === true || areInputsDisabled === true
                      }
                      onClick={() => {
                        if (weekIndex === draftWeeks.length - 1) {
                          return;
                        }
                        const reorderedDraftWeeks = [...draftWeeks];
                        const nextDraftWeek =
                          reorderedDraftWeeks[weekIndex + 1];
                        const currentDraftWeek = reorderedDraftWeeks[weekIndex];
                        if (
                          nextDraftWeek === undefined ||
                          currentDraftWeek === undefined
                        ) {
                          return;
                        }
                        reorderedDraftWeeks[weekIndex + 1] = currentDraftWeek;
                        reorderedDraftWeeks[weekIndex] = nextDraftWeek;
                        onDraftWeeksChange(reorderedDraftWeeks);
                      }}
                    >
                      Down
                    </Button>
                    <Button
                      type="button"
                      size="1"
                      color="red"
                      variant="soft"
                      disabled={areInputsDisabled === true}
                      onClick={() => {
                        const draftWeeksWithoutRemoved = draftWeeks.filter(
                          (week) => week.clientKey !== draftWeek.clientKey,
                        );
                        onDraftWeeksChange(draftWeeksWithoutRemoved);
                        setNewThemeNameByWeekClientKey((previousValue) => {
                          const nextValue = { ...previousValue };
                          delete nextValue[draftWeek.clientKey];
                          return nextValue;
                        });
                      }}
                    >
                      Remove
                    </Button>
                  </Flex>
                  <Text as="p" size="2" weight="medium" mb="2">
                    Themes
                  </Text>
                  {draftWeek.themes.length === 0 && (
                    <Text as="p" size="2" color="gray" mb="2">
                      No themes for this week yet.
                    </Text>
                  )}
                  {draftWeek.themes.length > 0 && (
                    <Flex direction="column" gap="2" mb="3">
                      {draftWeek.themes.map((draftTheme, themeIndex) => {
                        const isFirstTheme = themeIndex === 0;
                        const isLastTheme =
                          themeIndex === draftWeek.themes.length - 1;

                        return (
                          <Flex
                            key={draftTheme.clientKey}
                            align="center"
                            gap="2"
                            wrap="wrap"
                          >
                            <TextField.Root
                              disabled={areInputsDisabled === true}
                              value={draftTheme.name}
                              placeholder="Theme name"
                              style={{ flex: "1 1 auto", minWidth: "8rem" }}
                              onChange={(event) => {
                                const updatedDraftWeeks = draftWeeks.map(
                                  (week) => {
                                    if (
                                      week.clientKey !== draftWeek.clientKey
                                    ) {
                                      return week;
                                    }
                                    const updatedThemes = week.themes.map(
                                      (theme) => {
                                        if (
                                          theme.clientKey !==
                                          draftTheme.clientKey
                                        ) {
                                          return theme;
                                        }
                                        return {
                                          ...theme,
                                          name: event.target.value,
                                        };
                                      },
                                    );
                                    return {
                                      ...week,
                                      themes: updatedThemes,
                                    };
                                  },
                                );
                                onDraftWeeksChange(updatedDraftWeeks);
                              }}
                            />
                            <Button
                              type="button"
                              size="1"
                              variant="soft"
                              disabled={
                                isFirstTheme === true ||
                                areInputsDisabled === true
                              }
                              onClick={() => {
                                if (themeIndex === 0) {
                                  return;
                                }
                                const updatedDraftWeeks = draftWeeks.map(
                                  (week) => {
                                    if (
                                      week.clientKey !== draftWeek.clientKey
                                    ) {
                                      return week;
                                    }
                                    const reorderedThemes = [...week.themes];
                                    const previousTheme =
                                      reorderedThemes[themeIndex - 1];
                                    const currentTheme =
                                      reorderedThemes[themeIndex];
                                    if (
                                      previousTheme === undefined ||
                                      currentTheme === undefined
                                    ) {
                                      return week;
                                    }
                                    reorderedThemes[themeIndex - 1] =
                                      currentTheme;
                                    reorderedThemes[themeIndex] = previousTheme;
                                    return {
                                      ...week,
                                      themes: reorderedThemes,
                                    };
                                  },
                                );
                                onDraftWeeksChange(updatedDraftWeeks);
                              }}
                            >
                              Up
                            </Button>
                            <Button
                              type="button"
                              size="1"
                              variant="soft"
                              disabled={
                                isLastTheme === true ||
                                areInputsDisabled === true
                              }
                              onClick={() => {
                                if (
                                  themeIndex ===
                                  draftWeek.themes.length - 1
                                ) {
                                  return;
                                }
                                const updatedDraftWeeks = draftWeeks.map(
                                  (week) => {
                                    if (
                                      week.clientKey !== draftWeek.clientKey
                                    ) {
                                      return week;
                                    }
                                    const reorderedThemes = [...week.themes];
                                    const nextTheme =
                                      reorderedThemes[themeIndex + 1];
                                    const currentTheme =
                                      reorderedThemes[themeIndex];
                                    if (
                                      nextTheme === undefined ||
                                      currentTheme === undefined
                                    ) {
                                      return week;
                                    }
                                    reorderedThemes[themeIndex + 1] =
                                      currentTheme;
                                    reorderedThemes[themeIndex] = nextTheme;
                                    return {
                                      ...week,
                                      themes: reorderedThemes,
                                    };
                                  },
                                );
                                onDraftWeeksChange(updatedDraftWeeks);
                              }}
                            >
                              Down
                            </Button>
                            <Button
                              type="button"
                              size="1"
                              color="red"
                              variant="soft"
                              disabled={areInputsDisabled === true}
                              onClick={() => {
                                const updatedDraftWeeks = draftWeeks.map(
                                  (week) => {
                                    if (
                                      week.clientKey !== draftWeek.clientKey
                                    ) {
                                      return week;
                                    }
                                    const themesWithoutRemoved =
                                      week.themes.filter(
                                        (theme) =>
                                          theme.clientKey !==
                                          draftTheme.clientKey,
                                      );
                                    return {
                                      ...week,
                                      themes: themesWithoutRemoved,
                                    };
                                  },
                                );
                                onDraftWeeksChange(updatedDraftWeeks);
                              }}
                            >
                              Remove
                            </Button>
                          </Flex>
                        );
                      })}
                    </Flex>
                  )}
                  <Flex direction="column" gap="2">
                    <TextField.Root
                      disabled={areInputsDisabled === true}
                      value={newThemeNameForWeek}
                      placeholder="New theme name"
                      onChange={(event) => {
                        setNewThemeNameByWeekClientKey((previousValue) => ({
                          ...previousValue,
                          [draftWeek.clientKey]: event.target.value,
                        }));
                      }}
                    />
                    <Button
                      type="button"
                      size="2"
                      variant="soft"
                      disabled={isAddThemeDisabled}
                      onClick={() => {
                        if (trimmedNewThemeNameForWeek.length === 0) {
                          return;
                        }
                        const updatedDraftWeeks = draftWeeks.map((week) => {
                          if (week.clientKey !== draftWeek.clientKey) {
                            return week;
                          }
                          return {
                            ...week,
                            themes: [
                              ...week.themes,
                              {
                                clientKey: createDraftClientKey(),
                                name: trimmedNewThemeNameForWeek,
                              },
                            ],
                          };
                        });
                        onDraftWeeksChange(updatedDraftWeeks);
                        setNewThemeNameByWeekClientKey((previousValue) => ({
                          ...previousValue,
                          [draftWeek.clientKey]: "",
                        }));
                      }}
                    >
                      Add theme
                    </Button>
                  </Flex>
                </Box>
              </Card>
            );
          })}
        </Flex>
      )}
      <Button
        type="button"
        size="2"
        variant="soft"
        disabled={areInputsDisabled === true}
        onClick={() => {
          onDraftWeeksChange([
            ...draftWeeks,
            {
              clientKey: createDraftClientKey(),
              themes: [],
            },
          ]);
        }}
      >
        Add week
      </Button>
    </Box>
  );
}
