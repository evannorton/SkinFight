"use client";

import { Box, Button, Flex, Heading, Separator, Text, TextField } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import type { ReactElement } from "react";
import { useState } from "react";

import { api } from "~/trpc/react";

export function AdminPromoteModeratorSection(): ReactElement {
  const router = useRouter();
  const [userIdInput, setUserIdInput] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const promoteToModeratorMutation = api.user.promoteToModerator.useMutation({
    onSuccess: (updatedUser) => {
      const trimmedName = updatedUser.name?.trim() ?? "";
      const displayName =
        trimmedName.length > 0
          ? trimmedName
          : (updatedUser.email ?? updatedUser.id);
      setSuccessMessage(`Promoted ${displayName} to moderator.`);
      setUserIdInput("");
      router.refresh();
    },
    onError: () => {
      setSuccessMessage(null);
    },
  });

  const trimmedUserIdInput = userIdInput.trim();
  const isPromoteFormDisabled = promoteToModeratorMutation.isPending === true;
  const isSubmitDisabled =
    trimmedUserIdInput.length === 0 || isPromoteFormDisabled === true;

  return (
    <Box mt="6">
      <Separator size="4" mb="6" />
      <Heading as="h3" size="5" weight="bold" mb="3">
        Promote to moderator
      </Heading>
      <Text size="2" color="gray" mb="4" as="p">
        Enter a user ID to promote that user from user to moderator.
      </Text>

      <Flex direction="column" gap="3" style={{ maxWidth: "28rem" }}>
        <Text as="label" size="2" weight="medium" htmlFor="promote-user-id">
          User ID
        </Text>
        <TextField.Root
          id="promote-user-id"
          disabled={isPromoteFormDisabled === true}
          value={userIdInput}
          placeholder="User ID"
          onChange={(event) => {
            setUserIdInput(event.target.value);
            setSuccessMessage(null);
          }}
        />
        <Button
          type="button"
          disabled={isSubmitDisabled === true}
          onClick={() => {
            if (trimmedUserIdInput.length > 0) {
              promoteToModeratorMutation.mutate({ userId: trimmedUserIdInput });
            }
          }}
        >
          {promoteToModeratorMutation.isPending === true
            ? "Promoting…"
            : "Promote to moderator"}
        </Button>
        {promoteToModeratorMutation.error !== null && (
          <Text size="2" color="red">
            {promoteToModeratorMutation.error.message}
          </Text>
        )}
        {successMessage !== null && (
          <Text size="2" color="green">
            {successMessage}
          </Text>
        )}
      </Flex>
    </Box>
  );
}
