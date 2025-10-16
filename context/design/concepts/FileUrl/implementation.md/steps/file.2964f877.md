---
timestamp: 'Wed Oct 15 2025 23:01:22 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251015_230122.494a5199.md]]'
content_id: 2964f877a38cb749fed3f7828f67793e3b411221915e2cdd5919fa3210214c01
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
type File = ID;
type User = ID;

/**
 * State structure for the 'files' collection.
 * Corresponds to:
 * a set of `File` with
 *   a `filePath` of type `string`
 *   an `owner` of type `User`
 *   a `url` of type `string`
 */
interface FileDocument {
  _id: File; // The unique identifier for this file record
  filePath: string; // The original local file path provided during upload
  owner: User; // The user who uploaded the file
  url: string; // The public URL to access the file in Google Cloud Storage
  gcsObjectName: string; // The full path/name of the object in the GCS bucket
}

export default class FileUrlConcept {
  files: Collection<FileDocument>;
  private readonly storage: Storage;
  private readonly bucketName: string;

  constructor(private readonly db: Db) {
    this.files = this.db.collection(PREFIX + "files");
    this.storage = new Storage();

    // The GCS bucket name must be configured via environment variables
    const bucketName = Deno.env.get("GCS_BUCKET_NAME");
    if (!bucketName) {
      // This is a critical setup error, so throwing is appropriate.
      throw new Error(
        "GCS_BUCKET_NAME environment variable not set. Please configure your .env file.",
      );
    }
    this.bucketName = bucketName;
  }

  /**
   * uploadFile(filePath: string, owner: User): (file: File)
   *
   * **requires**: filePath points to a valid file on the local filesystem where the concept is running,
   *               and a file with this exact `filePath` has not already been uploaded by this `owner`.
   *
   * **effects**: Saves a new `file` record with the provided `filePath` and `owner`.
   *              Uploads the contents of the local file to Google Cloud Storage.
   *              Obtains a unique public URL to access this file in GCS.
   *              Stores this `url` along with other file information in the concept's state.
   *              Returns the ID of the newly created `file` record.
   */
  async uploadFile(
    { filePath, owner }: { filePath: string; owner: User },
  ): Promise<{ file: File } | { error: string }> {
    // REQUIREMENT CHECK 1: `filePath` points to a valid file on the local filesystem
    try {
      await Deno.stat(filePath); // Check if the file exists and is accessible
    } catch (e) {
      if (e instanceof Deno.errors.NotFound) {
        return { error: `Local file not found at path: '${filePath}'.` };
      }
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

    // EFFECT: Generate a unique ID for the new file record
    const newFileId: File = freshID() as File;

    // Determine the original file name from the path for the GCS object name
    const pathParts = filePath.split("/");
    const originalFileName = pathParts.pop() || `untitled_file_${Date.now()}`;

    // Construct a unique object name for GCS to prevent collisions and organize files
    // Format: `files/<owner_id>/<file_record_id>/<original_filename>`
    const gcsObjectName = `files/${owner}/${newFileId}/${originalFileName}`;

    try {
      // EFFECT: Upload the local file contents to Google Cloud Storage
      await this.storage.bucket(this.bucketName).upload(filePath, {
        destination: gcsObjectName,
        predefinedAcl: "publicRead", // Make the uploaded file publicly accessible
      });

      // EFFECT: Obtain a unique public URL to access this file
      // For publicly readable objects, the URL can be constructed directly.
      const publicUrl =
        `https://storage.googleapis.com/${this.bucketName}/${gcsObjectName}`;

      // EFFECT: Save the file information (including the GCS URL) to the concept's state (MongoDB)
      const newFileDocument: FileDocument = {
        _id: newFileId,
        filePath: filePath,
        owner: owner,
        url: publicUrl,
        gcsObjectName: gcsObjectName,
      };
      await this.files.insertOne(newFileDocument);

      // EFFECT: Return the ID of the newly created file record
      return { file: newFileId };
    } catch (gcsError) {
      // If GCS upload fails, return an error message. No database cleanup is needed as nothing was inserted yet.
      return {
        error: `Failed to upload file to Google Cloud Storage: ${gcsError}.`,
      };
    }
  }

  // NOTE: The deleteFile action and any queries are not implemented as per the prompt instructions.
  // deleteFile(file: File, user: User, storage: Storage)
  //   **requires**: file exists and user is its owner
  //   **effects**: removes file from the state and makes it so that its url isn't able to access it through the url
}

```
