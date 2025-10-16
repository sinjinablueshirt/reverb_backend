---
timestamp: 'Thu Oct 16 2025 10:14:00 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_101400.36b99aeb.md]]'
content_id: ab1fee26d9ac70b0cfbc9e76bcb5db13fe1f4d43f415ba9a808ad7952ae167b1
---

# file: src/concepts/FileUrl/FileUrlConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Storage } from "npm:@google-cloud/storage";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";
// import * as Deno from "@deno/deno_app"; // Use proper Deno import

// Declare collection prefix, use concept name
const PREFIX = "FileUrl" + ".";

// Generic types of this concept
type File = ID;
type User = ID;

/**
 * State structure for the 'files' collection.
 * Corresponds to the 'a set of File with' declaration in the concept state.
 *
 * a set of `File` with
 *   a `filePath` of type `string`
 *   an `owner` of type `User`
 *   a `url` of type `string`
 */
interface FileDocument {
  _id: File; // The unique identifier for this file record (concept's 'File' type)
  filePath: string; // The original local file path provided during upload
  owner: User; // The user who uploaded the file (concept's 'User' type)
  url: string; // The public URL to access the file in Google Cloud Storage
  gcsObjectName: string; // The full path/name of the object in the GCS bucket for internal management
}

/**
 * concept FileUrl[File, User]
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
   * uploadFile(filePath: string, owner: User): (file: File)
   * (Assuming this is the 'initiateFileUpload' action requested)
   *
   * **requires**:
   *   1. `filePath` points to a valid file on the local filesystem where the concept is running.
   *   2. A file with this exact `filePath` has not already been uploaded by this `owner`.
   *
   * **effects**:
   *   1. Saves a new `file` record with the provided `filePath` and `owner`.
   *   2. Uploads the contents of the local file specified by `filePath` to Google Cloud Storage.
   *   3. Obtains a unique public `url` to access this file in GCS.
   *   4. Stores this `url` along with other file information in the concept's state (MongoDB).
   *   5. Returns the ID of the newly created `file` record.
   */
  async uploadFile(
    { filePath, owner }: { filePath: string; owner: User },
  ): Promise<{ file: File } | { error: string }> {
    // REQUIREMENT CHECK 1: `filePath` points to a valid file on the local filesystem
    try {
      // Deno.stat checks if the file exists and is accessible.
      await Deno.stat(filePath);
    } catch (e) {
      if (e instanceof Deno.errors.NotFound) {
        return { error: `Local file not found at path: '${filePath}'.` };
      }
      // Handle other file system access errors gracefully
      return {
        error: `Failed to access local file at path '${filePath}': ${e}`,
      };
    }

    // REQUIREMENT CHECK 2: A file with this `filePath` isn't already uploaded by this `owner`
    const existingFile = await this.files.findOne({
      filePath: filePath,
      owner: owner,
    });
    if (existingFile) {
      return {
        error:
          `File '${filePath}' has already been uploaded by owner '${owner}' (File ID: ${existingFile._id}).`,
      };
    }

    // EFFECT 1: Generate a unique ID for the new file record
    const newFileId: File = freshID() as File;

    // Determine a safe and unique object name for GCS
    // This helps prevent collisions and organizes files by owner and concept record ID.
    // Format: `files/<owner_id>/<file_record_id>/<original_filename>`
    const pathParts = filePath.split("/");
    const originalFileName = pathParts.pop() || `untitled_file_${Date.now()}`;
    const gcsObjectName = `files/${owner}/${newFileId}/${originalFileName}`;

    try {
      // EFFECT 2: Upload the local file contents to Google Cloud Storage
      await this.storage.bucket(this.bucketName).upload(filePath, {
        destination: gcsObjectName,
        metadata: {
          cacheControl: "public, max-age=31536000",
        },
      });

      // EFFECT 3: Obtain a unique public URL to access this file
      // For publicly readable objects, the URL can be constructed directly.
      const publicUrl =
        `https://storage.googleapis.com/${this.bucketName}/${gcsObjectName}`;

      // EFFECT 4: Save the file information (including the GCS URL) to the concept's state (MongoDB)
      const newFileDocument: FileDocument = {
        _id: newFileId,
        filePath: filePath,
        owner: owner,
        url: publicUrl,
        gcsObjectName: gcsObjectName, // Store GCS object name for potential future deletion
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
    { file, user }: { file: File; user: User },
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
}

```
