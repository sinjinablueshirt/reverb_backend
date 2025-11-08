import { Collection, Db } from "npm:mongodb";
import { Storage } from "npm:@google-cloud/storage";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Declare collection prefix, use concept name
const PREFIX = "FileUrl" + ".";

// Generic types of this concept
type FileID = ID;
type User = ID;

/**
 * State structure for the 'files' collection.
 * Corresponds to the 'a set of File with' declaration in the concept state.
 *
 * a set of `File` with
 *   a `title` of type `string`
 *   an `owner` of type `User`
 *   a `url` of type `string`
 *   a `gcsObjectName` of type `string` (for internal management in GCS)
 *   an `fileName` of type `string` (the name provided by the user)
 */
interface FileDocument {
  _id: FileID; // The unique identifier for this file record (concept's 'File' type)
  title: string; // The title of the file
  owner: User; // The user who uploaded the file (concept's 'User' type)
  url: string; // The public URL to access the file in Google Cloud Storage
  gcsObjectName: string; // The full path/name of the object in the GCS bucket for internal management
  fileName: string; // The original name of the file, e.g., "document.pdf"
}

/**
 * concept FileUrl[User, fileData]
 *
 * purpose: to let file information be uploaded and displayed
 *
 * principle: the user can request presigned urls in order to upload files, which can then be retrieved and displayed later
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
   * requestUpload(fileName: string, owner: User): (uploadUrl: string, gcsObjectName: string)
   *
   * **requires**:
   *   1. `fileName` isn't empty.
   *   2. No other file with `fileName` has been uploaded by `owner` (i.e., no confirmed file with this name for this user).
   *
   * **effects**:
   *   1. Generates a unique `gcsObjectName` that embeds a temporary file ID.
   *   2. Creates a pre-signed `uploadUrl` that allows the client to upload directly to GCS for a limited time.
   *   3. Returns both the `uploadUrl` and the `gcsObjectName`.
   *   (No database record is created at this stage).
   */
  async requestUpload(
    { fileName, owner }: { fileName: string; owner: User },
  ): Promise<{ uploadUrl: string; gcsObjectName: string } | { error: string }> {
    // REQUIREMENT CHECK 1: `fileName` isn't empty.
    if (!fileName || fileName.trim() === "") {
      return { error: "File name cannot be empty." };
    }

    // REQUIREMENT CHECK 2: No other file with `fileName` has been uploaded by `owner`.
    // This prevents requesting an upload for a file that's already been successfully confirmed.
    const existingFile = await this.files.findOne({
      fileName: fileName,
      owner: owner,
    });
    if (existingFile) {
      return {
        error:
          `A file named '${fileName}' has already been uploaded by owner '${owner}' (File ID: ${existingFile._id}).`,
      };
    }

    try {
      // Generate a unique ID that will eventually be the FileID in MongoDB.
      // This ID is embedded in the GCS object name to link the request to the eventual confirmation.
      const tempFileId: FileID = freshID();

      // Construct a unique object name for GCS.
      // Format: `files/<owner_id>/<temp_file_id>/<encoded_filename>`
      // Encoding `fileName` is crucial to handle special characters safely in GCS object paths.
      const encodedFileName = encodeURIComponent(fileName);
      const gcsObjectName = `files/${owner}/${tempFileId}/${encodedFileName}`;

      // Create a signed URL for *writing* (uploading) the file.

      const [uploadUrl] = await this.storage.bucket(this.bucketName).file(
        gcsObjectName,
      ).getSignedUrl({
        version: "v4",
        action: "write", // 'write' action for uploading to GCS
        expires: Date.now() + 15 * 60 * 1000, // URL expires in 15 minutes, configurable
        // contentType: "application/octet-stream", // Default content type, client can override during upload
      });

      // EFFECT: Return the generated upload URL and the GCS object name.
      // console.log("returning upload url:", { uploadUrl, gcsObjectName });
      return { uploadUrl, gcsObjectName };
    } catch (err: any) {
      return {
        error: `Failed to request upload URL: ${err.message || err}`,
      };
    }
  }

  /**
   * confirmUpload(fileName: string, gcsObjectName: string, owner: User): (file: File)
   *
   * **requires**:
   *   1. An object exists in GCS with `gcsObjectName`.
   *   2. The `owner` and `fileName` provided as arguments match the information encoded within `gcsObjectName`.
   *   3. No `File` record already exists in the database with the file ID embedded in `gcsObjectName`.
   *
   * **effects**:
   *   1. Verifies the existence of the uploaded object in GCS.
   *   2. Extracts the unique file ID (`_id`) from `gcsObjectName`.
   *   3. Constructs a permanent public URL for retrieving the file.
   *   4. Saves a new `File` record in the concept's state (MongoDB) with `fileName`, `gcsObjectName`, `owner`, and `url`.
   *   5. Returns the ID of the newly created `File` record.
   */
  async confirmUpload(
    { fileName, title, gcsObjectName, owner }: {
      fileName: string;
      title: string;
      gcsObjectName: string;
      owner: User;
    },
  ): Promise<{ file: FileID } | { error: string }> {
    // Basic validation of input arguments
    if (!fileName || fileName.trim() === "") {
      return { error: "File name cannot be empty." };
    }
    if (!gcsObjectName || gcsObjectName.trim() === "") {
      return { error: "GCS Object Name cannot be empty." };
    }

    if (!title || title.trim() === "") {
      return { error: "Title cannot be empty." };
    }

    // Parse gcsObjectName to extract embedded information.
    // Expected Format: `files/<owner_id>/<file_id>/<encoded_filename>`
    const parts = gcsObjectName.split("/");
    if (parts.length < 4 || parts[0] !== "files") {
      return {
        error:
          `Invalid GCS object name format: '${gcsObjectName}'. Expected format 'files/<owner>/<fileId>/<encodedFileName>'`,
      };
    }
    const ownerIdInGCS = parts[1] as User;
    const fileIdFromGCS = parts[2] as FileID;
    // Reconstruct the original filename from the encoded parts, handling potential slashes in actual filename
    const fileNameInGCS = decodeURIComponent(parts.slice(3).join("/"));

    // REQUIREMENT CHECK 2: `owner` and `fileName` provided match the information in `gcsObjectName`.
    if (ownerIdInGCS !== owner) {
      return {
        error:
          `Mismatched owner. Provided owner '${owner}' does not match owner in GCS object name '${ownerIdInGCS}'.`,
      };
    }
    if (fileNameInGCS !== fileName) {
      return {
        error:
          `Mismatched file name. Provided file name '${fileName}' does not match file name in GCS object name '${fileNameInGCS}'.`,
      };
    }

    try {
      const gcsFile = this.storage.bucket(this.bucketName).file(gcsObjectName);

      // REQUIREMENT CHECK 1: An object exists in GCS with `gcsObjectName`.
      const [exists] = await gcsFile.exists();
      if (!exists) {
        return {
          error:
            `File with GCS object name '${gcsObjectName}' does not exist in storage. Please ensure the upload was successful.`,
        };
      }

      // REQUIREMENT CHECK 3: No `File` record already exists in the database with this file ID.
      // This prevents double confirmation of the same file upload.
      const existingFileRecord = await this.files.findOne({
        _id: fileIdFromGCS,
      });
      if (existingFileRecord) {
        return {
          error:
            `File record with ID '${fileIdFromGCS}' already exists. This upload has already been confirmed.`,
        };
      }

      // EFFECT 3: Constructs a permanent public URL to access this file.
      // For publicly readable objects, this URL can be directly constructed.
      const publicUrl =
        `https://storage.googleapis.com/${this.bucketName}/${gcsObjectName}`;

      // EFFECT 4: Saves a new `File` record in the concept's state (MongoDB).
      const newFileDocument: FileDocument = {
        _id: fileIdFromGCS, // Use the ID extracted from gcsObjectName
        title: title,
        owner: owner,
        url: publicUrl,
        gcsObjectName: gcsObjectName,
        fileName: fileName,
      };
      await this.files.insertOne(newFileDocument);

      // EFFECT 5: Returns the ID of the newly created `File` record.
      return { file: fileIdFromGCS };
    } catch (gcsError: any) {
      return {
        error: `Failed to confirm upload: ${gcsError.message || gcsError}.`,
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
      // EFFECT 2: Delete the corresponding file content from Google Cloud Storage.
      // Use the stored `gcsObjectName` to target the correct object in the bucket.
      await this.storage.bucket(this.bucketName).file(
        fileToDelete.gcsObjectName,
      ).delete();

      // EFFECT 1: Remove `file` from the concept's state (MongoDB).
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

  /** getViewUrl(gcsObjectName: string): (viewUrl: string)
   *
   * **requires**: `gcsObjectName` exists in GCS.
   *
   * **effects**: Generates and returns a pre-signed URL that allows viewing/downloading
   * the file from Google Cloud Storage for a limited time.
   */
  async getViewUrl(
    { gcsObjectName }: { gcsObjectName: string },
  ): Promise<{ viewUrl: string } | { error: string }> {
    try {
      const gcsFile = this.storage.bucket(this.bucketName).file(gcsObjectName);

      // Check if the object exists in GCS
      const [exists] = await gcsFile.exists();
      if (!exists) {
        return {
          error:
            `File with GCS object name '${gcsObjectName}' does not exist in storage.`,
        };
      }

      // Generate a signed URL for *reading* (viewing) the file.
      const [viewUrl] = await gcsFile.getSignedUrl({
        version: "v4",
        action: "read", // 'read' action for viewing/downloading from GCS
        expires: Date.now() + 15 * 60 * 1000, // URL expires in 15 minutes
      });

      return { viewUrl };
    } catch (err: any) {
      return {
        error: `Failed to generate view URL: ${err.message || err}`,
      };
    }
  }

  /**
   * _getFilesByUser(user: User): (files: File[])
   *
   * **requires**: `user` exists (conceptually, or an active user session).
   *
   * **effects**: Returns an array of `File` documents (metadata) owned by the specified `user`.
   */
  async _getFilesByUser(
    { user }: { user: User },
  ): Promise<{ files: FileDocument[] } | { error: string }> {
    try {
      const files = await this.files.find({ owner: user }).toArray();
      return { files };
    } catch (err: any) {
      return {
        error: `Failed to retrieve files for user '${user}': ${
          err.message || err
        }`,
      };
    }
  }

  /**
   * _getFileById(fileId: FileID): (file: File)
   *
   * **requires**: none
   *
   * **effects**: Returns the `File` document (metadata) matching the given `fileId`, or `null` if not found.
   */
  async _getFileById(
    { fileId }: { fileId: FileID },
  ): Promise<{ file: FileDocument | null } | { error: string }> {
    try {
      const file = await this.files.findOne({ _id: fileId });
      return { file };
    } catch (err: any) {
      return {
        error: `Failed to retrieve file by ID '${fileId}': ${
          err.message || err
        }`,
      };
    }
  }

  /** Query to get file title from ID */
  async _getFileTitleById(
    { fileId }: { fileId: FileID },
  ): Promise<{ title: string } | { error: string }> {
    const file = await this.files.findOne({ _id: fileId });
    if (!file) {
      return { error: "File not found." };
    }
    return { title: file.title };
  }
}
