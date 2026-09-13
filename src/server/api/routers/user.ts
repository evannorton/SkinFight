import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { UserRole } from "../../../../generated/prisma";
import { createTRPCRouter, adminOnlyProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  promoteToModerator: adminOnlyProcedure
    .input(
      z.object({
        userId: z.string().min(1, "User ID is required."),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existingUser = await ctx.db.user.findUnique({
        where: { id: input.userId },
        select: {
          id: true,
          role: true,
        },
      });

      if (existingUser === null) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No user found with that ID.",
        });
      }

      if (existingUser.role === UserRole.ADMIN) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "That user is already an admin.",
        });
      }

      if (existingUser.role === UserRole.MODERATOR) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "That user is already a moderator.",
        });
      }

      const updatedUser = await ctx.db.user.update({
        where: { id: existingUser.id },
        data: { role: UserRole.MODERATOR },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      return updatedUser;
    }),

  demoteFromModerator: adminOnlyProcedure
    .input(
      z.object({
        userId: z.string().min(1, "User ID is required."),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existingUser = await ctx.db.user.findUnique({
        where: { id: input.userId },
        select: {
          id: true,
          role: true,
        },
      });

      if (existingUser === null) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No user found with that ID.",
        });
      }

      if (existingUser.role !== UserRole.MODERATOR) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "That user is not a moderator.",
        });
      }

      const updatedUser = await ctx.db.user.update({
        where: { id: existingUser.id },
        data: { role: UserRole.USER },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      return updatedUser;
    }),
});
