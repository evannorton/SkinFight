import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, adminProcedure } from "~/server/api/trpc";
import { deleteBackblazeFilesForEventUploads } from "~/server/character-backblaze-cleanup";

const eventNameSchema = z.string().min(1, "Name is required.").max(200);

const eventTeamIdsSchema = z
  .array(z.string().min(1))
  .refine((teamIds) => new Set(teamIds).size === teamIds.length, {
    message: "Duplicate teams are not allowed.",
  });

const eventDateTimeRangeSchema = z
  .object({
    date: z.coerce.date(),
    endDate: z.coerce.date(),
  })
  .superRefine((value, context) => {
    if (Number.isNaN(value.date.getTime()) === true) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid start date and time.",
        path: ["date"],
      });
    }
    if (Number.isNaN(value.endDate.getTime()) === true) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid end date and time.",
        path: ["endDate"],
      });
    }
    if (value.endDate.getTime() <= value.date.getTime()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End time must be after start time.",
        path: ["endDate"],
      });
    }
  });

const eventListInclude = {
  eventTeams: {
    orderBy: { sortOrder: "asc" as const },
    include: { team: true },
  },
};

export const eventRouter = createTRPCRouter({
  list: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.event.findMany({
      orderBy: { date: "asc" },
      include: eventListInclude,
    });
  }),

  create: adminProcedure
    .input(
      z
        .object({
          name: eventNameSchema,
        })
        .and(eventDateTimeRangeSchema),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.event.create({
        data: {
          name: input.name,
          date: input.date,
          endDate: input.endDate,
        },
        include: eventListInclude,
      });
    }),

  update: adminProcedure
    .input(
      z
        .object({
          id: z.string().min(1),
          name: eventNameSchema,
          teamIds: eventTeamIdsSchema,
        })
        .and(eventDateTimeRangeSchema),
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
      if (input.teamIds.length > 0) {
        const teamsForEvent = await ctx.db.team.findMany({
          where: { id: { in: input.teamIds } },
          select: { id: true },
        });
        if (teamsForEvent.length !== input.teamIds.length) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "One or more teams were not found.",
          });
        }
      }
      return ctx.db.$transaction(async (transactionClient) => {
        await transactionClient.eventTeam.deleteMany({
          where: { eventId: input.id },
        });
        for (
          let teamIndex = 0;
          teamIndex < input.teamIds.length;
          teamIndex = teamIndex + 1
        ) {
          const teamId = input.teamIds[teamIndex];
          if (teamId === undefined) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Could not save event teams.",
            });
          }
          await transactionClient.eventTeam.create({
            data: {
              eventId: input.id,
              teamId,
              sortOrder: teamIndex,
            },
          });
        }
        return transactionClient.event.update({
          where: { id: input.id },
          data: {
            name: input.name,
            date: input.date,
            endDate: input.endDate,
          },
          include: eventListInclude,
        });
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
      await deleteBackblazeFilesForEventUploads(ctx.db, input.id);
      await ctx.db.event.delete({
        where: { id: input.id },
      });
    }),
});
