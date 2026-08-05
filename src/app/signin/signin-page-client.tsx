"use client";

import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Link,
  Separator,
  Text,
  TextField,
} from "@radix-ui/themes";
import NextLink from "next/link";
import type { ReactElement } from "react";
import { useActionState, useState } from "react";

import {
  registerWithEmailPassword,
  signInWithDiscord,
  signInWithEmailPassword,
  type AuthFormState,
} from "~/app/signin/actions";

const initialAuthFormState: AuthFormState = {
  errorMessage: null,
};

type SignInFormMode = "signIn" | "register";

export function SignInPageClient(): ReactElement {
  const [formMode, setFormMode] = useState<SignInFormMode>("signIn");
  const [signInFormState, signInFormAction, isSignInPending] = useActionState(
    signInWithEmailPassword,
    initialAuthFormState,
  );
  const [registerFormState, registerFormAction, isRegisterPending] =
    useActionState(registerWithEmailPassword, initialAuthFormState);

  const displayedErrorMessage =
    formMode === "signIn"
      ? signInFormState.errorMessage
      : registerFormState.errorMessage;

  return (
    <Flex justify="center" px="4" py="8">
      <Card size="3" style={{ width: "100%", maxWidth: "420px" }}>
        <Heading as="h2" size="6" weight="bold" mb="2">
          {formMode === "signIn" ? "Sign in" : "Create account"}
        </Heading>
        <Text as="p" size="2" color="gray" mb="4">
          {formMode === "signIn"
            ? "Sign in with email and password, or continue with Discord."
            : "Create an account with email and password."}
        </Text>

        {formMode === "signIn" && (
          <form action={signInFormAction}>
            <Flex direction="column" gap="3">
              <Box>
                <Text as="label" size="2" weight="medium" mb="1">
                  Email
                </Text>
                <TextField.Root
                  name="email"
                  type="email"
                  autoComplete="email"
                  required={true}
                  placeholder="you@example.com"
                />
              </Box>
              <Box>
                <Text as="label" size="2" weight="medium" mb="1">
                  Password
                </Text>
                <TextField.Root
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required={true}
                  minLength={8}
                  placeholder="At least 8 characters"
                />
              </Box>
              {displayedErrorMessage !== null && (
                <Text size="2" color="red">
                  {displayedErrorMessage}
                </Text>
              )}
              <Button type="submit" disabled={isSignInPending === true}>
                {isSignInPending === true ? "Signing in…" : "Sign in"}
              </Button>
            </Flex>
          </form>
        )}

        {formMode === "register" && (
          <form action={registerFormAction}>
            <Flex direction="column" gap="3">
              <Box>
                <Text as="label" size="2" weight="medium" mb="1">
                  Name
                </Text>
                <TextField.Root
                  name="name"
                  type="text"
                  autoComplete="name"
                  required={true}
                  placeholder="Display name"
                />
              </Box>
              <Box>
                <Text as="label" size="2" weight="medium" mb="1">
                  Email
                </Text>
                <TextField.Root
                  name="email"
                  type="email"
                  autoComplete="email"
                  required={true}
                  placeholder="you@example.com"
                />
              </Box>
              <Box>
                <Text as="label" size="2" weight="medium" mb="1">
                  Password
                </Text>
                <TextField.Root
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required={true}
                  minLength={8}
                  placeholder="At least 8 characters"
                />
              </Box>
              {displayedErrorMessage !== null && (
                <Text size="2" color="red">
                  {displayedErrorMessage}
                </Text>
              )}
              <Button type="submit" disabled={isRegisterPending === true}>
                {isRegisterPending === true
                  ? "Creating account…"
                  : "Create account"}
              </Button>
            </Flex>
          </form>
        )}

        <Flex align="center" gap="3" my="4">
          <Separator size="4" style={{ flex: 1 }} />
          <Text size="1" color="gray">
            or
          </Text>
          <Separator size="4" style={{ flex: 1 }} />
        </Flex>

        <form action={signInWithDiscord}>
          <Button type="submit" variant="soft" style={{ width: "100%" }}>
            Continue with Discord
          </Button>
        </form>

        <Text as="p" size="2" color="gray" mt="4" align="center">
          {formMode === "signIn" ? (
            <>
              No account?{" "}
              <Link
                href="#"
                underline="hover"
                onClick={(event) => {
                  event.preventDefault();
                  setFormMode("register");
                }}
              >
                Create one
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link
                href="#"
                underline="hover"
                onClick={(event) => {
                  event.preventDefault();
                  setFormMode("signIn");
                }}
              >
                Sign in
              </Link>
            </>
          )}
        </Text>

        <Text as="p" size="1" color="gray" mt="3" align="center">
          <Link asChild underline="hover">
            <NextLink href="/">Back to home</NextLink>
          </Link>
        </Text>
      </Card>
    </Flex>
  );
}
