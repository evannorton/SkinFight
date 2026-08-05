"use server";

import { AuthError } from "next-auth";

import { registerCredentialsSchema } from "~/server/auth/credentials";
import { hashPassword } from "~/server/auth/password";
import { signIn, signOut } from "~/server/auth";
import { db } from "~/server/db";

export type AuthFormState = {
  errorMessage: string | null;
};

export async function signInWithEmailPassword(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = formData.get("email");
  const password = formData.get("password");
  if (typeof email !== "string" || typeof password !== "string") {
    return { errorMessage: "Email and password are required." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return { errorMessage: "Invalid email or password." };
      }
      return { errorMessage: "Something went wrong while signing in." };
    }
    throw error;
  }

  return { errorMessage: null };
}

export async function registerWithEmailPassword(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");
  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return { errorMessage: "All fields are required." };
  }

  const parsedCredentials = registerCredentialsSchema.safeParse({
    name,
    email,
    password,
  });
  if (parsedCredentials.success === false) {
    return {
      errorMessage:
        "Enter a valid name, email, and password (at least 8 characters).",
    };
  }

  const emailAddress = parsedCredentials.data.email.toLowerCase();
  const existingUser = await db.user.findUnique({
    where: { email: emailAddress },
  });
  if (existingUser !== null) {
    return { errorMessage: "An account with this email already exists." };
  }

  const passwordHash = await hashPassword(parsedCredentials.data.password);
  await db.user.create({
    data: {
      email: emailAddress,
      name: parsedCredentials.data.name,
      passwordHash,
    },
  });

  try {
    await signIn("credentials", {
      email: emailAddress,
      password: parsedCredentials.data.password,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        errorMessage:
          "Account created, but sign-in failed. Try signing in manually.",
      };
    }
    throw error;
  }

  return { errorMessage: null };
}

export async function signInWithDiscord(): Promise<void> {
  await signIn("discord", { redirectTo: "/" });
}

export async function signOutUser(): Promise<void> {
  await signOut({ redirectTo: "/" });
}
