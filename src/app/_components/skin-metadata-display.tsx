import { Flex, Link, Text } from "@radix-ui/themes";
import type { ReactElement } from "react";

type SkinMetadataDisplayProps = {
  description: string | null;
  externalSkinUrl: string | null;
};

export function SkinMetadataDisplay(
  props: SkinMetadataDisplayProps,
): ReactElement | null {
  const { description, externalSkinUrl } = props;

  if (description === null && externalSkinUrl === null) {
    return null;
  }

  return (
    <Flex direction="column" gap="2">
      {description !== null && (
        <Text as="p" size="3" style={{ whiteSpace: "pre-wrap" }}>
          {description}
        </Text>
      )}
      {externalSkinUrl !== null && (
        <Text as="p" size="3">
          <Text weight="medium">External skin: </Text>
          <Link href={externalSkinUrl} target="_blank" rel="noopener noreferrer">
            {externalSkinUrl}
          </Link>
        </Text>
      )}
    </Flex>
  );
}
