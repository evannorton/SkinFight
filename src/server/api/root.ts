import { eventParticipationRouter } from "~/server/api/routers/event-participation";
import { eventRouter } from "~/server/api/routers/event";
import { postRouter } from "~/server/api/routers/post";
import { shadingRouter } from "~/server/api/routers/shading";
import { supportRouter } from "~/server/api/routers/support";
import { teamRouter } from "~/server/api/routers/team";
import { userRouter } from "~/server/api/routers/user";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  event: eventRouter,
  team: teamRouter,
  shading: shadingRouter,
  eventParticipation: eventParticipationRouter,
  user: userRouter,
  support: supportRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
