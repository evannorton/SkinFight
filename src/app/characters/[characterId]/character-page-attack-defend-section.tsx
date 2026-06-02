"use client";

import {
  Box,
  Button,
  Dialog,
  Flex,
  Heading,
  Text,
} from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import type { ChangeEvent, FormEvent, ReactElement } from "react";
import { useRef, useState } from "react";

import { CharacterSkinViewer } from "~/app/_components/character-skin-viewer";

import { parseJsonApiErrorMessage } from "~/lib/parse-json-api-error-message";
import type {
  CharacterAttackForDisplay,
  CharacterDefendForDisplay,
  CharacterPageViewerActionAvailability,
} from "~/lib/character-page-for-display";

type CharacterPageAttackDefendSectionProps = {
  characterId: string;
  characterName: string;
  viewerActionAvailability: CharacterPageViewerActionAvailability;
  attacks: CharacterAttackForDisplay[];
  defends: CharacterDefendForDisplay[];
};

type OpenSubmissionModalKind = "attack" | "defend" | null;

export function CharacterPageAttackDefendSection(
  props: CharacterPageAttackDefendSectionProps,
): ReactElement {
  const { characterId, characterName, viewerActionAvailability, attacks, defends } = props;
  const router = useRouter();
  const submissionPngFileInputRef = useRef<HTMLInputElement>(null);
  const [openSubmissionModalKind, setOpenSubmissionModalKind] =
    useState<OpenSubmissionModalKind>(null);
  const [viewingSkinFileUrl, setViewingSkinFileUrl] = useState<string | null>(null);
  const [selectedSubmissionPngFile, setSelectedSubmissionPngFile] =
    useState<File | null>(null);
  const [isSubmittingAttackOrDefend, setIsSubmittingAttackOrDefend] =
    useState<boolean>(false);
  const [submissionErrorMessage, setSubmissionErrorMessage] = useState<
    string | null
  >(null);

  const hasAttackOrDefendButtons =
    viewerActionAvailability.canShowAttackButton === true ||
    viewerActionAvailability.canShowDefendButton === true;

  const isSubmitDisabled =
    isSubmittingAttackOrDefend === true || selectedSubmissionPngFile === null;

  const handleSubmissionPngFileInputChange = (
    event: ChangeEvent<HTMLInputElement>,
  ): void => {
    const selectedFile = event.target.files?.[0] ?? null;
    setSelectedSubmissionPngFile(selectedFile);
    setSubmissionErrorMessage(null);
  };

  const handleCloseSubmissionModal = (): void => {
    setOpenSubmissionModalKind(null);
    setSelectedSubmissionPngFile(null);
    setSubmissionErrorMessage(null);
    if (submissionPngFileInputRef.current !== null) {
      submissionPngFileInputRef.current.value = "";
    }
  };

  const handleSubmissionFormSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    if (openSubmissionModalKind === null) {
      return;
    }
    if (isSubmitDisabled === true) {
      return;
    }
    if (selectedSubmissionPngFile === null) {
      return;
    }

    setIsSubmittingAttackOrDefend(true);
    setSubmissionErrorMessage(null);

    const submissionFormData = new FormData();
    submissionFormData.append("file", selectedSubmissionPngFile);

    const submissionApiPath =
      openSubmissionModalKind === "attack"
        ? `/api/characters/${characterId}/attacks`
        : `/api/characters/${characterId}/defends`;

    try {
      const submissionResponse = await fetch(submissionApiPath, {
        method: "POST",
        body: submissionFormData,
      });

      if (submissionResponse.ok === false) {
        const errorMessage = await parseJsonApiErrorMessage(
          submissionResponse,
          openSubmissionModalKind === "attack"
            ? "Failed to submit attack."
            : "Failed to submit defend.",
        );
        setSubmissionErrorMessage(errorMessage);
        setIsSubmittingAttackOrDefend(false);
        return;
      }

      handleCloseSubmissionModal();
      setIsSubmittingAttackOrDefend(false);
      router.refresh();
    } catch {
      setSubmissionErrorMessage(
        openSubmissionModalKind === "attack"
          ? "Failed to submit attack."
          : "Failed to submit defend.",
      );
      setIsSubmittingAttackOrDefend(false);
    }
  };

  const submissionModalTitle =
    openSubmissionModalKind === "attack" ? "Submit attack" : "Submit defend";

  const submissionModalDescription =
    openSubmissionModalKind === "attack"
      ? "Upload a PNG image for this attack."
      : "Upload a PNG image for this defend.";

  return (
    <Box mt="8">
      {hasAttackOrDefendButtons === true && (
        <Flex gap="3" mb="6" wrap="wrap">
          {viewerActionAvailability.canShowAttackButton === true && (
            <Button
              type="button"
              color="red"
              variant="soft"
              onClick={() => {
                setOpenSubmissionModalKind("attack");
              }}
            >
              Attack
            </Button>
          )}
          {viewerActionAvailability.canShowDefendButton === true && (
            <Button
              type="button"
              color="green"
              variant="soft"
              onClick={() => {
                setOpenSubmissionModalKind("defend");
              }}
            >
              Defend
            </Button>
          )}
        </Flex>
      )}

      <Dialog.Root
        open={openSubmissionModalKind !== null}
        onOpenChange={(isDialogOpen) => {
          if (isDialogOpen === false) {
            handleCloseSubmissionModal();
          }
        }}
      >
        <Dialog.Content style={{ maxWidth: "min(28rem, 100vw - 2rem)" }}>
          <Dialog.Title>{submissionModalTitle}</Dialog.Title>
          <Dialog.Description size="2" color="gray" mb="3">
            {submissionModalDescription}
          </Dialog.Description>

          <form onSubmit={handleSubmissionFormSubmit}>
            <Flex direction="column" gap="3">
              <Flex direction="column" gap="1">
                <Text
                  as="label"
                  size="2"
                  weight="medium"
                  htmlFor="character-submission-png-file"
                >
                  PNG file
                </Text>
                <input
                  ref={submissionPngFileInputRef}
                  id="character-submission-png-file"
                  type="file"
                  accept="image/png,.png"
                  disabled={isSubmittingAttackOrDefend === true}
                  onChange={handleSubmissionPngFileInputChange}
                />
                {selectedSubmissionPngFile !== null && (
                  <Text size="2" color="gray">
                    Selected: {selectedSubmissionPngFile.name}
                  </Text>
                )}
              </Flex>

              {submissionErrorMessage !== null && (
                <Text size="2" color="red">
                  {submissionErrorMessage}
                </Text>
              )}

              <Flex gap="3" justify="end" mt="2">
                <Dialog.Close>
                  <Button
                    type="button"
                    variant="soft"
                    color="gray"
                    disabled={isSubmittingAttackOrDefend === true}
                  >
                    Cancel
                  </Button>
                </Dialog.Close>
                <Button
                  type="submit"
                  disabled={isSubmitDisabled === true}
                >
                  {isSubmittingAttackOrDefend === true ? "Submitting…" : "Submit"}
                </Button>
              </Flex>
            </Flex>
          </form>
        </Dialog.Content>
      </Dialog.Root>

      <Heading as="h2" size="5" weight="bold" mb="3">
        Attacks
      </Heading>
      {attacks.length === 0 && (
        <Text as="p" size="3" color="gray" mb="6">
          No attacks yet.
        </Text>
      )}
      {attacks.length > 0 && (
        <Flex direction="column" gap="3" mb="6">
          {attacks.map((attackRow) => {
            return (
              <CharacterAttackOrDefendListItem
                key={attackRow.id}
                fileUrl={attackRow.fileUrl}
                submitterDisplayName={attackRow.submitterDisplayName}
                submitterTeamName={attackRow.submitterTeamName}
                onClickSkinPreview={() => {
                  setViewingSkinFileUrl(attackRow.fileUrl);
                }}
              />
            );
          })}
        </Flex>
      )}

      <Heading as="h2" size="5" weight="bold" mb="3">
        Defends
      </Heading>
      {defends.length === 0 && (
        <Text as="p" size="3" color="gray">
          No defends yet.
        </Text>
      )}
      <Dialog.Root
        open={viewingSkinFileUrl !== null}
        onOpenChange={(isOpen) => {
          if (isOpen === false) {
            setViewingSkinFileUrl(null);
          }
        }}
      >
        <Dialog.Content style={{ maxWidth: "min(24rem, 100vw - 2rem)" }}>
          <Dialog.Title>{characterName}</Dialog.Title>
          <Flex direction="column" align="center" gap="3">
            {viewingSkinFileUrl !== null && (
              <CharacterSkinViewer
                skinFileUrl={viewingSkinFileUrl}
                widthPx={320}
                heightPx={400}
              />
            )}
            <Flex gap="3" justify="end" width="100%">
              <Dialog.Close>
                <Button type="button" variant="soft" color="gray">
                  Close
                </Button>
              </Dialog.Close>
            </Flex>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {defends.length > 0 && (
        <Flex direction="column" gap="3">
          {defends.map((defendRow) => {
            return (
              <CharacterAttackOrDefendListItem
                key={defendRow.id}
                fileUrl={defendRow.fileUrl}
                submitterDisplayName={defendRow.submitterDisplayName}
                submitterTeamName={defendRow.submitterTeamName}
                onClickSkinPreview={() => {
                  setViewingSkinFileUrl(defendRow.fileUrl);
                }}
              />
            );
          })}
        </Flex>
      )}
    </Box>
  );
}

