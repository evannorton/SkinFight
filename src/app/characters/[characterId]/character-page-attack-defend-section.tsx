"use client";

import {
  Box,
  Button,
  Dialog,
  Flex,
  Heading,
  Link,
  RadioGroup,
  Select,
  Text,
} from "@radix-ui/themes";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import type { ChangeEvent, FormEvent, ReactElement } from "react";
import { useEffect, useRef, useState } from "react";

import { CharacterSkinViewer } from "~/app/_components/character-skin-viewer";
import {
  ATTACK_DEFEND_SHADING_OPTIONS,
  formatAttackDefendShadingLabelWithPointValue,
  isAttackDefendShadingValue,
  type AttackDefendShadingValue,
} from "~/lib/attack-defend-shading";
import { buildCharactersPagePath } from "~/lib/characters-grid-filters";
import { parseJsonApiErrorMessage } from "~/lib/parse-json-api-error-message";
import type {
  CharacterAttackForDisplay,
  CharacterDefendForDisplay,
  CharacterPageViewerActionAvailability,
  ThemeForAttackDefendSubmission,
} from "~/lib/character-page-for-display";

const ATTACK_DEFEND_NO_THEME_SELECT_VALUE = "__none__";

type CharacterPageAttackDefendSectionProps = {
  characterId: string;
  characterName: string;
  viewerActionAvailability: CharacterPageViewerActionAvailability;
  viewerIsAdmin: boolean;
  submissionThemesForCurrentWeek: ThemeForAttackDefendSubmission[];
  attacks: CharacterAttackForDisplay[];
  defends: CharacterDefendForDisplay[];
  initialAttackId: string | null;
  initialDefendId: string | null;
};

type OpenSubmissionModalKind = "attack" | "defend" | null;

type ViewingAttackOrDefend = {
  kind: "attack" | "defend";
  id: string;
  fileUrl: string;
  shading: AttackDefendShadingValue;
  themeName: string | null;
  isHidden: boolean;
  submitterUserId: string;
  submitterDisplayName: string;
  submitterTeamId: string;
} | null;

function buildViewingAttackFromDisplayRow(
  attackRow: CharacterAttackForDisplay,
): ViewingAttackOrDefend {
  return {
    kind: "attack",
    id: attackRow.id,
    fileUrl: attackRow.fileUrl,
    shading: attackRow.shading,
    themeName: attackRow.themeName,
    isHidden: attackRow.isHidden === true,
    submitterUserId: attackRow.submitterUserId,
    submitterDisplayName: attackRow.submitterDisplayName,
    submitterTeamId: attackRow.submitterTeamId,
  };
}

function buildViewingDefendFromDisplayRow(
  defendRow: CharacterDefendForDisplay,
): ViewingAttackOrDefend {
  return {
    kind: "defend",
    id: defendRow.id,
    fileUrl: defendRow.fileUrl,
    shading: defendRow.shading,
    themeName: defendRow.themeName,
    isHidden: defendRow.isHidden === true,
    submitterUserId: defendRow.submitterUserId,
    submitterDisplayName: defendRow.submitterDisplayName,
    submitterTeamId: defendRow.submitterTeamId,
  };
}

function findAttackRowById(
  attacks: CharacterAttackForDisplay[],
  attackId: string,
): CharacterAttackForDisplay | null {
  const attackRow = attacks.find((attack) => {
    return attack.id === attackId;
  });
  if (attackRow === undefined) {
    return null;
  }
  return attackRow;
}

function findDefendRowById(
  defends: CharacterDefendForDisplay[],
  defendId: string,
): CharacterDefendForDisplay | null {
  const defendRow = defends.find((defend) => {
    return defend.id === defendId;
  });
  if (defendRow === undefined) {
    return null;
  }
  return defendRow;
}

