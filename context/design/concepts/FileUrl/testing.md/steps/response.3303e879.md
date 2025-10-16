---
timestamp: 'Thu Oct 16 2025 10:14:37 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_101437.6706387b.md]]'
content_id: 3303e87951a7483fad265954d3d9d274f28e645761ea5d251728cfaa7b4bff65
---

# response:

```typescript
import { testDb } from "@utils/database.ts";
import { assert, assertEquals, assertExists, assertNotEquals, assertStringIncludes } from "jsr:@std/assert";
import FileUrlConcept from "./FileUrlConcept.ts";
import { ID } from "@utils/types.ts";
import { dirname, fromFileUrl, join } from "jsr:@std/path";

// Helper function to get the path to the test PDF.
// Assumes media/test.pdf is at the project root.
function getTestPdfPath(): string {
  const currentDir = dirname(fromFileUrl(import.meta.url));
  return join(currentDir, "../../../media/test.pdf");
}

// Helper function to create a dummy non-existent file path
function getNonExistentFilePath(): string {
  const currentDir = dirname(fromFileUrl(import.meta.url));
  return join(currentDir, "non_existent_file.txt");
}

// Ensure GCS_BUCKET_NAME is set for all tests that interact with the FileUrlConcept.
// The concept's constructor throws if it's not set.
Deno.test.beforeAll(() => {
  if (!Deno.env.get("GCS_BUCKET_NAME")) {
    console.error(
      "ERROR: GCS_BUCKET_NAME environment variable not set. Please configure it for FileUrlConcept tests to run successfully.",
    );
    Deno.exit(1); // Exit if critical env var is missing
  }
});

Deno.test(
  "FileUrlConcept: Operational Principle - User uploads a file and it's retrievable",
  async () => {
    console.log(
      "--- Starting FileUrlConcept: Operational Principle (upload success) test ---",
    );
    console.log(
      "This scenario tests the core principle: a user uploads a file, and it becomes available via a URL.",
    );

    // 1. Setup: Initialize database and the concept
    const [db, client] = await testDb();
    const fileUrlConcept = new FileUrlConcept(db);

    const testOwner: ID = "user_op_principle" as ID;
    const testFilePath = getTestPdfPath();
    const originalFileName = "test.pdf";

    // Verify local test file exists
    try {
      await Deno.stat(testFilePath);
      console.log(`Requirement met: Local test PDF file found at '${testFilePath}'.`);
    } catch (e) {
      console.error(
        `ERROR: Local test file not found at '${testFilePath}'. Please ensure 'media/test.pdf' exists in the project root relative to the test runner.`,
      );
      await client.close();
      throw e; // Fail the test if the required file isn't present.
    }

    // 2. Action: `uploadFile`
    console.log(
      `Action: Calling uploadFile with filePath: '${testFilePath}', owner: '${testOwner}'`,
    );
    const uploadResult = await fileUrlConcept.uploadFile({
      filePath: testFilePath,
      owner: testOwner,
    });

    // 3. Assertions: Verify the effects
    // Effect 1 & 5: uploadFile returns a new file ID
    assert("file" in uploadResult, `Expected success, got error: ${uploadResult.error}`);
    const uploadedFileId = uploadResult.file;
    console.log(`Effect confirmed: uploadFile returned new file ID: '${uploadedFileId}'`);

    // Effect 4: File record was saved in MongoDB
    const savedFileDocument = await fileUrlConcept.files.findOne({
      _id: uploadedFileId,
    });
    assertExists(
      savedFileDocument,
      `Effect confirmed: File document with ID '${uploadedFileId}' should be found in the database.`,
    );
    console.log("Effect confirmed: Retrieved saved file document:", savedFileDocument);

    // Confirm the properties of the saved document
    assertEquals(
      savedFileDocument._id,
      uploadedFileId,
      "Saved document _id should match the returned file ID.",
    );
    assertEquals(
      savedFileDocument.filePath,
      testFilePath,
      "Saved filePath should match the original input filePath.",
    );
    assertEquals(
      savedFileDocument.owner,
      testOwner,
      "Saved owner should match the input owner.",
    );

    // Effect 3: Document has a unique public URL
    assertExists(savedFileDocument.url, "Saved document should have a non-empty URL.");
    assertStringIncludes(
      savedFileDocument.url,
      `https://storage.googleapis.com/${Deno.env.get("GCS_BUCKET_NAME")}/`,
      "URL should start with the Google Cloud Storage base path for the bucket.",
    );
    assertStringIncludes(
      savedFileDocument.url,
      savedFileDocument.gcsObjectName,
      "URL should contain the GCS object name.",
    );

    // Effect 2: Contents uploaded to external storage service, reflected in gcsObjectName
    assertExists(
      savedFileDocument.gcsObjectName,
      "Saved document should have a non-empty GCS object name.",
    );
    const expectedGcsObjectNamePart =
      `files/${testOwner}/${uploadedFileId}/${originalFileName}`;
    assertStringIncludes(
      savedFileDocument.gcsObjectName,
      expectedGcsObjectNamePart,
      `GCS object name should follow the pattern 'files/<owner_id>/<file_record_id>/<original_filename>'. Expected part: ${expectedGcsObjectNamePart}`,
    );

    console.log(
      "--- FileUrlConcept: Operational Principle test completed successfully ---",
    );

    await client.close();
  },
);

