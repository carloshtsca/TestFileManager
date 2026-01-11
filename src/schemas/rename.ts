import { z } from "zod";

export const RenameSchema = z.object({
    nodeId: z.string().uuid("NodeId must be a valid UUID"),
    name: z.string().min(1, "Name is required"),
});

export type RenameFormValues = z.infer<typeof RenameSchema>;