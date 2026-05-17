import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import type { db as databaseClient } from "~/server/db";

async function assertEventIsCurrentlyOngoing(
  database: typeof databaseClient,
  eventId: string,
): Promise<void> {
  const event = await database.event.findUnique({
    where: { id: eventId },
  });
  if (event === null) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Event not found.",
    });
  }
  const now = new Date();
  const isEventCurrentlyOngoing =
    event.date.getTime() <= now.getTime() &&
    event.endDate.getTime() >= now.getTime();
  if (isEventCurrentlyOngoing === false) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "This event is not currently active.",
    });
  }
}

export const eventParticipationRouter = createTRPCRouter({
  join: protectedProcedure
    .input(
      z.object({
        eventId: z.string().min(1),
        teamId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      await assertEventIsCurrentlyOngoing(ctx.db, input.eventId);

      const eventTeam = await ctx.db.eventTeam.findUnique({
        where: {
          eventId_teamId: {
            eventId: input.eventId,
            teamId: input.teamId,
          },
        },
      });
      if (eventTeam === null) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This team is not part of the event.",
        });
      }

      const existingParticipation = await ctx.db.eventParticipation.findUnique({
        where: {
          userId_eventId: {
            userId,
            eventId: input.eventId,
          },
        },
      });
      if (existingParticipation !== null) {
        if (existingParticipation.teamId !== null) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "You are already on a team for this event.",
          });
        }

        return ctx.db.eventParticipation.update({
          where: { id: existingParticipation.id },
          data: { teamId: input.teamId },
        });
      }

      return ctx.db.eventParticipation.create({
        data: {
          userId,
          eventId: input.eventId,
          teamId: input.teamId,
        },
      });
    }),

  leaveTeam: protectedProcedure
    .input(
      z.object({
        eventId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      await assertEventIsCurrentlyOngoing(ctx.db, input.eventId);

      const existingParticipation = await ctx.db.eventParticipation.findUnique({
        where: {
          userId_eventId: {
            userId,
            eventId: input.eventId,
          },
        },
      });
      if (existingParticipation === null) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "You are not participating in this event.",
        });
      }
      if (existingParticipation.teamId === null) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You are not on a team for this event.",
        });
      }

      return ctx.db.eventParticipation.update({
        where: { id: existingParticipation.id },
        data: { teamId: null },
      });
    }),
});
