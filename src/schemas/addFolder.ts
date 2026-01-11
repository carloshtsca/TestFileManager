import { z } from "zod";

export const addFolderSchema = z.object({
    parentId: z.string().uuid("ParentId must be a valid UUID").nullable(),
    name: z.string().min(1, "Name is required"),
});

export type AddFolderFormValues = z.infer<typeof addFolderSchema>;