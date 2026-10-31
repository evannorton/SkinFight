"use client";

import { Flex, Text, TextArea, TextField } from "@radix-ui/themes";
import type { ReactElement } from "react";

type OptionalSkinMetadataFieldsProps = {
  idPrefix: string;
  description: string;
  externalSkinUrl: string;
  isDisabled: boolean;
  onDescriptionChange: (description: string) => void;
  onExternalSkinUrlChange: (externalSkinUrl: string) => void;
};

export function OptionalSkinMetadataFields(
  props: OptionalSkinMetadataFieldsProps,
): ReactElement {
  const {
    idPrefix,
    description,
    externalSkinUrl,
    isDisabled,
    onDescriptionChange,
    onExternalSkinUrlChange,
  } = props;

  const descriptionFieldId = `${idPrefix}-description`;
  const externalSkinUrlFieldId = `${idPrefix}-external-skin-url`;

  return (
    <>
      <Flex direction="column" gap="1">
        <Text as="label" size="2" weight="medium" htmlFor={descriptionFieldId}>
          Description (optional)
        </Text>
        <TextArea
          id={descriptionFieldId}
          value={description}
          placeholder="Optional description"
          disabled={isDisabled === true}
          rows={3}
          onChange={(textAreaChangeEvent) => {
            onDescriptionChange(textAreaChangeEvent.target.value);
          }}
        />
      </Flex>

      <Flex direction="column" gap="1">
        <Text
          as="label"
          size="2"
          weight="medium"
          htmlFor={externalSkinUrlFieldId}
        >
          External skin URL (optional)
        </Text>
        <TextField.Root
          id={externalSkinUrlFieldId}
          value={externalSkinUrl}
          placeholder="https://"
          disabled={isDisabled === true}
          onChange={(textFieldChangeEvent) => {
            onExternalSkinUrlChange(textFieldChangeEvent.target.value);
          }}
        />
      </Flex>
    </>
  );
}
