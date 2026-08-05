import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import DiscordProvider from "next-auth/providers/discord";

import { UserRole } from "../../../generated/prisma";
import { db } from "~/server/db";

import { parseAdminDiscordUserIdsFromEnv } from "./admin-discord-user-ids";
import { emailPasswordCredentialsSchema } from "./credentials";
import { verifyPassword } from "./password";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    role?: UserRole;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    DiscordProvider,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (rawCredentials) => {
        const parsedCredentials =
          emailPasswordCredentialsSchema.safeParse(rawCredentials);
        if (parsedCredentials.success === false) {
          return null;
        }

        const emailAddress = parsedCredentials.data.email.toLowerCase();
        const user = await db.user.findUnique({
          where: { email: emailAddress },
        });
        if (user === null) {
          return null;
        }
        if (typeof user.passwordHash !== "string") {
          return null;
        }

        const isPasswordValid = await verifyPassword(
          parsedCredentials.data.password,
          user.passwordHash,
        );
        if (isPasswordValid === false) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
  },
  events: {
    signIn: async ({ user, account }) => {
      const adminDiscordUserIds = parseAdminDiscordUserIdsFromEnv();
      if (adminDiscordUserIds.length === 0) {
        return;
      }
      if (account?.provider !== "discord") {
        return;
      }
      const discordProviderAccountId = account.providerAccountId;
      if (typeof discordProviderAccountId !== "string") {
        return;
      }
      const isDiscordUserInAdminList =
        adminDiscordUserIds.includes(discordProviderAccountId) === true;
      if (isDiscordUserInAdminList === false) {
        return;
      }
      if (typeof user.id !== "string") {
        return;
      }
      await db.user.update({
        where: { id: user.id },
        data: { role: UserRole.ADMIN },
      });
    },
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (typeof user !== "undefined") {
        if (typeof user.id !== "string") {
          throw new Error("Signed-in user is missing id.");
        }
        token.id = user.id;
        if (typeof user.role === "undefined") {
          token.role = UserRole.USER;
        }
        if (typeof user.role !== "undefined") {
          token.role = user.role;
        }
      }

      if (typeof token.id !== "string" && typeof token.sub === "string") {
        token.id = token.sub;
      }

      if (typeof token.id === "string") {
        const databaseUser = await db.user.findUnique({
          where: { id: token.id },
          select: { role: true },
        });
        if (databaseUser !== null) {
          token.role = databaseUser.role;
        }
      }

      return token;
    },
    session: ({ session, token }) => {
      if (typeof token.id !== "string") {
        throw new Error("Session token is missing user id.");
      }
      if (typeof token.role === "undefined") {
        throw new Error("Session token is missing user role.");
      }
      const sessionUserRole: UserRole = token.role;
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          role: sessionUserRole,
        },
      };
    },
  },
} satisfies NextAuthConfig;
