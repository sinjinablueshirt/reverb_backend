---
timestamp: 'Thu Oct 16 2025 16:08:11 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_160811.d1ce9d1e.md]]'
content_id: 54822259456a59e2847c9e49b6447222931ab43b9556e4ad24bd19782e56eca4
---

# response:

```typescript
// file: src/concepts/FileUrl/FileUrlConcept.test.ts

import { assertEquals, assertNotEquals } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import FileUrlConcept from "./FileUrlConcept.ts";
import { ID } from "@utils/types.ts";
import { Collection } from "npm:mongodb";

// Declare collection prefix, use concept name
const PREFIX = "FileUrl" + ".";

// Define a simple type for the FileDocument interface (copied from concept)
interface FileDocument {
  _id: ID;
  filePath: string;
  owner: ID;
  url: string;
  gcsObjectName: string;
}

// Temporary directory for test files
const TEST_FILES_DIR = "./.test_files";

/**
 * Global setup for FileUrlConcept tests.
 * Ensures the GCS_BUCKET_NAME environment variable is set for the concept's instantiation,
 * and creates a temporary directory for local test files.
 */
Deno.test.beforeAll(() => {
  // Check if GCS_BUCKET_NAME is already set (e.g., from .env or CI config)
  // If not, set a placeholder. Note: Actual GCS operations will fail without
  // proper authentication and a real bucket configured. This placeholder
  // only prevents the FileUrlConcept constructor from throwing an error.
  if (!Deno.env.get("GCS_BUCKET_NAME")) {
    console.warn(
      "GCS_BUCKET_NAME not set. Setting a placeholder 'test-bucket-name' for testing. " +
        "Real Google Cloud Storage operations require proper configuration.",
    );
    Deno.env.set("GCS_BUCKET_NAME", "your-test-gcs-bucket-name");
  }

  // Create temporary directory for local test files if it doesn't exist
  try {
    Deno.mkdirSync(TEST_FILES_DIR, { recursive: true });
  } catch (e) {
    if (!(e instanceof Deno.errors.AlreadyExists)) {
      throw e;
    }
  }
});

/**
 * Global teardown for FileUrlConcept tests.
 * Cleans up the temporary directory created for local test files.
 */
Deno.test.afterAll(async () => {
  try {
    await Deno.remove(TEST_FILES_DIR, { recursive: true });
  } catch (e) {
    // Ignore if already removed or not found
    if (!(e instanceof Deno.errors.NotFound)) {
      console.error("Failed to clean up test files directory:", e);
    }
  }
});

Deno.test("FileUrlConcept", async (t) => {
  // Initialize test database and FileUrlConcept
  const [db, client] = await testDb();
  const concept = new FileUrlConcept(db);
  // Get a direct reference to the collection for verification
  const filesCollection: Collection<FileDocument> = db.collection(
    PREFIX + "files",
  );

  // Define mock user IDs
  const user1: ID = "user123";
  const user2: ID = "user456";

  /**
   * Helper function to create a temporary local file for testing.
   * @param fileName The name of the file (e.g., "test.txt").
   * @param content The content to write to the file.
   * @returns The full path to the created local file.
   */
  const createLocalTestFile = async (
    fileName: string,
    content: string,
  ): Promise<string> => {
    const filePath = `${TEST_FILES_DIR}/${fileName}`;
    await Deno.writeTextFile(filePath, content);
    return filePath;
  };

  /**
   * Helper function to remove a temporary local file.
   * @param filePath The path to the local file to remove.
   */
  const removeLocalTestFile = async (filePath: string) => {
    try {
      await Deno.remove(filePath);
    } catch (e) {
      if (!(e instanceof Deno.errors.NotFound)) {
        console.error(`Failed to remove local test file ${filePath}:`, e);
      }
    }
  };

  await t.step(
    "Scenario 1: Operational Principle - Upload a file and verify its state",
    async () => {
      console.log("\n--- Scenario 1: Operational Principle ---");

      // 1. Create a dummy local file
      const localFilePath = await createLocalTestFile(
        "document_op.txt",
        "This is a test document for the operational principle.",
      );
      const expectedFileName = "document_op.txt";

      // 2. Perform the upload action
      console.log(`Action: uploadFile('${localFilePath}', '${user1}')`);
      const uploadResult = await concept.uploadFile({
        filePath: localFilePath,
        owner: user1,
      });

      // Confirm upload was successful
      assertEquals(
        "file" in uploadResult,
        true,
        `Expected upload to succeed, but got error: ${uploadResult.error}`,
      );
      const uploadedFileId = (uploadResult as { file: ID }).file;
      console.log(`Effect: File uploaded with ID: ${uploadedFileId}`);

      // 3. Verify the state change: file information stored in the database
      const storedFile = await filesCollection.findOne({ _id: uploadedFileId });
      assertEquals(
        storedFile !== null,
        true,
        `File with ID ${uploadedFileId} not found in DB.`,
      );
      assertEquals(storedFile?.filePath, localFilePath, "Stored filePath should match original.");
      assertEquals(storedFile?.owner, user1, "Stored owner should match original.");
      assertNotEquals(storedFile?.url, undefined, "File should have a URL.");
      assertNotEquals(storedFile?.url, "", "File URL should not be empty.");
      assertNotEquals(storedFile?.gcsObjectName, undefined, "GCS object name should be stored.");
      assertNotEquals(storedFile?.gcsObjectName, "", "GCS object name should not be empty.");
      assertEquals(
        storedFile?.url.includes(concept.bucketName),
        true,
        "URL should contain the configured bucket name.",
      );
      assertEquals(
        storedFile?.gcsObjectName.includes(
          `${user1}/${uploadedFileId}/${expectedFileName}`,
        ),
        true,
        "GCS object name should follow the expected pattern (owner/fileId/filename).",
      );
      console.log(`Effect: File details verified in DB. URL: ${storedFile?.url}`);

      // 4. Cleanup: Delete the uploaded file and verify its removal
      console.log(`Action: deleteFile('${uploadedFileId}', '${user1}')`);
      const deleteResult = await concept.deleteFile({
        file: uploadedFileId,
        user: user1,
      });
      assertEquals(
        "error" in deleteResult,
        false,
        `Expected delete to succeed, but got error: ${deleteResult.error}`,
      );
      console.log(`Effect: File with ID ${uploadedFileId} deleted.`);

      const deletedFile = await filesCollection.findOne({ _id: uploadedFileId });
      assertEquals(
        deletedFile === null,
        true,
        "File should be completely removed from DB after deletion.",
      );
      // Remove the local test file
      await removeLocalTestFile(localFilePath);
    },
  );

  await t.step(
    "Scenario 2: Uploading an already uploaded file for the same owner (should fail)",
    async () => {
      console.log(
        "\n--- Scenario 2: Uploading duplicate file for same owner (expected to fail) ---",
      );

      // 1. Create a dummy local file
      const localFilePath = await createLocalTestFile(
        "duplicate_test.txt",
        "Content for duplicate test.",
      );

      // 2. Perform the first, successful upload
      console.log(`Action: uploadFile('${localFilePath}', '${user1}') - First upload`);
      const firstUploadResult = await concept.uploadFile({
        filePath: localFilePath,
        owner: user1,
      });
      assertEquals(
        "file" in firstUploadResult,
        true,
        `Expected first upload to succeed, but got error: ${firstUploadResult.error}`,
      );
      const uploadedFileId = (firstUploadResult as { file: ID }).file;
      console.log(`Effect: File uploaded successfully with ID: ${uploadedFileId}`);

      // 3. Attempt to upload the *same* file with the *same* owner again
      console.log(`Action: uploadFile('${localFilePath}', '${user1}') - Second upload`);
      const secondUploadResult = await concept.uploadFile({
        filePath: localFilePath,
        owner: user1,
      });

      // Confirm it failed as required
      assertEquals("error" in secondUploadResult, true, "Expected an error for duplicate upload.");
      assertEquals(
        (secondUploadResult as { error: string }).error.includes(
          `File '${localFilePath}' has already been uploaded by owner '${user1}'`,
        ),
        true,
        "Expected an error message indicating a duplicate file for the same owner.",
      );
      console.log(
        `Effect: Correctly received error for duplicate upload attempt: ${
          (secondUploadResult as { error: string }).error
        }`,
      );

      // Verify no new file record was created
      const count = await filesCollection.countDocuments({ filePath: localFilePath, owner: user1 });
      assertEquals(count, 1, "Only one file record should exist for the duplicate upload scenario.");

      // 4. Cleanup: Delete the successfully uploaded file
      console.log(`Action: deleteFile('${uploadedFileId}', '${user1}') (cleanup)`);
      const deleteResult = await concept.deleteFile({
        file: uploadedFileId,
        user: user1,
      });
      assertEquals(
        "error" in deleteResult,
        false,
        `Expected cleanup delete to succeed, but got error: ${deleteResult.error}`,
      );
      await removeLocalTestFile(localFilePath);
    },
  );

  await t.step(
    "Scenario 3: Deleting a non-existent file (should fail)",
    async () => {
      console.log("\n--- Scenario 3: Deleting a non-existent file (expected to fail) ---");

      const nonExistentFileId: ID = "nonExistent123";
      console.log(
        `Action: deleteFile('${nonExistentFileId}', '${user1}')`,
      );
      const deleteResult = await concept.deleteFile({
        file: nonExistentFileId,
        user: user1,
      });

      // Confirm it failed as required
      assertEquals("error" in deleteResult, true, "Expected an error for deleting a non-existent file.");
      assertEquals(
        (deleteResult as { error: string }).error,
        `File with ID '${nonExistentFileId}' not found.`,
        "Expected specific error message for non-existent file deletion.",
      );
      console.log(
        `Effect: Correctly received error for non-existent file deletion: ${
          (deleteResult as { error: string }).error
        }`,
      );
      // No cleanup needed as nothing was created
    },
  );

  await t.step(
    "Scenario 4: Deleting a file by a non-owner (should fail)",
    async () => {
      console.log("\n--- Scenario 4: Deleting a file by a non-owner (expected to fail) ---");

      // 1. Create a dummy local file
      const localFilePath = await createLocalTestFile(
        "owner_delete.txt",
        "Content for owner delete test.",
      );

      // 2. User 1 uploads a file successfully
      console.log(`Action: uploadFile('${localFilePath}', '${user1}')`);
      const uploadResult = await concept.uploadFile({
        filePath: localFilePath,
        owner: user1,
      });
      assertEquals(
        "file" in uploadResult,
        true,
        `Expected upload to succeed, but got error: ${uploadResult.error}`,
      );
      const uploadedFileId = (uploadResult as { file: ID }).file;
      console.log(`Effect: File uploaded with ID: ${uploadedFileId}`);

      // 3. User 2 (not the owner) attempts to delete the file
      console.log(`Action: deleteFile('${uploadedFileId}', '${user2}')`);
      const deleteResultByWrongUser = await concept.deleteFile({
        file: uploadedFileId,
        user: user2, // user2 is not the owner
      });

      // Confirm it failed as required
      assertEquals("error" in deleteResultByWrongUser, true, "Expected an authorization error for non-owner deletion.");
      assertEquals(
        (deleteResultByWrongUser as { error: string }).error.includes(
          `User '${user2}' is not authorized to delete file '${uploadedFileId}' (owner is '${user1}').`,
        ),
        true,
        "Expected specific authorization error for non-owner deletion.",
      );
      console.log(
        `Effect: Correctly received authorization error: ${
          (deleteResultByWrongUser as { error: string }).error
        }`,
      );

      // Verify the file still exists in the database
      const fileAfterFailedDelete = await filesCollection.findOne({ _id: uploadedFileId });
      assertEquals(fileAfterFailedDelete !== null, true, "File should still exist after unauthorized deletion attempt.");

      // 4. Cleanup by the actual owner
      console.log(`Action: deleteFile('${uploadedFileId}', '${user1}') (cleanup)`);
      const cleanupResult = await concept.deleteFile({
        file: uploadedFileId,
        user: user1,
      });
      assertEquals(
        "error" in cleanupResult,
        false,
        `Expected cleanup delete to succeed, but got error: ${cleanupResult.error}`,
      );
      console.log(`Effect: File ${uploadedFileId} cleaned up by owner ${user1}.`);
      await removeLocalTestFile(localFilePath);
    },
  );

  await t.step(
    "Scenario 5: Uploading multiple files for same and different users",
    async () => {
      console.log(
        "\n--- Scenario 5: Uploading multiple files for same and different users ---",
      );

      // 1. Create multiple dummy local files
      const filePathA = await createLocalTestFile("file_A.txt", "Content A for user1");
      const filePathB = await createLocalTestFile("file_B.txt", "Content B for user1");
      const filePathC = await createLocalTestFile("file_C.txt", "Content C for user2");

      // 2. User 1 uploads two files
      console.log(`Action: uploadFile('${filePathA}', '${user1}')`);
      const uploadResultA = await concept.uploadFile({
        filePath: filePathA,
        owner: user1,
      });
      assertEquals("file" in uploadResultA, true, `Upload A failed: ${uploadResultA.error}`);
      const fileIdA = (uploadResultA as { file: ID }).file;
      console.log(`Effect: File A uploaded with ID: ${fileIdA}`);

      console.log(`Action: uploadFile('${filePathB}', '${user1}')`);
      const uploadResultB = await concept.uploadFile({
        filePath: filePathB,
        owner: user1,
      });
      assertEquals("file" in uploadResultB, true, `Upload B failed: ${uploadResultB.error}`);
      const fileIdB = (uploadResultB as { file: ID }).file;
      console.log(`Effect: File B uploaded with ID: ${fileIdB}`);

      // 3. User 2 uploads one file
      console.log(`Action: uploadFile('${filePathC}', '${user2}')`);
      const uploadResultC = await concept.uploadFile({
        filePath: filePathC,
        owner: user2,
      });
      assertEquals("file" in uploadResultC, true, `Upload C failed: ${uploadResultC.error}`);
      const fileIdC = (uploadResultC as { file: ID }).file;
      console.log(`Effect: File C uploaded with ID: ${fileIdC}`);

      // 4. Verify all files exist in DB with correct owners
      const storedFileA = await filesCollection.findOne({ _id: fileIdA });
      const storedFileB = await filesCollection.findOne({ _id: fileIdB });
      const storedFileC = await filesCollection.findOne({ _id: fileIdC });

      assertEquals(storedFileA?.owner, user1, "File A should be owned by user1.");
      assertEquals(storedFileB?.owner, user1, "File B should be owned by user1.");
      assertEquals(storedFileC?.owner, user2, "File C should be owned by user2.");
      assertEquals(await filesCollection.countDocuments(), 3, "Expected 3 files in the DB.");
      console.log("Effect: All files verified to exist with correct owners in DB.");

      // 5. Cleanup: Delete all uploaded files by their respective owners
      console.log(`Action: deleteFile('${fileIdA}', '${user1}') (cleanup)`);
      await concept.deleteFile({ file: fileIdA, user: user1 });
      console.log(`Action: deleteFile('${fileIdB}', '${user1}') (cleanup)`);
      await concept.deleteFile({ file: fileIdB, user: user1 });
      console.log(`Action: deleteFile('${fileIdC}', '${user2}') (cleanup)`);
      await concept.deleteFile({ file: fileIdC, user: user2 });
      console.log("Effect: All files cleaned up.");

      // Verify all files are removed from DB
      assertEquals(await filesCollection.countDocuments(), 0, "All files should be removed from DB after cleanup.");
      await removeLocalTestFile(filePathA);
      await removeLocalTestFile(filePathB);
      await removeLocalTestFile(filePathC);
    },
  );

  // Close the database client after all tests
  await client.close();
});

```
