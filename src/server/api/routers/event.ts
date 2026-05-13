import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, adminProcedure } from "~/server/api/trpc";

const eventNameSchema = z.string().min(1, "Name is required.").max(200);

export const eventRouter = createTRPCRouter({
  list: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.event.findMany({
      orderBy: { date: "asc" },
    });
  }),

  create: adminProcedure
    .input(
      z.object({
        name: eventNameSchema,
        date: z.coerce.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const eventDate = input.date;
      if (Number.isNaN(eventDate.getTime()) === true) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid date and time.",
        });
      }
      return ctx.db.event.create({
        data: {
          name: input.name,
          date: eventDate,
        },
      });
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string().min(1),
        name: eventNameSchema,
        date: z.coerce.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const eventDate = input.date;
      if (Number.isNaN(eventDate.getTime()) === true) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid date and time.",
        });
      }
      const existingEvent = await ctx.db.event.findUnique({
        where: { id: input.id },
      });
      if (existingEvent === null) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event not found.",
        });
      }
      return ctx.db.event.update({
        where: { id: input.id },
        data: {
          name: input.name,
          date: eventDate,
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
      const existingEvent = await ctx.db.event.findUnique({
        where: { id: input.id },
      });
      if (existingEvent === null) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event not found.",
        });
      }
      await ctx.db.event.delete({
        where: { id: input.id },
      });
    }),
});
