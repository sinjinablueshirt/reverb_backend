---
timestamp: 'Thu Oct 16 2025 10:20:38 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_102038.31097a2c.md]]'
content_id: ad8389224ccabb0c77cd77749e4e3e10409535b8d0157bfe2a5026e0535643ad
---

# response:

```typescript
import { testDb } from "@utils/database.ts";
import { assert, assertEquals, assertExists, assertNotEquals, assertRejects, assertStringIncludes } from "jsr:@std/assert";
import FileUrlConcept from "./FileUrlConcept.ts";
import { ID } from "@utils/types.ts";
import { dirname, fromFileUrl, join } from "jsr:@std/path";

// --- Common Setup for all tests ---
const currentDir = dirname(fromFileUrl(import.meta.url));
const testPdfPath = join(currentDir, "../../../media/test.pdf");
const originalFileName = "test.pdf"; // Expected file name from the path
const nonExistentFilePath = join(currentDir, "non_existent_file_for_test.txt");

// Pre-flight check for the test environment: GCS_BUCKET_NAME must be set.
const bucketName = Deno.env.get("GCS_BUCKET_NAME");
if (!bucketName) {
  // This error will prevent any test from running if the environment is not set up.
  // This is intentional as GCS is central to the concept.
  throw new Error(
    "GCS_BUCKET_NAME environment variable not set. Please configure it for the tests to run.",
  );
}

// Pre-flight check for the test environment: Ensure the test PDF file exists.
try {
  await Deno.stat(testPdfPath);
} catch (e) {
  if (e instanceof Deno.errors.NotFound) {
    throw new Error(
      `Local test file not found at '${testPdfPath}'. Please ensure 'media/test.pdf' exists in your project root.`,
    );
  }
  throw new Error(`Failed to access local test file: ${e.message}`);
}
// --- End Common Setup ---

Deno.test("FileUrlConcept: Operational Principle - Upload and Verify File", async (t) => {
  const [db, client] = await testDb();
  const fileUrlConcept = new FileUrlConcept(db);
  const testOwner: ID = "user-op-principle" as ID;
  let uploadedFileId: ID | null = null;

  try {
    await t.step("Action: uploadFile", async () => {
      // requires: `filePath` points to a valid file, not already uploaded by `owner`.
      // The `testPdfPath` is valid and not previously uploaded in this fresh test run.
      const uploadResult = await fileUrlConcept.uploadFile({
        filePath: testPdfPath,
        owner: testOwner,
      });

      // effects: returns `file` ID.
      assert(uploadResult, "uploadFile should return a result object.");
      assertEquals("error" in uploadResult, false, `Upload returned error: ${uploadResult.error}`);
      assert("file" in uploadResult, "uploadFile should return a 'file' ID.");
      uploadedFileId = uploadResult.file;
      assertExists(uploadedFileId, "Uploaded file ID should not be null.");
    });

    await t.step("Verification: File record saved in MongoDB and URL structure", async () => {
      // effects: saves a new `file` with `filePath` and `owner`.
      // effects: uploads contents to storage, obtains `url`, saves `url` to `file`.
      const savedFileDocument = await fileUrlConcept.files.findOne({ _id: uploadedFileId });

      assertExists(savedFileDocument, `File document with ID '${uploadedFileId}' should be found.`);
      assertEquals(savedFileDocument._id, uploadedFileId, "Saved _id should match returned ID.");
      assertEquals(savedFileDocument.filePath, testPdfPath, "Saved filePath should match input.");
      assertEquals(savedFileDocument.owner, testOwner, "Saved owner should match input.");
      assertExists(savedFileDocument.url, "Saved document should have a non-empty URL.");
      assertExists(savedFileDocument.gcsObjectName, "Saved document should have a GCS object name.");

      // Verify the URL structure corresponds to GCS and our naming convention
      assertStringIncludes(
        savedFileDocument.url,
        `https://storage.googleapis.com/${bucketName}/`,
        "URL should start with GCS bucket path.",
      );
      assertStringIncludes(savedFileDocument.url, savedFileDocument.gcsObjectName, "URL should contain GCS object name.");
      const expectedGcsObjectNamePart = `files/${testOwner}/${uploadedFileId}/${originalFileName}`;
      assertStringIncludes(
        savedFileDocument.gcsObjectName,
        expectedGcsObjectNamePart,
        `GCS object name should follow 'files/<owner_id>/<file_record_id>/<original_filename>'.`,
      );
    });
  } finally {
    // Cleanup: Ensure the uploaded file is deleted to return to original state.
    if (uploadedFileId) {
      const deleteResult = await fileUrlConcept.deleteFile({ file: uploadedFileId, user: testOwner });
      if ("error" in deleteResult) {
        console.error(`Cleanup failed for file ID ${uploadedFileId}: ${deleteResult.error}`);
      }
      assertEquals("error" in deleteResult, false, `Cleanup deleteFile returned error.`);
      const deletedFile = await fileUrlConcept.files.findOne({ _id: uploadedFileId });
      assertEquals(deletedFile, null, "File should be removed from MongoDB after deletion.");
    }
    await client.close();
  }
});

