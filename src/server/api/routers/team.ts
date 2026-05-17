import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, adminProcedure } from "~/server/api/trpc";

const teamNameSchema = z.string().min(1, "Name is required.").max(200);

export const teamRouter = createTRPCRouter({
  list: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.team.findMany({
      orderBy: { name: "asc" },
    });
  }),

  create: adminProcedure
    .input(
      z.object({
        name: teamNameSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.team.create({
        data: {
          name: input.name,
        },
      });
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string().min(1),
        name: teamNameSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existingTeam = await ctx.db.team.findUnique({
        where: { id: input.id },
      });
      if (existingTeam === null) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Team not found.",
        });
      }
      return ctx.db.team.update({
        where: { id: input.id },
        data: {
          name: input.name,
        },
      });
    }),

  delete: adminProcedure
    .input(
      z.object({
        id: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existingTeam = await ctx.db.team.findUnique({
        where: { id: input.id },
      });
      if (existingTeam === null) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Team not found.",
        });
      }
      await ctx.db.team.delete({
        where: { id: input.id },
      });
    }),
});
