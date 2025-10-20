---
timestamp: 'Sat Oct 18 2025 14:15:01 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251018_141501.87088110.md]]'
content_id: 4d77541460adf4bf8cec1baa86c3534516a72e9ba03136710f89e9c1ef4885d5
---

# file: src/concepts/FileUrl/FileUrlConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Storage } from "npm:@google-cloud/storage";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Declare collection prefix, use concept name
const PREFIX = "FileUrl" + ".";

// Generic types of this concept
type FileID = ID;
type User = ID;
// The 'fileData' generic type parameter from the concept definition is
// conceptually represented in the state by `gcsObjectName` and `url`,
// which point to the actual file content in Google Cloud Storage.
// The `uploadFile` action will directly receive the file content as a `Blob`.

/**
 * State structure for the 'files' collection.
 * Corresponds to the 'a set of File with' declaration in the concept state.
 *
 * a set of `File` with
 *   an `owner` of type `User`
 *   a `url` of type `string`
 *   a `gcsObjectName` of type `string` (for internal management in GCS)
 *   an `originalFileName` of type `string` (the name provided by the user)
 */
interface FileDocument {
  _id: FileID; // The unique identifier for this file record (concept's 'File' type)
  owner: User; // The user who uploaded the file (concept's 'User' type)
  url: string; // The public URL to access the file in Google Cloud Storage
  gcsObjectName: string; // The full path/name of the object in the GCS bucket for internal management
  originalFileName: string; // The original name of the file, e.g., "document.pdf"
}

/**
 * concept FileUrl[User, fileData]
 *
 * purpose: to let file information be uploaded and displayed
 *
 * principle: the user can upload files to a storage service to be retrieved later through a URL
 */
export default class FileUrlConcept {
  files: Collection<FileDocument>;
  private readonly storage: Storage;
  private readonly bucketName: string;

  constructor(private readonly db: Db) {
    this.files = this.db.collection(PREFIX + "files");
    this.storage = new Storage();

    // The GCS bucket name must be configured via environment variables.
    // This is a critical setup error, so throwing is appropriate if not set.
    const bucketName = Deno.env.get("GCS_BUCKET_NAME");
    if (!bucketName) {
      throw new Error(
        "GCS_BUCKET_NAME environment variable not set. Please configure your .env file.",
      );
    }
    this.bucketName = bucketName;
  }

  /**
   * uploadFile(fileData: Blob, originalFileName: string, owner: User): (file: File)
   *
   * **requires**:
   *   1. `fileData` is a valid Blob object (representing the file content).
   *   2. `originalFileName` is a non-empty string.
   *   3. No other file with the same `originalFileName` has already been uploaded by this `owner`.
   *      (This is a design choice to prevent logical duplicates for a user, can be adjusted).
   *
   * **effects**:
   *   1. Saves a new `file` record with the provided `originalFileName` and `owner`.
   *   2. Uploads the contents of the `fileData` Blob to Google Cloud Storage.
   *   3. Obtains a unique public `url` to access this file in GCS.
   *   4. Stores this `url` along with other file information in the concept's state (MongoDB).
   *   5. Returns the ID of the newly created `file` record.
   */
  async uploadFile(
    { fileData, originalFileName, owner }: {
      fileData: Blob;
      originalFileName: string;
      owner: User;
    },
  ): Promise<{ file: FileID } | { error: string }> {
    // REQUIREMENT CHECK 2: `originalFileName` is a non-empty string.
    if (!originalFileName || originalFileName.trim() === "") {
      return { error: "File name cannot be empty." };
    }

    // REQUIREMENT CHECK 3: A file with this `originalFileName` isn't already uploaded by this `owner`
    // This prevents uploading two logically identical files by the same user.
    // If this behavior is not desired (i.e., allow multiple files with the same name), remove this check.
    const existingFile = await this.files.findOne({
      originalFileName: originalFileName,
      owner: owner,
    });
    if (existingFile) {
      return {
        error:
          `A file named '${originalFileName}' has already been uploaded by owner '${owner}' (File ID: ${existingFile._id}).`,
      };
    }

    // EFFECT 1: Generate a unique ID for the new file record
    const newFileId: FileID = freshID();

    // Determine a safe and unique object name for GCS
    // Format: `files/<owner_id>/<file_record_id>/<original_filename>`
    const gcsObjectName = `files/${owner}/${newFileId}/${originalFileName}`;

    try {
      // Convert Blob to ArrayBuffer, then to Uint8Array for GCS upload.
      // Deno `Storage` client accepts `ReadableStream`, `Buffer` (Node.js style), or `Uint8Array`.
      // Using `Uint8Array` from `arrayBuffer()` is a direct way to handle Blob content.
      const arrayBuffer = await fileData.arrayBuffer();
      const fileContentBuffer = new Uint8Array(arrayBuffer);

      // EFFECT 2: Upload the file contents (Blob) to Google Cloud Storage
      await this.storage.bucket(this.bucketName).file(gcsObjectName).save(
        fileContentBuffer,
        {
          metadata: {
            cacheControl: "public, max-age=31536000",
            contentType: fileData.type || "application/octet-stream", // Use Blob's MIME type, or default
          },
        },
      );

      // EFFECT 3: Obtain a unique public URL to access this file
      // For publicly readable objects, the URL can be constructed directly.
      const publicUrl =
        `https://storage.googleapis.com/${this.bucketName}/${gcsObjectName}`;

      // EFFECT 4: Save the file information (including the GCS URL) to the concept's state (MongoDB)
      const newFileDocument: FileDocument = {
        _id: newFileId,
        owner: owner,
        url: publicUrl,
        gcsObjectName: gcsObjectName,
        originalFileName: originalFileName,
      };
      await this.files.insertOne(newFileDocument);

      // EFFECT 5: Return the ID of the newly created file record
      return { file: newFileId };
    } catch (gcsError: any) { // Catch any errors during the GCS upload process
      // If GCS upload fails, return an error message.
      // No database cleanup is needed as nothing was inserted into MongoDB yet at this point.
      return {
        error: `Failed to upload file to Google Cloud Storage: ${
          gcsError.message || gcsError
        }.`,
      };
    }
  }

