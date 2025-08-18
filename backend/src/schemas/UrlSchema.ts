import { createInsertSchema } from "drizzle-zod";
import { urlTable } from "../db/schema";
import { z } from "zod";
import { config } from "../config/env";
import validator from "validator";

export const urlInsertSchema = createInsertSchema(urlTable).extend({
  mode: z.enum([config.constants.blacklist, config.constants.whitelist]),
  value: z
    .string()
    .refine((val) => validator.isFQDN(val), { message: "Invalid URL" }),
});

export const urlListSchema = z.object({
  mode: z.enum([config.constants.blacklist, config.constants.whitelist]),
  values: z
    .array(
      z
        .string()
        .refine((val) => validator.isFQDN(val), { message: "Invalid URL" })
    )
    .nonempty({ message: "'values' must be a non-empty array of URLs" }),
});

export type UrlInsertInput = z.infer<typeof urlInsertSchema>;
export type UrlListInput = z.infer<typeof urlListSchema>;
