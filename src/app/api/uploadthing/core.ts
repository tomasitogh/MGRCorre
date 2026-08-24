import { createUploadthing } from "uploadthing/next";
import type { FileRouter } from "uploadthing/types";

const f = createUploadthing();

export const ourFileRouter = {
  receiptUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  }).onUploadComplete(async ({ file }) => {
    return { url: file.ufsUrl, key: file.key };
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
