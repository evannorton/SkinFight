import { Box, Card, Grid, Heading, Separator, Text } from "@radix-ui/themes";
import type { ReactElement } from "react";

import { db } from "~/server/db";

function formatSupportSubmissionCreatedAtLabel(createdAt: Date): string {
  return createdAt.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export async function AdminSupportSubmissionsSection(): Promise<ReactElement> {
  const supportSubmissionRows = await db.supportSubmission.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      message: true,
      userId: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return (
    <Box mt="6">
      <Separator size="4" mb="6" />
      <Heading as="h3" size="5" weight="bold" mb="3">
        Support requests
      </Heading>

      {supportSubmissionRows.length === 0 && (
        <Text size="2" color="gray">
          No support requests yet.
        </Text>
      )}

      {supportSubmissionRows.length > 0 && (
        <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4" width="100%">
          {supportSubmissionRows.map((supportSubmissionRow) => {
            const createdAtLabel = formatSupportSubmissionCreatedAtLabel(
              supportSubmissionRow.createdAt,
            );
            const linkedAccountLabel =
              supportSubmissionRow.user !== null
                ? (supportSubmissionRow.user.name?.trim() ??
                    supportSubmissionRow.user.email ??
                    supportSubmissionRow.user.id)
                : null;

            return (
              <Card key={supportSubmissionRow.id} size="2" variant="surface">
                <Box p="4">
                  <Heading
                    as="h3"
                    size="3"
                    weight="bold"
                    mb="2"
                    style={{ wordBreak: "break-word" }}
                  >
                    {supportSubmissionRow.name}
                  </Heading>
                  <Text
                    as="p"
                    size="2"
                    color="gray"
                    mb="2"
                    style={{ display: "block" }}
                  >
                    {supportSubmissionRow.email}
                  </Text>
                  <Text
                    as="p"
                    size="2"
                    color="gray"
                    mb="3"
                    style={{ display: "block" }}
                  >
                    {createdAtLabel}
                    {linkedAccountLabel !== null
                      ? ` · account: ${linkedAccountLabel}`
                      : ""}
                  </Text>
                  <Text
                    as="p"
                    size="2"
                    style={{
                      display: "block",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {supportSubmissionRow.message}
                  </Text>
                </Box>
              </Card>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
