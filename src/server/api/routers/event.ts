import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, adminProcedure } from "~/server/api/trpc";

const eventNameSchema = z.string().min(1, "Name is required.").max(200);

const eventTeamIdsSchema = z
  .array(z.string().min(1))
  .refine((teamIds) => new Set(teamIds).size === teamIds.length, {
    message: "Duplicate teams are not allowed.",
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
        include: eventListInclude,
      });
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string().min(1),
        name: eventNameSchema,
        date: z.coerce.date(),
        teamIds: eventTeamIdsSchema,
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
            date: eventDate,
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
      await ctx.db.event.delete({
        where: { id: input.id },
      });
    }),
});
