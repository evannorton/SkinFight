"use client";

import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Text,
  TextArea,
  TextField,
} from "@radix-ui/themes";
import type { ReactElement } from "react";
import { useState } from "react";

import { api } from "~/trpc/react";

type SupportPageClientProps = {
  initialName: string;
  initialEmail: string;
};

export function SupportPageClient(
  props: SupportPageClientProps,
): ReactElement {
  const [nameInput, setNameInput] = useState<string>(props.initialName);
  const [emailInput, setEmailInput] = useState<string>(props.initialEmail);
  const [messageInput, setMessageInput] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const submitSupportMutation = api.support.submit.useMutation({
    onSuccess: () => {
      setSuccessMessage(
        "Your support request was submitted. We will get back to you soon.",
      );
      setMessageInput("");
    },
    onError: () => {
      setSuccessMessage(null);
    },
  });

  const trimmedNameInput = nameInput.trim();
  const trimmedEmailInput = emailInput.trim();
  const trimmedMessageInput = messageInput.trim();
  const isSubmitFormDisabled = submitSupportMutation.isPending === true;
  const isSubmitDisabled =
    trimmedNameInput.length === 0 ||
    trimmedEmailInput.length === 0 ||
    trimmedMessageInput.length === 0 ||
    isSubmitFormDisabled === true;

  return (
    <Flex justify="center" px="4" py="8">
      <Card size="3" style={{ width: "100%", maxWidth: "420px" }}>
        <Heading as="h2" size="6" weight="bold" mb="2">
          Support
        </Heading>
        <Text as="p" size="2" color="gray" mb="4">
          Send a support request and we will follow up by email.
        </Text>

        <Flex direction="column" gap="3">
          <Box>
            <Text
              as="label"
              size="2"
              weight="medium"
              mb="1"
              htmlFor="support-name"
            >
              Name
            </Text>
            <TextField.Root
              id="support-name"
              type="text"
              autoComplete="name"
              required={true}
              disabled={isSubmitFormDisabled === true}
              value={nameInput}
              placeholder="Your name"
              onChange={(event) => {
                setNameInput(event.target.value);
                setSuccessMessage(null);
              }}
            />
          </Box>
          <Box>
            <Text
              as="label"
              size="2"
              weight="medium"
              mb="1"
              htmlFor="support-email"
            >
              Email
            </Text>
            <TextField.Root
              id="support-email"
              type="email"
              autoComplete="email"
              required={true}
              disabled={isSubmitFormDisabled === true}
              value={emailInput}
              placeholder="you@example.com"
              onChange={(event) => {
                setEmailInput(event.target.value);
                setSuccessMessage(null);
              }}
            />
          </Box>
          <Box>
            <Text
              as="label"
              size="2"
              weight="medium"
              mb="1"
              htmlFor="support-message"
            >
              Message
            </Text>
            <TextArea
              id="support-message"
              required={true}
              disabled={isSubmitFormDisabled === true}
              value={messageInput}
              placeholder="How can we help?"
              rows={6}
              onChange={(textAreaChangeEvent) => {
                setMessageInput(textAreaChangeEvent.target.value);
                setSuccessMessage(null);
              }}
            />
          </Box>
          <Button
            type="button"
            disabled={isSubmitDisabled === true}
            onClick={() => {
              if (
                trimmedNameInput.length > 0 &&
                trimmedEmailInput.length > 0 &&
                trimmedMessageInput.length > 0
              ) {
                submitSupportMutation.mutate({
                  name: trimmedNameInput,
                  email: trimmedEmailInput,
                  message: trimmedMessageInput,
                });
              }
            }}
          >
            {submitSupportMutation.isPending === true
              ? "Submitting…"
              : "Submit request"}
          </Button>
          {submitSupportMutation.error !== null && (
            <Text size="2" color="red">
              {submitSupportMutation.error.message}
            </Text>
          )}
          {successMessage !== null && (
            <Text size="2" color="green">
              {successMessage}
            </Text>
          )}
        </Flex>
      </Card>
    </Flex>
  );
}