Deno.test("FileUrlConcept: Scenario 2 - Uploading the same file twice by the same user should fail", async (t) => {
  const [db, client] = await testDb();
  const fileUrlConcept = new FileUrlConcept(db);
  const testOwner: ID = "user-scenario2" as ID;
  let uploadedFileId: ID | null = null;

  try {
    await t.step("Action: First uploadFile (expected to succeed)", async () => {
      const uploadResult1 = await fileUrlConcept.uploadFile({
        filePath: testPdfPath,
        owner: testOwner,
      });
      assertEquals("error" in uploadResult1, false, `First upload returned an error: ${uploadResult1.error}`);
      uploadedFileId = uploadResult1.file;
      assertExists(uploadedFileId, "First upload should provide a file ID.");
    });

    await t.step("Action: Second uploadFile with same filePath and owner (expected to fail)", async () => {
      // requires: `filePath` isn't already uploaded (by this owner)
      const uploadResult2 = await fileUrlConcept.uploadFile({
        filePath: testPdfPath,
        owner: testOwner,
      });

      // effects: returns an error because the requirement is violated.
      assert("error" in uploadResult2, "Second upload should return an error.");
      assertStringIncludes(uploadResult2.error, "has already been uploaded by owner", "Error message should indicate duplicate upload.");
    });
  } finally {
    // Cleanup
    if (uploadedFileId) {
      await fileUrlConcept.deleteFile({ file: uploadedFileId, user: testOwner });
    }
    await client.close();
  }
});

Deno.test("FileUrlConcept: Scenario 3 - Uploading the same file by different users should succeed", async (t) => {
  const [db, client] = await testDb();
  const fileUrlConcept = new FileUrlConcept(db);
  const testOwner1: ID = "user-scenario3-1" as ID;
  const testOwner2: ID = "user-scenario3-2" as ID;
  const uploadedFileIds: { id: ID; owner: ID }[] = [];

  try {
    await t.step("Action: First uploadFile by Owner 1 (expected to succeed)", async () => {
      const uploadResult1 = await fileUrlConcept.uploadFile({
        filePath: testPdfPath,
        owner: testOwner1,
      });
      assertEquals("error" in uploadResult1, false, `Owner 1 upload returned an error: ${uploadResult1.error}`);
      assertExists(uploadResult1.file, "Owner 1 upload should provide a file ID.");
      uploadedFileIds.push({ id: uploadResult1.file, owner: testOwner1 });
    });

    await t.step("Action: Second uploadFile with same filePath by Owner 2 (expected to succeed)", async () => {
      // This should succeed as the uniqueness requirement is per owner.
      const uploadResult2 = await fileUrlConcept.uploadFile({
        filePath: testPdfPath,
        owner: testOwner2,
      });
      assertEquals("error" in uploadResult2, false, `Owner 2 upload returned an error: ${uploadResult2.error}`);
      assertExists(uploadResult2.file, "Owner 2 upload should provide a file ID.");
      uploadedFileIds.push({ id: uploadResult2.file, owner: testOwner2 });
      assertNotEquals(uploadedFileIds[0].id, uploadedFileIds[1].id, "File IDs for different owners should be unique.");
    });

    await t.step("Verification: Both files exist in the database", async () => {
      const file1 = await fileUrlConcept.files.findOne({ _id: uploadedFileIds[0].id });
      assertExists(file1, "File uploaded by owner 1 should exist.");
      assertEquals(file1?.owner, testOwner1, "File 1 owner incorrect.");

      const file2 = await fileUrlConcept.files.findOne({ _id: uploadedFileIds[1].id });
      assertExists(file2, "File uploaded by owner 2 should exist.");
      assertEquals(file2?.owner, testOwner2, "File 2 owner incorrect.");
    });
  } finally {
    // Cleanup
    for (const { id, owner } of uploadedFileIds) {
      await fileUrlConcept.deleteFile({ file: id, user: owner });
    }
    await client.close();
  }
});

