import { z } from "zod";

export const NotificationFiltersSchema = z
  .object({
    acknowledged: z.boolean().optional(),
    type: z.enum(["info", "success", "warning", "error"]).optional(),
    userId: z.string().optional(),
  })
  .optional();

export const NotificationSchema = z.object({
  id: z.string(),
  title: z.string(),
  message: z.string(),
  type: z.enum(["info", "success", "warning", "error"]),
  acknowledged: z.boolean(),
  createdAt: z.string(),
  userId: z.string(),
});

export const UpdateNotificationSchema = z.object({
  acknowledged: z.boolean(),
});

export type NotificationFilters = z.infer<typeof NotificationFiltersSchema>;
export type Notification = z.infer<typeof NotificationSchema>;
export type UpdateNotificationRequest = z.infer<
  typeof UpdateNotificationSchema
>;
