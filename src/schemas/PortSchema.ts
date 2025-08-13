import { createInsertSchema } from "drizzle-zod";
import { portTable } from "../db/schema";
import { z } from "zod";
import { config } from "../config/env";
import validator from "validator";

export const portInsertSchema = createInsertSchema(portTable).extend({
  mode: z.enum([config.constants.blacklist, config.constants.whitelist]),
  value: z.number().refine((val) => validator.isPort(val.toString()), {
    message: "Invalid Port",
  }),
});

export const portListSchema = z.object({
  mode: z.enum([config.constants.blacklist, config.constants.whitelist]),
  values: z
    .array(
      z.number().refine((val) => validator.isPort(val.toString()), {
        message: "Invalid Port",
      })
    )
    .nonempty({ message: "'values' must be a non-empty array of Ports" }),
});

export type PortInsertInput = z.infer<typeof portInsertSchema>;
export type PortListInput = z.infer<typeof portListSchema>;
