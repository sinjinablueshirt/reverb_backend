---
timestamp: 'Wed Oct 15 2025 22:16:48 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251015_221648.7d1e96b6.md]]'
content_id: 7071b48a943b0f9f668ec9472044ee5648f779f8edeba24d20274b1b40fbe799
---

# file: src/concepts/FileUrl/FileUrlConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";
import { Storage } from "npm:@google-cloud/storage";

// Declare collection prefix, use concept name
const PREFIX = "FileUrl" + ".";

// Generic types of this concept
type User = ID;
type File = ID; // The concept refers to File as an ID, representing its unique identifier

/**
 * Represents the state of a single File entity within the FileUrl concept.
 * Corresponds to:
 * a set of File with
 *   an id (which is _id in MongoDB)
 *   an owner of type User
 *   a fileName of type string
 *   a storageKey of type string
 *   a mimeType of type string
 *   a fileSize of type Number
 *   an uploaded of type Boolean
 */
interface FileDocument {
  _id: File; // The unique ID of the file entity managed by this concept
  owner: User;
  fileName: string;
  storageKey: string; // Unique identifier for the file in the external storage service
  mimeType: string;
  fileSize: number;
  uploaded: boolean; // True once the file content has been successfully uploaded
}

export default class FileUrlConcept {
  files: Collection<FileDocument>;
  private readonly storage: Storage;
  private readonly bucketName: string;

  constructor(private readonly db: Db) {
    this.files = this.db.collection<FileDocument>(PREFIX + "files");
    this.storage = new Storage();

    // Retrieve bucket name from environment variable.
    // In a production environment, it's crucial for this to be set correctly.
    this.bucketName = Deno.env.get("GCS_BUCKET_NAME") || "";
    if (!this.bucketName) {
      console.error(
        "GCS_BUCKET_NAME environment variable is not set. File uploads may fail.",
      );
      // For robust error handling, you might want to throw an error here
      // or ensure a default that is known to work in a development setup.
    }
  }

  /**
   * initiateFileUpload (fileName: String, owner: User, mimeType: String, fileSize: Number): (file: File, uploadUrl: String)
   *
   * **requires**: `fileName` is non-empty, `owner` is a valid user, `mimeType` is a recognized type, `fileSize` is positive.
   *
   * **effects**: Creates a new `File` entity with a unique `id`. Assigns `owner`, `fileName`, `mimeType`, `fileSize` to the new `file`. Generates a unique `storageKey` for the `file` (e.g., using `id` and `fileName`). Requests a *pre-signed upload URL* from the external storage service for this `storageKey`, `mimeType`, and `fileSize`. This URL allows a client to directly upload the file content to the storage service. Sets `uploaded` to `false`. Returns the new `file` (its `id`) and the generated `uploadUrl`.
   */
  async initiateFileUpload(
    { fileName, owner, mimeType, fileSize }: {
      fileName: string;
      owner: User;
      mimeType: string;
      fileSize: number;
    },
  ): Promise<{ file: File; uploadUrl: string } | { error: string }> {
    // 1. Validate input arguments
    if (!fileName || fileName.trim() === "") {
      return { error: "File name cannot be empty." };
    }
    // 'owner' is a generic ID, its validity beyond non-emptiness is handled by other concepts.
    if (!owner || owner.trim() === "") {
      return { error: "Owner ID cannot be empty." };
    }
    if (!mimeType || mimeType.trim() === "") {
      return { error: "MIME type cannot be empty." };
    }
    if (fileSize <= 0) {
      return { error: "File size must be positive." };
    }
    if (!this.bucketName) {
      return { error: "Google Cloud Storage bucket name is not configured." };
    }

    try {
      // 2. Create a unique ID for the new file entity
      const newFileId: File = freshID();

      // 3. Generate a unique storage key for Google Cloud Storage
      // A common pattern is to include the file ID to ensure uniqueness
      // and allow logical organization within the bucket.
      const storageKey = `uploads/${newFileId}/${fileName}`;

      // 4. Request a pre-signed upload URL from Google Cloud Storage
      const bucket = this.storage.bucket(this.bucketName);
      const fileRef = bucket.file(storageKey);

      const [uploadUrl] = await fileRef.getSignedUrl({
        version: "v4", // Use V4 signed URLs for security
        action: "write", // This URL is for uploading (writing) a file
        expires: Date.now() + 15 * 60 * 1000, // URL valid for 15 minutes (adjust as needed)
        contentType: mimeType, // Important for browser uploads to set the correct content type
      });

      // 5. Persist the new file entity's metadata in MongoDB
      const newFileDocument: FileDocument = {
        _id: newFileId,
        owner: owner,
        fileName: fileName,
        storageKey: storageKey,
        mimeType: mimeType,
        fileSize: fileSize,
        uploaded: false, // File content has not been uploaded yet
      };

      await this.files.insertOne(newFileDocument);

      // 6. Return the new file's ID and the generated upload URL
      return { file: newFileId, uploadUrl: uploadUrl };
    } catch (e) {
      console.error("Error in initiateFileUpload:", e);
      return { error: `Failed to initiate file upload: ${e}` };
    }
  }

  // Other actions (confirmFileUpload, getDownloadUrl, deleteFile) would be implemented here.
  // ...
}

```