function buildCharacterAttackOrDefendSharePath(
  characterId: string,
  viewingAttackOrDefend: NonNullable<ViewingAttackOrDefend>,
): string {
  const searchParamName =
    viewingAttackOrDefend.kind === "attack" ? "attackID" : "defendID";
  const urlSearchParams = new URLSearchParams();
  urlSearchParams.set(searchParamName, viewingAttackOrDefend.id);
  return `/characters/${characterId}?${urlSearchParams.toString()}`;
}

type CharacterAttackOrDefendCopyLinkButtonProps = {
  characterId: string;
  viewingAttackOrDefend: NonNullable<ViewingAttackOrDefend>;
};

function CharacterAttackOrDefendCopyLinkButton(
  props: CharacterAttackOrDefendCopyLinkButtonProps,
): ReactElement {
  const { characterId, viewingAttackOrDefend } = props;
  const [hasCopiedLink, setHasCopiedLink] = useState<boolean>(false);
  const [copyLinkErrorMessage, setCopyLinkErrorMessage] = useState<
    string | null
  >(null);

  const handleCopyLink = async (): Promise<void> => {
    setCopyLinkErrorMessage(null);
    const sharePath = buildCharacterAttackOrDefendSharePath(
      characterId,
      viewingAttackOrDefend,
    );
    const shareUrl = `${window.location.origin}${sharePath}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setHasCopiedLink(true);
      window.setTimeout(() => {
        setHasCopiedLink(false);
      }, 2000);
    } catch {
      setCopyLinkErrorMessage("Failed to copy link.");
    }
  };

  return (
    <Flex direction="column" gap="1" align="start">
      <Button
        type="button"
        variant="soft"
        color="gray"
        onClick={() => {
          void handleCopyLink();
        }}
      >
        {hasCopiedLink === true ? "Copied!" : "Copy link"}
      </Button>
      {copyLinkErrorMessage !== null && (
        <Text size="1" color="red">
          {copyLinkErrorMessage}
        </Text>
      )}
    </Flex>
  );
}

export function CharacterPageAttackDefendSection(
  props: CharacterPageAttackDefendSectionProps,
): ReactElement {
  const {
    characterId,
    characterName,
    viewerActionAvailability,
    viewerIsAdmin,
    submissionThemesForCurrentWeek,
    attacks,
    defends,
    initialAttackId,
    initialDefendId,
  } = props;
  const router = useRouter();
  const hasOpenedAttackOrDefendFromSearchParamsRef = useRef<boolean>(false);
  const submissionPngFileInputRef = useRef<HTMLInputElement>(null);
  const [openSubmissionModalKind, setOpenSubmissionModalKind] =
    useState<OpenSubmissionModalKind>(null);
  const [viewingAttackOrDefend, setViewingAttackOrDefend] =
    useState<ViewingAttackOrDefend>(null);
  const [selectedSubmissionPngFile, setSelectedSubmissionPngFile] =
    useState<File | null>(null);
  const [selectedSubmissionShading, setSelectedSubmissionShading] =
    useState<AttackDefendShadingValue | null>(null);
  const [selectedSubmissionThemeId, setSelectedSubmissionThemeId] = useState<
    string | null
  >(null);
  const [isSubmittingAttackOrDefend, setIsSubmittingAttackOrDefend] =
    useState<boolean>(false);
  const [submissionErrorMessage, setSubmissionErrorMessage] = useState<
    string | null
  >(null);

  const attackIdFromSearchParams = initialAttackId;
  const defendIdFromSearchParams = initialDefendId;

  useEffect(() => {
    if (hasOpenedAttackOrDefendFromSearchParamsRef.current === true) {
      return;
    }

    if (attackIdFromSearchParams !== null) {
      const attackRow = findAttackRowById(attacks, attackIdFromSearchParams);
      if (attackRow !== null) {
        setViewingAttackOrDefend(buildViewingAttackFromDisplayRow(attackRow));
        hasOpenedAttackOrDefendFromSearchParamsRef.current = true;
        return;
      }
    }

    if (defendIdFromSearchParams !== null) {
      const defendRow = findDefendRowById(defends, defendIdFromSearchParams);
      if (defendRow !== null) {
        setViewingAttackOrDefend(buildViewingDefendFromDisplayRow(defendRow));
        hasOpenedAttackOrDefendFromSearchParamsRef.current = true;
      }
    }
  }, [attackIdFromSearchParams, defendIdFromSearchParams, attacks, defends]);

  const handleCloseViewingAttackOrDefendModal = (): void => {
    setViewingAttackOrDefend(null);

    if (
      attackIdFromSearchParams === null &&
      defendIdFromSearchParams === null
    ) {
      return;
    }

    router.replace(`/characters/${characterId}`, { scroll: false });
  };

  const hasAttackOrDefendButtons =
    viewerActionAvailability.canShowAttackButton === true ||
    viewerActionAvailability.canShowDefendButton === true;

  const isSubmitDisabled =
    isSubmittingAttackOrDefend === true ||
    selectedSubmissionPngFile === null ||
    selectedSubmissionShading === null;

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
    setSelectedSubmissionShading(null);
    setSelectedSubmissionThemeId(null);
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
    if (selectedSubmissionShading === null) {
      return;
    }

    setIsSubmittingAttackOrDefend(true);
    setSubmissionErrorMessage(null);

    const submissionFormData = new FormData();
    submissionFormData.append("file", selectedSubmissionPngFile);
    submissionFormData.append("shading", selectedSubmissionShading);
    if (selectedSubmissionThemeId !== null) {
      submissionFormData.append("themeId", selectedSubmissionThemeId);
    }

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

              <Flex direction="column" gap="2">
                <Text as="label" size="2" weight="medium">
                  Shading
                </Text>
                <RadioGroup.Root
                  value={selectedSubmissionShading ?? ""}
                  disabled={isSubmittingAttackOrDefend === true}
                  onValueChange={(selectedValue) => {
                    if (isAttackDefendShadingValue(selectedValue) === true) {
                      setSelectedSubmissionShading(selectedValue);
                      setSubmissionErrorMessage(null);
                    }
                  }}
                >
                  <Flex gap="4">
                    {ATTACK_DEFEND_SHADING_OPTIONS.map((shadingOption) => {
                      return (
                        <Text key={shadingOption} as="label" size="2">
                          <Flex align="center" gap="2">
                            <RadioGroup.Item value={shadingOption} />
                            {formatAttackDefendShadingLabelWithPointValue(
                              shadingOption,
                            )}
                          </Flex>
                        </Text>
                      );
                    })}
                  </Flex>
                </RadioGroup.Root>
              </Flex>

              {submissionThemesForCurrentWeek.length > 0 && (
                <Flex direction="column" gap="1">
                  <Text
                    as="label"
                    size="2"
                    weight="medium"
                    htmlFor="character-submission-theme"
                  >
                    Theme (optional)
                  </Text>
                  <Select.Root
                    value={
                      selectedSubmissionThemeId ??
                      ATTACK_DEFEND_NO_THEME_SELECT_VALUE
                    }
                    disabled={isSubmittingAttackOrDefend === true}
                    onValueChange={(selectedValue) => {
                      if (
                        selectedValue === ATTACK_DEFEND_NO_THEME_SELECT_VALUE
                      ) {
                        setSelectedSubmissionThemeId(null);
                        setSubmissionErrorMessage(null);
                        return;
                      }
                      setSelectedSubmissionThemeId(selectedValue);
                      setSubmissionErrorMessage(null);
                    }}
                  >
                    <Select.Trigger
                      id="character-submission-theme"
                      placeholder="No theme"
                    />
                    <Select.Content>
                      <Select.Item value={ATTACK_DEFEND_NO_THEME_SELECT_VALUE}>
                        No theme
                      </Select.Item>
                      {submissionThemesForCurrentWeek.map((themeRow) => {
                        return (
                          <Select.Item
                            key={themeRow.themeId}
                            value={themeRow.themeId}
                          >
                            {themeRow.themeName}
                          </Select.Item>
                        );
                      })}
                    </Select.Content>
                  </Select.Root>
                </Flex>
              )}

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
                <Button type="submit" disabled={isSubmitDisabled === true}>
                  {isSubmittingAttackOrDefend === true
                    ? "Submitting…"
                    : "Submit"}
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
          {attacks.map((attackRow: CharacterAttackForDisplay) => {
            return (
              <CharacterAttackOrDefendListItem
                key={attackRow.id}
                fileUrl={attackRow.fileUrl}
                shadingLabel={formatAttackDefendShadingLabelWithPointValue(
                  attackRow.shading,
                )}
                themeName={attackRow.themeName}
                submitterDisplayName={attackRow.submitterDisplayName}
                submitterTeamName={attackRow.submitterTeamName}
                onClickSkinPreview={() => {
                  setViewingAttackOrDefend(
                    buildViewingAttackFromDisplayRow(attackRow),
                  );
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
        open={viewingAttackOrDefend !== null}
        onOpenChange={(isOpen) => {
          if (isOpen === false) {
            handleCloseViewingAttackOrDefendModal();
          }
        }}
      >
        <Dialog.Content style={{ maxWidth: "min(28rem, 100vw - 2rem)" }}>
          <Dialog.Title>{characterName}</Dialog.Title>

          {viewerIsAdmin === true && viewingAttackOrDefend !== null && (
            <AttackDefendAdminSection
              attackOrDefendKind={viewingAttackOrDefend.kind}
              attackOrDefendId={viewingAttackOrDefend.id}
              isHidden={viewingAttackOrDefend.isHidden}
              onUpdate={(newHiddenState) => {
                setViewingAttackOrDefend({
                  ...viewingAttackOrDefend,
                  isHidden: newHiddenState,
                });
                router.refresh();
              }}
            />
          )}
          <Flex direction="column" gap="4">
            {viewingAttackOrDefend !== null && (
              <Text as="p" size="3">
                <Text weight="medium">Shading: </Text>
                {formatAttackDefendShadingLabelWithPointValue(
                  viewingAttackOrDefend.shading,
                )}
              </Text>
            )}

            {viewingAttackOrDefend !== null &&
              viewingAttackOrDefend.themeName !== null && (
                <Text as="p" size="3">
                  <Text weight="medium">Theme: </Text>
                  {viewingAttackOrDefend.themeName} (1.5x points)
                </Text>
              )}

            {viewingAttackOrDefend !== null && (
              <Text as="p" size="3">
                <Text weight="medium">User: </Text>
                <Link asChild underline="hover">
                  <NextLink
                    href={buildCharactersPagePath({
                      teamId: viewingAttackOrDefend.submitterTeamId,
                      eventId: null,
                      userId: viewingAttackOrDefend.submitterUserId,
                    })}
                  >
                    {viewingAttackOrDefend.submitterDisplayName}
                  </NextLink>
                </Link>
              </Text>
            )}

            <Flex direction="column" align="center">
              {viewingAttackOrDefend !== null && (
                <CharacterSkinViewer
                  skinFileUrl={viewingAttackOrDefend.fileUrl}
                  widthPx={320}
                  heightPx={400}
                />
              )}
            </Flex>

            <Flex
              gap="3"
              justify="between"
              width="100%"
              align="end"
              wrap="wrap"
            >
              {viewingAttackOrDefend !== null && (
                <CharacterAttackOrDefendCopyLinkButton
                  characterId={characterId}
                  viewingAttackOrDefend={viewingAttackOrDefend}
                />
              )}
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
          {defends.map((defendRow: CharacterDefendForDisplay) => {
            return (
              <CharacterAttackOrDefendListItem
                key={defendRow.id}
                fileUrl={defendRow.fileUrl}
                shadingLabel={formatAttackDefendShadingLabelWithPointValue(
                  defendRow.shading,
                )}
                themeName={defendRow.themeName}
                submitterDisplayName={defendRow.submitterDisplayName}
                submitterTeamName={defendRow.submitterTeamName}
                onClickSkinPreview={() => {
                  setViewingAttackOrDefend(
                    buildViewingDefendFromDisplayRow(defendRow),
                  );
                }}
              />
            );
          })}
        </Flex>
      )}
    </Box>
  );
}

type AttackDefendAdminSectionProps = {
  attackOrDefendKind: "attack" | "defend";
  attackOrDefendId: string;
  isHidden: boolean;
  onUpdate: (newHiddenState: boolean) => void;
};

function AttackDefendAdminSection(
  props: AttackDefendAdminSectionProps,
): ReactElement {
  const { attackOrDefendKind, attackOrDefendId, isHidden, onUpdate } = props;
  const [isTogglingHiddenState, setIsTogglingHiddenState] =
    useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const itemTypeName = attackOrDefendKind === "attack" ? "attack" : "defend";
  const apiEndpoint =
    attackOrDefendKind === "attack"
      ? `/api/attacks/${attackOrDefendId}/hide`
      : `/api/defends/${attackOrDefendId}/hide`;

  const handleToggleHiddenState = async (): Promise<void> => {
    setIsTogglingHiddenState(true);
    setErrorMessage(null);

    const newHiddenState = isHidden === false;

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isHidden: newHiddenState }),
      });

      if (response.ok === false) {
        const errorMessage = await parseJsonApiErrorMessage(
          response,
          `Failed to update ${itemTypeName} visibility.`,
        );
        setErrorMessage(errorMessage);
        setIsTogglingHiddenState(false);
        return;
      }

      onUpdate(newHiddenState);
      setIsTogglingHiddenState(false);
    } catch {
      setErrorMessage(`Failed to update ${itemTypeName} visibility.`);
      setIsTogglingHiddenState(false);
    }
  };

  return (
    <Box
      p="3"
      my="3"
      style={{
        borderRadius: "var(--radius-3)",
        backgroundColor: "var(--gray-a3)",
      }}
    >
      <Flex direction="column" gap="3">
        <Heading as="h3" size="2" weight="bold">
          Admin Actions
        </Heading>
        <Flex direction="column" gap="2">
          <Text size="2" weight="medium">
            {isHidden === true
              ? `This ${itemTypeName} is currently hidden to all non-admin users`
              : `This ${itemTypeName} is currently visible to all users`}
          </Text>
          <Box>
            <Button
              type="button"
              size="2"
              color={isHidden === true ? "green" : "red"}
              variant="soft"
              disabled={isTogglingHiddenState === true}
              onClick={handleToggleHiddenState}
            >
              {isTogglingHiddenState === true
                ? "Updating..."
                : isHidden === true
                  ? `Unhide ${itemTypeName}`
                  : `Hide ${itemTypeName}`}
            </Button>
          </Box>
          {errorMessage !== null && (
            <Text size="2" color="red">
              {errorMessage}
            </Text>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}

type CharacterAttackOrDefendListItemProps = {
  fileUrl: string;
  shadingLabel: string;
  themeName: string | null;
  submitterDisplayName: string;
  submitterTeamName: string;
  onClickSkinPreview: () => void;
};

function CharacterAttackOrDefendListItem(
  props: CharacterAttackOrDefendListItemProps,
): ReactElement {
  const {
    fileUrl,
    shadingLabel,
    themeName,
    submitterDisplayName,
    submitterTeamName,
    onClickSkinPreview,
  } = props;

  const themeSummaryText = themeName !== null ? ` · Theme ${themeName}` : "";

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
          {submitterTeamName} · Shading {shadingLabel}
          {themeSummaryText}
        </Text>
      </Flex>
    </Flex>
  );
}
