"use client";

import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Text,
} from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import type { ReactElement } from "react";
import { useState } from "react";

import { parseJsonApiErrorMessage } from "~/lib/parse-json-api-error-message";

type CharacterPageAdminSectionProps = {
  characterId: string;
  characterName: string;
  isCharacterHidden: boolean;
};

export function CharacterPageAdminSection(
  props: CharacterPageAdminSectionProps,
): ReactElement {
  const { characterId, characterName, isCharacterHidden } = props;
  const router = useRouter();
  const [isTogglingHiddenState, setIsTogglingHiddenState] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleToggleHiddenState = async (): Promise<void> => {
    setIsTogglingHiddenState(true);
    setErrorMessage(null);

    const newHiddenState = isCharacterHidden === false;

    try {
      const response = await fetch(`/api/characters/${characterId}/hide`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isHidden: newHiddenState }),
      });

      if (response.ok === false) {
        const errorMessage = await parseJsonApiErrorMessage(
          response,
          "Failed to update character visibility.",
        );
        setErrorMessage(errorMessage);
        setIsTogglingHiddenState(false);
        return;
      }

      router.refresh();
      setIsTogglingHiddenState(false);
    } catch {
      setErrorMessage("Failed to update character visibility.");
      setIsTogglingHiddenState(false);
    }
  };

  return (
    <Box mb="6">
      <Card>
        <Flex direction="column" gap="4">
          <Heading as="h2" size="4" weight="bold">
            Admin Actions
          </Heading>

          <Flex direction="column" gap="2">
            <Text size="2" weight="medium">
              {isCharacterHidden === true
                ? `"${characterName}" is currently hidden to all non-admin users`
                : `"${characterName}" is currently visible to all users`}
            </Text>
            <Box>
              <Button
                type="button"
                color={isCharacterHidden === true ? "green" : "red"}
                variant="soft"
                disabled={isTogglingHiddenState === true}
                onClick={handleToggleHiddenState}
              >
                {isTogglingHiddenState === true
                  ? "Updating..."
                  : isCharacterHidden === true
                    ? "Unhide character"
                    : "Hide character"}
              </Button>
            </Box>
            {errorMessage !== null && (
              <Text size="2" color="red">
                {errorMessage}
              </Text>
            )}
          </Flex>
        </Flex>
      </Card>
    </Box>
  );
}
