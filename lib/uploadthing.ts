import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/route";

export const { UploadButton, UploadDropzone, Uploader } = generateReactHelpers<OurFileRouter>();
