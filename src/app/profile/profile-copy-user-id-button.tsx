"use client";

import { Button, Flex, Text } from "@radix-ui/themes";
import type { ReactElement } from "react";
import { useState } from "react";

type ProfileCopyUserIdButtonProps = {
  userId: string;
};

export function ProfileCopyUserIdButton(
  props: ProfileCopyUserIdButtonProps,
): ReactElement {
  const [hasCopiedUserId, setHasCopiedUserId] = useState<boolean>(false);
  const [copyUserIdErrorMessage, setCopyUserIdErrorMessage] = useState<
    string | null
  >(null);

  const handleCopyUserId = async (): Promise<void> => {
    setCopyUserIdErrorMessage(null);
    try {
      await navigator.clipboard.writeText(props.userId);
      setHasCopiedUserId(true);
      window.setTimeout(() => {
        setHasCopiedUserId(false);
      }, 2000);
    } catch {
      setCopyUserIdErrorMessage("Failed to copy user ID.");
    }
  };

  return (
    <Flex direction="column" gap="1" align="start">
      <Button
        type="button"
        variant="soft"
        onClick={() => {
          void handleCopyUserId();
        }}
      >
        {hasCopiedUserId === true ? "Copied!" : "Copy user ID to clipboard"}
      </Button>
      {copyUserIdErrorMessage !== null && (
        <Text size="1" color="red">
          {copyUserIdErrorMessage}
        </Text>
      )}
    </Flex>
  );
}