  /**
   * deleteFile(file: File, user: User)
   *
   * **requires**: `file` exists and `user` is its `owner`
   *
   * **effects**:
   *   1. Removes `file` from the concept's state (MongoDB).
   *   2. Deletes the corresponding file content from the external Google Cloud Storage service,
   *      rendering its `url` inaccessible.
   */
  async deleteFile(
    { file, user }: { file: FileID; user: User },
  ): Promise<Empty | { error: string }> {
    // REQUIREMENT CHECK 1: `file` exists
    const fileToDelete = await this.files.findOne({ _id: file });
    if (!fileToDelete) {
      return { error: `File with ID '${file}' not found.` };
    }

    // REQUIREMENT CHECK 2: `user` is its `owner`
    if (fileToDelete.owner !== user) {
      return {
        error:
          `User '${user}' is not authorized to delete file '${file}' (owner is '${fileToDelete.owner}').`,
      };
    }

    try {
      // EFFECT 2: Delete the corresponding file content from Google Cloud Storage
      // Use the stored `gcsObjectName` to target the correct object in the bucket.
      await this.storage.bucket(this.bucketName).file(
        fileToDelete.gcsObjectName,
      ).delete();

      // EFFECT 1: Remove `file` from the concept's state (MongoDB)
      await this.files.deleteOne({ _id: file });

      return {}; // Successful deletion
    } catch (gcsError: any) {
      // If GCS deletion fails, it's a critical error for the concept's consistency.
      // The MongoDB record still exists, but the GCS file is not removed.
      return {
        error:
          `Failed to delete file from Google Cloud Storage (ID: '${file}'): ${
            gcsError.message || gcsError
          }. The database record for this file might still exist.`,
      };
    }
  }

  /**
   * _getFilesByUser(user: User): (files: File[])
   *
   * **requires**: `user` exists (conceptually, or an active user session)
   *
   * **effects**: Returns an array of `File` documents (metadata) owned by the specified `user`.
   */
  async _getFilesByUser(user: User): Promise<FileDocument[]> {
    return await this.files.find({ owner: user }).toArray();
  }

  /**
   * _getFileById(fileId: FileID): (file: File)
   *
   * **requires**: none
   *
   * **effects**: Returns the `File` document (metadata) matching the given `fileId`, or `null` if not found.
   */
  async _getFileById(fileId: FileID): Promise<FileDocument | null> {
    return await this.files.findOne({ _id: fileId });
  }
}

```
