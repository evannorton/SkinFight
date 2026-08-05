import { z } from "zod";

export const emailPasswordCredentialsSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
});

export const registerCredentialsSchema = emailPasswordCredentialsSchema.extend({
  name: z.string().trim().min(1).max(64),
});
