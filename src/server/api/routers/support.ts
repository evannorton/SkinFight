import { z } from "zod";

import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

const supportSubmissionNameSchema = z
  .string()
  .trim()
  .min(1, "Name is required.")
  .max(200, "Name must be at most 200 characters.");

const supportSubmissionEmailSchema = z
  .string()
  .trim()
  .email("Enter a valid email address.")
  .max(320, "Email must be at most 320 characters.");

const supportSubmissionMessageSchema = z
  .string()
  .trim()
  .min(1, "Message is required.")
  .max(5000, "Message must be at most 5000 characters.");

export const supportRouter = createTRPCRouter({
  submit: publicProcedure
    .input(
      z.object({
        name: supportSubmissionNameSchema,
        email: supportSubmissionEmailSchema,
        message: supportSubmissionMessageSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const sessionUserId = ctx.session?.user.id ?? null;

      const createdSupportSubmission = await ctx.db.supportSubmission.create({
        data: {
          name: input.name,
          email: input.email,
          message: input.message,
          userId: sessionUserId,
        },
        select: {
          id: true,
        },
      });

      return createdSupportSubmission;
    }),

  list: adminProcedure.query(async ({ ctx }) => {
    const supportSubmissionRows = await ctx.db.supportSubmission.findMany({
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

    return supportSubmissionRows;
  }),
});
