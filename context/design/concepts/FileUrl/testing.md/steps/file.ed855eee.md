---
timestamp: 'Thu Oct 16 2025 10:14:00 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_101400.36b99aeb.md]]'
content_id: ed855eeef03c3c905052c49e24ce2de56e4373770120c8b0920029cf9facabc7
---

# file: src/concepts/FileUrl/FileUrlConcept.test.ts

```typescript
import { testDb } from "@utils/database.ts";
import { assert, assertEquals, assertStringIncludes } from "jsr:@std/assert";
import FileUrlConcept from "./FileUrlConcept.ts";
import { ID } from "@utils/types.ts";
import { dirname, fromFileUrl, join } from "jsr:@std/path";

Deno.test("FileUrlConcept: uploadFile successfully uploads a PDF", async () => {
  console.log("--- Starting FileUrlConcept: uploadFile success test ---");

  // 1. Setup: Initialize database and the concept
  const [db, client] = await testDb();
  const fileUrlConcept = new FileUrlConcept(db);

  // Define test data
  const testOwner: ID = "user123" as ID;

  // Construct the path to the test PDF file dynamically
  const currentDir = dirname(fromFileUrl(import.meta.url));
  const testFilePath = join(currentDir, "../../../media/test.pdf");
  const originalFileName = "test.pdf"; // Expected file name from the path

  // --- Pre-flight Checks (Requirements before action) ---
  // Ensure the GCS_BUCKET_NAME environment variable is set for the concept to initialize and function.
  const bucketName = Deno.env.get("GCS_BUCKET_NAME");
  if (!bucketName) {
    console.error(
      "ERROR: GCS_BUCKET_NAME environment variable not set. Please configure it for the test to run. Skipping GCS-related assertions.",
    );
    // Even though the concept throws, for a test, we might log and then re-throw or mark as failed.
    // The concept's constructor already handles this by throwing, so this check acts as an early warning.
  } else {
    console.log(`Using GCS Bucket: ${bucketName}`);
  }

  // Verify the local test PDF file exists as required by `uploadFile`.
  console.log(`Checking for local file: '${testFilePath}'`);
  try {
    await Deno.stat(testFilePath);
    console.log("Local test PDF file found.");
  } catch (e) {
    console.error(
      `ERROR: Local test file not found at '${testFilePath}'. Please ensure 'media/test.pdf' exists in the project root relative to the test runner.`,
    );
    await client.close();
    throw e; // Fail the test if the required file isn't present.
  }
  // No other explicit 'requires' to pre-check for a simple successful upload.
  // The concept itself checks if the file is already uploaded by the owner internally.

  // 2. Action: Call `uploadFile`
  console.log(
    `Attempting to upload file: '${testFilePath}' for owner: '${testOwner}'`,
  );
  const uploadResult = await fileUrlConcept.uploadFile({
    filePath: testFilePath,
    owner: testOwner,
  });

  // 3. Assertions: Verify the effects of the action
  // Check that the upload operation returned a successful result (no 'error' key)
  assert(uploadResult, "uploadFile should return a result object.");
  if ("error" in uploadResult) {
    console.error(`uploadFile returned an error: ${uploadResult.error}`);
  }
  assertEquals(
    "error" in uploadResult,
    false,
    `uploadFile returned an unexpected error: ${uploadResult}`,
  );
  assert("file" in uploadResult, "uploadFile should return a 'file' ID.");

  const uploadedFileId = uploadResult.file;
  console.log(
    `uploadFile successfully returned new file ID: '${uploadedFileId}'`,
  );

  // Verify that the file record was saved in the MongoDB collection
  const savedFileDocument = await fileUrlConcept.files.findOne({
    _id: uploadedFileId,
  });

  assert(
    savedFileDocument,
    `File document with ID '${uploadedFileId}' should be found in the database.`,
  );
  console.log("Retrieved saved file document:", savedFileDocument);

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
  assert(savedFileDocument.url, "Saved document should have a non-empty URL.");
  assert(
    savedFileDocument.gcsObjectName,
    "Saved document should have a non-empty GCS object name.",
  );

  // Verify the URL and GCS object name structure (as per concept's GCS naming convention)
  if (bucketName) { // Only assert GCS structure if bucket name was available
    assertStringIncludes(
      savedFileDocument.url,
      `https://storage.googleapis.com/${bucketName}/`,
      "URL should start with the Google Cloud Storage base path for the bucket.",
    );
    assertStringIncludes(
      savedFileDocument.url,
      savedFileDocument.gcsObjectName,
      "URL should contain the GCS object name.",
    );

    const expectedGcsObjectNamePart =
      `files/${testOwner}/${uploadedFileId}/${originalFileName}`;
    assertStringIncludes(
      savedFileDocument.gcsObjectName,
      expectedGcsObjectNamePart,
      `GCS object name should follow the pattern 'files/<owner_id>/<file_record_id>/<original_filename>'. Expected part: ${expectedGcsObjectNamePart}`,
    );
  } else {
    console.warn(
      "Skipping GCS URL and object name assertions due to missing GCS_BUCKET_NAME.",
    );
  }

  console.log(
    "--- FileUrlConcept: uploadFile success test completed successfully ---",
  );

  // 4. Cleanup: Close the database client
  await client.close();
});

```
