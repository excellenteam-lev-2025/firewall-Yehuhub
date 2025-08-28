import { z } from "zod";
import { config } from "../config/env";

export const updateListSchema = z.object({
  ids: z.array(z.number().positive()),
  mode: z.enum([config.constants.blacklist, config.constants.whitelist], {
    message: "mode must be 'blacklist/whitelist",
  }),
  active: z.boolean(),
});

export const updateAllSchema = z.object({
  urls: updateListSchema
    .optional()
    .default({ ids: [], mode: config.constants.blacklist, active: false }),
  ports: updateListSchema
    .optional()
    .default({ ids: [], mode: config.constants.blacklist, active: false }),
  ips: updateListSchema
    .optional()
    .default({ ids: [], mode: config.constants.blacklist, active: false }),
});

export type UpdateListInput = z.infer<typeof updateListSchema>;
export type UpdateAllInput = z.infer<typeof updateAllSchema>;
