import { createInsertSchema } from "drizzle-zod";
import { ipTable } from "../db/schema";
import { z } from "zod";
import { config } from "../config/env";
import validator from "validator";

export const ipInsertSchema = createInsertSchema(ipTable).extend({
  mode: z.enum([config.constants.blacklist, config.constants.whitelist]),
  value: z
    .string()
    .refine((val) => validator.isIP(val), { message: "Invalid IP" }),
});

export const ipListSchema = z.object({
  mode: z.enum([config.constants.blacklist, config.constants.whitelist]),
  values: z
    .array(
      z.string().refine((val) => validator.isIP(val), { message: "Invalid IP" })
    )
    .nonempty({ message: "'values' must be a non-empty array of IPs" }),
});

export type IpInsertInput = z.infer<typeof ipInsertSchema>;
export type IpListInput = z.infer<typeof ipListSchema>;