Deno.test(
  "FileUrlConcept: Scenario 1 - `uploadFile` fails with invalid (non-existent) filePath",
  async () => {
    console.log(
      "--- Starting FileUrlConcept: Scenario 1 (uploadFile with non-existent file) test ---",
    );

    const [db, client] = await testDb();
    const fileUrlConcept = new FileUrlConcept(db);

    const testOwner: ID = "user_non_existent" as ID;
    const nonExistentFilePath = getNonExistentFilePath();

    // Requirement Check: `filePath` points to a valid file. This test aims to fail this.
    console.log(
      `Requirement check: Attempting to use non-existent local file path: '${nonExistentFilePath}'`,
    );

    // Action: Call `uploadFile`
    console.log(
      `Action: Calling uploadFile with non-existent filePath: '${nonExistentFilePath}'`,
    );
    const uploadResult = await fileUrlConcept.uploadFile({
      filePath: nonExistentFilePath,
      owner: testOwner,
    });

    // Assertions: Verify expected error
    assert("error" in uploadResult, "Expected an error result from uploadFile.");
    assertStringIncludes(
      uploadResult.error,
      "Local file not found",
      `Effect confirmed: Expected 'Local file not found' error, got: ${uploadResult.error}`,
    );
    console.log(`Effect confirmed: uploadFile returned expected error: ${uploadResult.error}`);

    // Verify no file record was saved in the database
    const fileCount = await fileUrlConcept.files.countDocuments({ owner: testOwner });
    assertEquals(
      fileCount,
      0,
      "Effect confirmed: No file document should be saved in the database for this owner.",
    );

    console.log(
      "--- FileUrlConcept: Scenario 1 test completed successfully ---",
    );
    await client.close();
  },
);

