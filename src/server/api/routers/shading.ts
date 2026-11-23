import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, adminProcedure } from "~/server/api/trpc";

const shadingLabelSchema = z.string().min(1, "Label is required.").max(50);
const shadingPointValueSchema = z
  .number()
  .int("Point value must be a whole number.")
  .min(0, "Point value must be 0 or greater.");

export const shadingRouter = createTRPCRouter({
  list: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.shading.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
  }),

  create: adminProcedure
    .input(
      z.object({
        label: shadingLabelSchema,
        pointValue: shadingPointValueSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const highestSortOrderShading = await ctx.db.shading.findFirst({
        orderBy: { sortOrder: "desc" },
        select: { sortOrder: true },
      });
      const nextSortOrder =
        highestSortOrderShading === null
          ? 0
          : highestSortOrderShading.sortOrder + 1;

      return ctx.db.shading.create({
        data: {
          label: input.label,
          pointValue: input.pointValue,
          sortOrder: nextSortOrder,
        },
      });
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string().min(1),
        label: shadingLabelSchema,
        pointValue: shadingPointValueSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existingShading = await ctx.db.shading.findUnique({
        where: { id: input.id },
      });
      if (existingShading === null) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Shading not found.",
        });
      }
      return ctx.db.shading.update({
        where: { id: input.id },
        data: {
          label: input.label,
          pointValue: input.pointValue,
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
      const existingShading = await ctx.db.shading.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          _count: {
            select: {
              attacks: true,
              defends: true,
            },
          },
        },
      });
      if (existingShading === null) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Shading not found.",
        });
      }
      if (existingShading._count.attacks > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Cannot delete shading while attacks still use it. Reassign or remove those attacks first.",
        });
      }
      if (existingShading._count.defends > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Cannot delete shading while friendly team attacks still use it. Reassign or remove those first.",
        });
      }
      await ctx.db.shading.delete({
        where: { id: input.id },
      });
    }),
});