Deno.test("FileUrlConcept: Scenario 4 - Deleting a non-existent file should fail", async (t) => {
  const [db, client] = await testDb();
  const fileUrlConcept = new FileUrlConcept(db);
  const bogusFileId: ID = "nonexistent-file-123" as ID;
  const testUser: ID = "any-user" as ID;

  await t.step("Action: deleteFile with a non-existent file ID (expected to fail)", async () => {
    // requires: `file` exists
    const deleteResult = await fileUrlConcept.deleteFile({ file: bogusFileId, user: testUser });

    // effects: returns an error because the requirement is violated.
    assert("error" in deleteResult, "Deletion of non-existent file should return an error.");
    assertStringIncludes(deleteResult.error, "not found", "Error message should indicate file not found.");
  });

  await client.close();
});

Deno.test("FileUrlConcept: Scenario 5 - Deleting a file by a non-owner should fail", async (t) => {
  const [db, client] = await testDb();
  const fileUrlConcept = new FileUrlConcept(db);
  const fileOwner: ID = "owner-for-deletion-test" as ID;
  const nonOwner: ID = "non-owner-for-deletion-test" as ID;
  let uploadedFileId: ID | null = null;

  try {
    await t.step("Setup: Upload a file by fileOwner", async () => {
      const uploadResult = await fileUrlConcept.uploadFile({
        filePath: testPdfPath,
        owner: fileOwner,
      });
      assertEquals("error" in uploadResult, false, `Setup upload failed: ${uploadResult.error}`);
      uploadedFileId = uploadResult.file;
      assertExists(uploadedFileId, "Setup upload should provide a file ID.");
    });

    await t.step("Action: deleteFile by nonOwner (expected to fail)", async () => {
      // requires: `user` is its `owner`
      assertExists(uploadedFileId, "Uploaded file ID must exist for this step.");
      const deleteResult = await fileUrlConcept.deleteFile({ file: uploadedFileId, user: nonOwner });

      // effects: returns an error because the requirement is violated.
      assert("error" in deleteResult, "Deletion by non-owner should return an error.");
      assertStringIncludes(deleteResult.error, "not authorized", "Error message should indicate unauthorized deletion.");
    });

    await t.step("Verification: File still exists in DB after unauthorized deletion attempt", async () => {
      assertExists(uploadedFileId, "Uploaded file ID must exist for this step.");
      const fileAfterAttempt = await fileUrlConcept.files.findOne({ _id: uploadedFileId });
      assertExists(fileAfterAttempt, "File should still exist in DB after unauthorized deletion attempt.");
      assertEquals(fileAfterAttempt?.owner, fileOwner, "File owner should remain the original owner.");
    });
  } finally {
    // Cleanup: Ensure the file is deleted by the rightful owner.
    if (uploadedFileId) {
      const deleteResult = await fileUrlConcept.deleteFile({ file: uploadedFileId, user: fileOwner });
      if ("error" in deleteResult) {
        console.error(`Cleanup failed for file ID ${uploadedFileId}: ${deleteResult.error}`);
      }
      assertEquals("error" in deleteResult, false, "Cleanup deleteFile by owner returned error.");
      const deletedFile = await fileUrlConcept.files.findOne({ _id: uploadedFileId });
      assertEquals(deletedFile, null, "File should be removed from MongoDB after successful cleanup deletion.");
    }
    await client.close();
  }
});

Deno.test("FileUrlConcept: Scenario 6 - uploadFile with invalid filePath should fail", async (t) => {
  const [db, client] = await testDb();
  const fileUrlConcept = new FileUrlConcept(db);
  const testOwner: ID = "user-invalid-path" as ID;

  await t.step("Action: uploadFile with a non-existent local filePath (expected to fail)", async () => {
    // requires: `filePath` points to a valid file
    const uploadResult = await fileUrlConcept.uploadFile({
      filePath: nonExistentFilePath,
      owner: testOwner,
    });

    // effects: returns an error because the requirement is violated.
    assert("error" in uploadResult, "Upload with non-existent path should return an error.");
    assertStringIncludes(uploadResult.error, "Local file not found at path", "Error message should indicate file not found.");
  });

  await client.close();
});
```