Deno.test(
  "FileUrlConcept: Scenario 2 - `uploadFile` fails when file already uploaded by owner",
  async () => {
    console.log(
      "--- Starting FileUrlConcept: Scenario 2 (uploadFile already uploaded) test ---",
    );

    const [db, client] = await testDb();
    const fileUrlConcept = new FileUrlConcept(db);

    const testOwner: ID = "user_duplicate_upload" as ID;
    const testFilePath = getTestPdfPath();

    // Verify local test file exists
    try {
      await Deno.stat(testFilePath);
      console.log(`Requirement met: Local test PDF file found at '${testFilePath}'.`);
    } catch (e) {
      console.error(
        `ERROR: Local test file not found at '${testFilePath}'. Please ensure 'media/test.pdf' exists in the project root relative to the test runner.`,
      );
      await client.close();
      throw e;
    }

    // First Action: Successful upload
    console.log(
      `First Action: Calling uploadFile successfully for filePath: '${testFilePath}', owner: '${testOwner}'`,
    );
    const firstUploadResult = await fileUrlConcept.uploadFile({
      filePath: testFilePath,
      owner: testOwner,
    });
    assert("file" in firstUploadResult, "First upload should be successful.");
    const firstFileId = firstUploadResult.file;
    console.log(`Effect confirmed: First upload successful, file ID: '${firstFileId}'`);

    // Requirement Check: `filePath` isn't already uploaded by this `owner`. This test aims to fail this.
    console.log(
      `Requirement check: Attempting to upload the same file ('${testFilePath}') by the same owner ('${testOwner}') again.`,
    );

    // Second Action: Attempt to upload the same file again
    console.log(
      `Second Action: Calling uploadFile again for filePath: '${testFilePath}', owner: '${testOwner}'`,
    );
    const secondUploadResult = await fileUrlConcept.uploadFile({
      filePath: testFilePath,
      owner: testOwner,
    });

    // Assertions: Verify expected error
    assert("error" in secondUploadResult, "Expected an error result from the second upload.");
    assertStringIncludes(
      secondUploadResult.error,
      "already been uploaded",
      `Effect confirmed: Expected 'already been uploaded' error, got: ${secondUploadResult.error}`,
    );
    console.log(
      `Effect confirmed: Second upload returned expected error: ${secondUploadResult.error}`,
    );

    // Verify only one file record exists in the database for this filePath and owner
    const fileCount = await fileUrlConcept.files.countDocuments({
      filePath: testFilePath,
      owner: testOwner,
    });
    assertEquals(
      fileCount,
      1,
      "Effect confirmed: Only one file document should exist for this filePath and owner.",
    );

    console.log(
      "--- FileUrlConcept: Scenario 2 test completed successfully ---",
    );
    await client.close();
  },
);

Deno.test(
  "FileUrlConcept: Scenario 3 - `deleteFile` successfully deletes an uploaded file",
  async () => {
    console.log(
      "--- Starting FileUrlConcept: Scenario 3 (deleteFile success) test ---",
    );

    const [db, client] = await testDb();
    const fileUrlConcept = new FileUrlConcept(db);

    const testOwner: ID = "user_delete_success" as ID;
    const testFilePath = getTestPdfPath();

    // Pre-requisite: Upload a file first
    const uploadResult = await fileUrlConcept.uploadFile({
      filePath: testFilePath,
      owner: testOwner,
    });
    assert("file" in uploadResult, "Pre-requisite upload should be successful.");
    const fileToDeleteId = uploadResult.file;
    console.log(`Pre-requisite: File uploaded with ID: '${fileToDeleteId}'`);

    // Requirement Check: `file` exists and `user` is its `owner`.
    const preDeleteFile = await fileUrlConcept.files.findOne({ _id: fileToDeleteId });
    assertExists(preDeleteFile, "Requirement met: File exists in DB before deletion.");
    assertEquals(
      preDeleteFile.owner,
      testOwner,
      "Requirement met: User is the owner of the file.",
    );

    // Action: Call `deleteFile`
    console.log(
      `Action: Calling deleteFile for file ID: '${fileToDeleteId}', by owner: '${testOwner}'`,
    );
    const deleteResult = await fileUrlConcept.deleteFile({
      file: fileToDeleteId,
      user: testOwner,
    });

    // Assertions: Verify the effects
    assertEquals(
      "error" in deleteResult,
      false,
      `Effect confirmed: deleteFile returned an unexpected error: ${deleteResult}`,
    );
    assertEquals(deleteResult, {}, "Effect confirmed: deleteFile should return an empty object on success.");
    console.log("Effect confirmed: deleteFile returned success (empty object).");

    // Effect 1: `file` is removed from the state (MongoDB)
    const postDeleteFile = await fileUrlConcept.files.findOne({ _id: fileToDeleteId });
    assertEquals(
      postDeleteFile,
      null,
      "Effect confirmed: File document should no longer be found in the database.",
    );
    console.log(
      `Effect confirmed: File with ID '${fileToDeleteId}' successfully removed from database.`,
    );

    // Effect 2: Its `url` isn't able to access it through the `url` (implicitly tested by GCS interaction within concept, verified by DB removal)

    console.log(
      "--- FileUrlConcept: Scenario 3 test completed successfully ---",
    );
    await client.close();
  },
);

