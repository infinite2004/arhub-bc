import { z } from "zod";

export const createProjectSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(2000),
  tags: z.array(z.string().min(1).max(32)).max(10).default([]),
  visibility: z.enum(["PUBLIC", "UNLISTED", "PRIVATE"]).default("PUBLIC"),
  assets: z
    .array(
      z.object({
        kind: z.enum(["MODEL", "SCRIPT", "CONFIG", "PREVIEW"]),
        fileKey: z.string().min(3),
        fileName: z.string().min(1),
        mime: z.string().min(1),
        sizeBytes: z.number().int().positive(),
      })
    )
    .optional()
    .default([]),
});

export const updateProjectSchema = z.object({
  title: z.string().min(3).max(120).optional(),
  description: z.string().min(10).max(2000).optional(),
  visibility: z.enum(["PUBLIC", "UNLISTED", "PRIVATE"]).optional(),
  tags: z.array(z.string().min(1).max(32)).max(10).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

