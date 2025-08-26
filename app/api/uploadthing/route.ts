import { createUploadthing, type FileRouter, createRouteHandler } from "uploadthing/next";
import { getServerSession } from "@/lib/auth";

const f = createUploadthing();

export const ourFileRouter = {
  modelUploader: f({ blob: { maxFileSize: "32MB" } })
    .middleware(async () => {
      const session = await getServerSession();
      if (!session?.user?.email) throw new Error("Unauthorized");
      return { kind: "MODEL" as const };
    })
    .onUploadComplete(async ({ file }) => {
      return { key: file.key, name: file.name, size: file.size, type: file.type };
    }),
  scriptUploader: f({ blob: { maxFileSize: "4MB" } })
    .middleware(async () => {
      const session = await getServerSession();
      if (!session?.user?.email) throw new Error("Unauthorized");
      return { kind: "SCRIPT" as const };
    })
    .onUploadComplete(async ({ file }) => {
      return { key: file.key, name: file.name, size: file.size, type: file.type };
    }),
  configUploader: f({ blob: { maxFileSize: "1MB" } })
    .middleware(async () => {
      const session = await getServerSession();
      if (!session?.user?.email) throw new Error("Unauthorized");
      return { kind: "CONFIG" as const };
    })
    .onUploadComplete(async ({ file }) => {
      return { key: file.key, name: file.name, size: file.size, type: file.type };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

export const { GET, POST } = createRouteHandler({ router: ourFileRouter });

