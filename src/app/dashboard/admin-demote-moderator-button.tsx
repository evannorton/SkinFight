"use client";

import { AlertDialog, Button, Flex, IconButton, Text } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import type { ReactElement } from "react";
import { useState } from "react";

import { api } from "~/trpc/react";

type AdminDemoteModeratorButtonProps = {
  userId: string;
  userDisplayName: string;
};

function DemoteModeratorCloseIcon(): ReactElement {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 15 15"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
      />
    </svg>
  );
}

export function AdminDemoteModeratorButton(
  props: AdminDemoteModeratorButtonProps,
): ReactElement {
  const { userId, userDisplayName } = props;
  const router = useRouter();
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] =
    useState<boolean>(false);

  const demoteFromModeratorMutation = api.user.demoteFromModerator.useMutation({
    onSuccess: () => {
      setIsConfirmDialogOpen(false);
      router.refresh();
    },
  });

  const isDemotePending = demoteFromModeratorMutation.isPending === true;

  return (
    <>
      <IconButton
        type="button"
        size="1"
        variant="ghost"
        color="red"
        aria-label={`Demote ${userDisplayName} from moderator`}
        onClick={() => {
          setIsConfirmDialogOpen(true);
        }}
      >
        <DemoteModeratorCloseIcon />
      </IconButton>

      <AlertDialog.Root
        open={isConfirmDialogOpen === true}
        onOpenChange={(open) => {
          if (isDemotePending === false) {
            setIsConfirmDialogOpen(open);
            if (open === false) {
              demoteFromModeratorMutation.reset();
            }
          }
        }}
      >
        <AlertDialog.Content style={{ maxWidth: "min(24rem, 100vw - 2rem)" }}>
          <AlertDialog.Title>Demote moderator?</AlertDialog.Title>
          <AlertDialog.Description size="2" mt="2">
            This will demote &quot;{userDisplayName}&quot; from moderator to
            user.
          </AlertDialog.Description>
          {demoteFromModeratorMutation.error !== null && (
            <Text size="2" color="red" mt="2">
              {demoteFromModeratorMutation.error.message}
            </Text>
          )}
          <Flex gap="2" justify="end" mt="4">
            <AlertDialog.Cancel>
              <Button type="button" variant="soft" disabled={isDemotePending}>
                Cancel
              </Button>
            </AlertDialog.Cancel>
            <Button
              type="button"
              color="red"
              disabled={isDemotePending === true}
              onClick={() => {
                demoteFromModeratorMutation.mutate({ userId });
              }}
            >
              {isDemotePending === true ? "Demoting…" : "Confirm"}
            </Button>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </>
  );
}
