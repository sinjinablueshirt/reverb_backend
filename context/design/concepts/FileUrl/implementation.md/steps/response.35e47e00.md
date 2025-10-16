---
timestamp: 'Wed Oct 15 2025 15:48:20 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251015_154820.79614a6e.md]]'
content_id: 35e47e0019035537ffa2b3dd488f56dd759e64f8ff741c3782897de523b7e7fa
---

# response:

```typescript
import { Collection, Db } from "npm:mongodb";
import { ID, Empty } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";
import { Storage } from "npm:@google-cloud/storage"; // Import GCS Storage client
import * as path from "https://deno.land/std@0.224.0/path/mod.ts"; // For path operations to guess content type

// Declare collection prefix, use concept name
const PREFIX = "FileUrl" + ".";

// Generic types of this concept
type File = ID;
type User = ID;

/**
 * a set of File with
 *   a filePath of type string
 *   an owner of type User
 *   a url of type string
 */
interface FileUrlDoc {
  _id: File; // The concept's File ID
  filePath: string; // The original path/name provided (on the server's filesystem)
  owner: User;
  url: string; // The Google Cloud Storage public URL
}

export default class FileUrlConcept {
  files: Collection<FileUrlDoc>;
  private storage: Storage;
  private bucketName: string;

  constructor(private readonly db: Db) {
    this.files = this.db.collection(PREFIX + "files");
    this.storage = new Storage(); // Initializes with default credentials (env vars)
    this.bucketName = Deno.env.get("GCS_BUCKET_NAME") || "";

    if (!this.bucketName) {
      // In a real application, you might want a more robust way to handle missing config
      // or to retry initialization, but for a constructor, throwing is appropriate.
      throw new Error("GCS_BUCKET_NAME environment variable is not set.");
    }
  }

  /**
   * uploadFile (filePath: string, owner: User): (file: File)
   *
   * **requires**: `filePath` points to a valid file on the server's filesystem and
   *               no file with the same `filePath` and `owner` combination is already uploaded.
   *
   * **effects**: reads the file from `filePath`; uploads it to Google Cloud Storage;
   *              saves a new `file` record with its GCS `url`, `filePath` and `owner` in the concept state;
   *              returns the ID of the new `file`.
   */
  async uploadFile(
    { filePath, owner }: { filePath: string; owner: User },
  ): Promise<{ file: File } | { error: string }> {
    // 1. Validate inputs and check preconditions
    if (!filePath || !owner) {
      return { error: "filePath and owner are required." };
    }

    // Precondition: `filePath` isn't already uploaded by this `owner`.
    // We check for uniqueness based on the combination of `filePath` (as provided) and `owner`.
    const existingFile = await this.files.findOne({ filePath, owner });
    if (existingFile) {
      return { error: `File '${filePath}' already uploaded by owner '${owner}'.` };
    }

    let fileContent: Uint8Array;
    try {
      // Precondition: `filePath` points to a valid file on the server's filesystem.
      fileContent = await Deno.readFile(filePath);
    } catch (readError) {
      if (readError instanceof Deno.errors.NotFound) {
        return { error: `Local file not found at path: ${filePath}` };
      }
      // Catch other potential file read errors (e.g., permissions)
      return { error: `Failed to read local file: ${readError.message}` };
    }

    // 2. Upload to Google Cloud Storage
    // Create a unique blob name in GCS. Using owner prefix helps organization,
    // and `freshID()` + base filename ensures global uniqueness within the bucket.
    const blobName = `uploads/${owner}/${freshID()}-${path.basename(filePath)}`;
    const fileRef = this.storage.bucket(this.bucketName).file(blobName);

    try {
      // Attempt to guess the content type based on file extension
      const ext = path.extname(filePath);
      const contentType = ext ? `application/${ext.substring(1)}` : "application/octet-stream";

      await fileRef.save(fileContent, {
        resumable: false, // For direct uploads, especially for smaller files
        metadata: {
          contentType: contentType,
        },
        public: true, // Make the file publicly accessible to get a direct URL
      });

      // Construct the public URL directly based on GCS naming convention
      const fileUrl = `https://storage.googleapis.com/${this.bucketName}/${blobName}`;

      // 3. Save file metadata to MongoDB (effects)
      const newFileId: File = freshID(); // Generate a new concept-level File ID
      const insertResult = await this.files.insertOne({
        _id: newFileId,
        filePath: filePath, // Store the server-side path or original descriptive name
        owner: owner,
        url: fileUrl, // Store the public GCS URL
      });

      if (!insertResult.acknowledged) {
        // This case should ideally be caught by MongoDB driver errors,
        // but it's a safeguard for unexpected non-throwing insert failures.
        console.error("MongoDB insert not acknowledged for new file:", newFileId);
        // Note: At this point, the file is in GCS but not in our DB.
        // A more robust system might attempt cleanup or use transactions.
        return { error: "Failed to save file metadata to database." };
      }

      // 4. Return the ID of the new concept File (effects)
      return { file: newFileId };
    } catch (gcsError) {
      // Catch and report errors from Google Cloud Storage operations
      console.error("GCS upload failed:", gcsError);
      return { error: `Failed to upload file to cloud storage: ${gcsError.message}` };
    }
  }

  // Placeholder for other actions or queries as per the concept spec (deleteFile, etc.)
  // These are not implemented as per the prompt's instruction to "implement ONLY the uploadFile action".
}
```