type CharacterAttackOrDefendListItemProps = {
  fileUrl: string;
  submitterDisplayName: string;
  submitterTeamName: string;
  onClickSkinPreview: () => void;
};

function CharacterAttackOrDefendListItem(
  props: CharacterAttackOrDefendListItemProps,
): ReactElement {
  const { fileUrl, submitterDisplayName, submitterTeamName, onClickSkinPreview } =
    props;

  return (
    <Flex
      align="center"
      gap="3"
      p="3"
      style={{
        border: "1px solid var(--gray-a6)",
        borderRadius: "var(--radius-3)",
        cursor: "pointer",
      }}
      onClick={onClickSkinPreview}
    >
      <Box
        style={{
          width: "64px",
          height: "64px",
          flexShrink: 0,
          overflow: "hidden",
          borderRadius: "var(--radius-2)",
          backgroundColor: "var(--gray-a3)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="skinfight-skin-png-image"
          src={fileUrl}
          alt="Click to view 3D skin"
          width={64}
          height={64}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: "block",
          }}
        />
      </Box>
      <Flex direction="column" gap="1" style={{ flex: 1 }}>
        <Text size="3" weight="medium">
          {submitterDisplayName}
        </Text>
        <Text size="2" color="gray">
          {submitterTeamName}
        </Text>
      </Flex>
    </Flex>
  );
}