Deno.test(
  "FileUrlConcept: Scenario 4 - `deleteFile` fails for a non-existent file",
  async () => {
    console.log(
      "--- Starting FileUrlConcept: Scenario 4 (deleteFile non-existent) test ---",
    );

    const [db, client] = await testDb();
    const fileUrlConcept = new FileUrlConcept(db);

    const testOwner: ID = "user_delete_non_existent" as ID;
    const nonExistentFileId: ID = "nonExistentFile123" as ID;

    // Requirement Check: `file` exists. This test aims to fail this.
    console.log(
      `Requirement check: Attempting to delete non-existent file ID: '${nonExistentFileId}'`,
    );

    // Action: Call `deleteFile`
    console.log(
      `Action: Calling deleteFile for non-existent file ID: '${nonExistentFileId}', by owner: '${testOwner}'`,
    );
    const deleteResult = await fileUrlConcept.deleteFile({
      file: nonExistentFileId,
      user: testOwner,
    });

    // Assertions: Verify expected error
    assert("error" in deleteResult, "Expected an error result from deleteFile.");
    assertStringIncludes(
      deleteResult.error,
      "File with ID 'nonExistentFile123' not found.",
      `Effect confirmed: Expected 'File not found' error, got: ${deleteResult.error}`,
    );
    console.log(`Effect confirmed: deleteFile returned expected error: ${deleteResult.error}`);

    // Verify database state remains unchanged (no file was there to begin with)
    const fileCount = await fileUrlConcept.files.countDocuments({ _id: nonExistentFileId });
    assertEquals(
      fileCount,
      0,
      "Effect confirmed: No file document with this ID should exist in the database.",
    );

    console.log(
      "--- FileUrlConcept: Scenario 4 test completed successfully ---",
    );
    await client.close();
  },
);

Deno.test(
  "FileUrlConcept: Scenario 5 - `deleteFile` fails for an unauthorized user",
  async () => {
    console.log(
      "--- Starting FileUrlConcept: Scenario 5 (deleteFile unauthorized) test ---",
    );

    const [db, client] = await testDb();
    const fileUrlConcept = new FileUrlConcept(db);

    const rightfulOwner: ID = "owner_a" as ID;
    const unauthorizedUser: ID = "owner_b" as ID;
    const testFilePath = getTestPdfPath();

    // Pre-requisite: Upload a file by the rightful owner
    const uploadResult = await fileUrlConcept.uploadFile({
      filePath: testFilePath,
      owner: rightfulOwner,
    });
    assert("file" in uploadResult, "Pre-requisite upload should be successful.");
    const fileToAttemptDeleteId = uploadResult.file;
    console.log(`Pre-requisite: File uploaded with ID: '${fileToAttemptDeleteId}' by '${rightfulOwner}'`);

    // Requirement Check: `user` is its `owner`. This test aims to fail this.
    console.log(
      `Requirement check: Unauthorized user ('${unauthorizedUser}') attempting to delete file owned by ('${rightfulOwner}').`,
    );

    // Action: Call `deleteFile` with an unauthorized user
    console.log(
      `Action: Calling deleteFile for file ID: '${fileToAttemptDeleteId}', by unauthorized user: '${unauthorizedUser}'`,
    );
    const deleteResult = await fileUrlConcept.deleteFile({
      file: fileToAttemptDeleteId,
      user: unauthorizedUser,
    });

    // Assertions: Verify expected error
    assert("error" in deleteResult, "Expected an error result from deleteFile.");
    assertStringIncludes(
      deleteResult.error,
      "not authorized to delete file",
      `Effect confirmed: Expected 'not authorized' error, got: ${deleteResult.error}`,
    );
    assertNotEquals(
      deleteResult.error,
      "File not found",
      "Error should indicate authorization failure, not file not found.",
    );
    console.log(`Effect confirmed: deleteFile returned expected error: ${deleteResult.error}`);

    // Verify the file still exists in the database
    const postDeleteFile = await fileUrlConcept.files.findOne({
      _id: fileToAttemptDeleteId,
    });
    assertExists(
      postDeleteFile,
      "Effect confirmed: File document should still exist in the database.",
    );
    assertEquals(
      postDeleteFile.owner,
      rightfulOwner,
      "Effect confirmed: File owner should remain unchanged.",
    );

    console.log(
      "--- FileUrlConcept: Scenario 5 test completed successfully ---",
    );
    await client.close();
  },
);
```
