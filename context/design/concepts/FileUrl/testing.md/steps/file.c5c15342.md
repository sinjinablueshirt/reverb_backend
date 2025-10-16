---
timestamp: 'Wed Oct 15 2025 22:51:18 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251015_225118.db81702d.md]]'
content_id: c5c153428bfd04a76874691caaafcf064910d7b490999db2a69d87e2ebe6184a
---

# file: src/concepts/FileUrl/FileUrlConcept.test.ts

```typescript
import { Collection, Db, MongoClient } from "npm:mongodb";
import { assertEquals, assertExists, assertNotEquals } from "jsr:@std/assert";
import { afterAll, beforeAll, beforeEach, describe, it } from "jsr:@std/testing/bdd";
import { stub, Stub } from "jsr:@std/testing/stub";
import { Storage } from "npm:@google-cloud/storage";
import { testDb } from "@utils/database.ts";
import FileUrlConcept from "./FileUrlConcept.ts";
import { ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";
import * as path from "jsr:@std/path"; // For path manipulation and temporary file creation

// --- Global Test Setup ---

// Declare global variables for database, client, concept, and temporary file path
let db: Db;
let client: MongoClient;
let concept: FileUrlConcept;
let tempFilePath: string; // Path to a temporary file created for testing uploads
const mockBucketName = "test-gcs-bucket"; // Mock GCS bucket name

// User IDs for testing, generated using freshID for uniqueness
const owner1: ID = freshID();
const owner2: ID = freshID();

// Mock GCS upload function: This stub will replace the actual GCS upload method
// It's declared globally so its behavior can be controlled and its calls inspected
let uploadMethodStub: Stub<any[], Promise<any>>; // Stub for the Google Cloud Storage upload method

// Define a type for the FileDocument interface, mirroring the concept's internal structure
interface FileDocument {
  _id: ID;
  filePath: string;
  owner: ID;
  url: string;
  gcsObjectName: string;
}

// `beforeAll` hook runs once before all tests in this file
beforeAll(async () => {
  console.log("\n--- Global Test Setup: Start ---");

  // 1. Set the GCS bucket name environment variable.
  // This is necessary because FileUrlConcept reads it during instantiation.
  Deno.env.set("GCS_BUCKET_NAME", mockBucketName);
  console.log(`Environment variable GCS_BUCKET_NAME set to: ${mockBucketName}`);

  // 2. Create a temporary directory and file for testing uploads.
  // This ensures a valid local file path exists for `uploadFile` requirements.
  const tempDir = await Deno.makeTempDir({ prefix: "fileurl_test_" });
  tempFilePath = path.join(tempDir, "temp_test_file.txt");
  await Deno.writeTextFile(tempFilePath, "This is a test file content.");
  console.log(`Temporary test file created at: ${tempFilePath}`);

  // 3. Stub Google Cloud Storage (GCS) interactions.
  // We need to stub `Storage.prototype.bucket` to return an object that contains our `uploadMethodStub`.
  // This ensures that when `new FileUrlConcept(db)` is called, it interacts with our mocks.
  uploadMethodStub = stub(() => Promise.resolve()); // Default behavior: upload succeeds
  stub(Storage.prototype, "bucket", (name: string) => {
    assertEquals(name, mockBucketName, "GCS bucket method should be called with the correct bucket name.");
    return {
      upload: uploadMethodStub, // Return an object with our mocked upload method
    };
  });
  console.log("Google Cloud Storage `bucket().upload()` methods successfully stubbed.");

  console.log("--- Global Test Setup: End ---");
});

// `afterAll` hook runs once after all tests in this file have completed
afterAll(async () => {
  console.log("\n--- Global Test Teardown: Start ---");

  // 1. Restore all stubs. This reverts `Storage.prototype.bucket` to its original implementation.
  uploadMethodStub.restore();
  (Storage.prototype.bucket as any).restore(); // The stub function itself needs to be restored
  console.log("All stubs restored.");

  // 2. Clean up the temporary file and directory created during setup.
  await Deno.remove(path.dirname(tempFilePath), { recursive: true });
  console.log(`Temporary test file and directory removed: ${path.dirname(tempFilePath)}`);

  // 3. Clean up the environment variable.
  Deno.env.delete("GCS_BUCKET_NAME");
  console.log("Environment variable GCS_BUCKET_NAME deleted.");

  // 4. Close the MongoDB client connection.
  await client.close();
  console.log("MongoDB client connection closed.");

  console.log("--- Global Test Teardown: End ---");
});

// `beforeEach` hook runs before each individual test (`it` block)
beforeEach(async () => {
  // 1. Get a fresh test database for each test.
  // This isolates tests from each other's database modifications.
  const [newDb, newClient] = await testDb();
  db = newDb;
  client = newClient;

  // 2. Instantiate the concept with the fresh database.
  // This will use the globally stubbed `Storage` in its constructor.
  concept = new FileUrlConcept(db);

  // 3. Clear all collections to ensure a clean state for each test.
  await db.collection("FileUrl.files").deleteMany({});

  // 4. Reset the `uploadMethodStub` for each test.
  // This clears previous call records and sets its default behavior (successful upload).
  uploadMethodStub.reset(); // Clear call history
  uploadMethodStub.returns(Promise.resolve()); // Set default return value
});

// --- Test Scenarios for `uploadFile` Action ---

describe("FileUrlConcept - uploadFile", () => {
  // Scenario 1: Successful upload (Operational Principle)
  it("should successfully upload a file and record its URL (Operational Principle)", async () => {
    console.log("\n--- Test Case: Successful file upload ---");

    // Action: Call `uploadFile` with valid parameters
    console.log(`  - Attempting to upload file: '${tempFilePath}' by owner: '${owner1}'`);
    const result = await concept.uploadFile({ filePath: tempFilePath, owner: owner1 });

    // Assertions for return value (`effects`)
    assertExists(result.file, "Expected a file ID to be returned upon successful upload.");
    assertEquals(result.error, undefined, "Expected no error for a successful upload.");
    const fileId = result.file;
    console.log(`  - Action successful. New File ID: '${fileId}'`);

    // Effects check: Verify database state
    const filesCollection = db.collection<FileDocument>("FileUrl.files");
    const uploadedFileDoc = await filesCollection.findOne({ _id: fileId });

    assertExists(uploadedFileDoc, "File document should exist in the database after upload.");
    assertEquals(uploadedFileDoc.filePath, tempFilePath, "Stored filePath should match the provided one.");
    assertEquals(uploadedFileDoc.owner, owner1, "Stored owner should match the provided one.");
    assertExists(uploadedFileDoc.url, "A public URL should be generated and stored.");
    assertExists(uploadedFileDoc.gcsObjectName, "A GCS object name should be generated and stored.");
    console.log(`  - Database verification: File document found with URL: ${uploadedFileDoc.url}`);
    console.log(`  - GCS Object Name: ${uploadedFileDoc.gcsObjectName}`);

    // Effects check: Verify GCS interaction (mocked)
    assertEquals(uploadMethodStub.calls.length, 1, "GCS upload method should have been called exactly once.");
    assertEquals(uploadMethodStub.calls[0].args[0], tempFilePath, "GCS upload source path should be the local file path.");
    assertExists(uploadMethodStub.calls[0].args[1].destination, "GCS upload options should include a destination.");
    assertEquals(uploadMethodStub.calls[0].args[1].predefinedAcl, "publicRead", "GCS upload options should set ACL to 'publicRead'.");
    console.log(`  - Mock GCS upload verified with source: '${uploadMethodStub.calls[0].args[0]}' and destination: '${uploadMethodStub.calls[0].args[1].destination}'`);
  });

  // Scenario 2: `filePath` does not point to a valid file (Requirement violation)
  it("should return an error if the local file does not exist", async () => {
    console.log("\n--- Test Case: Non-existent local file ---");
    const nonExistentPath = "/path/to/non_existent_file.txt"; // An invalid local file path
    console.log(`  - Attempting to upload non-existent file: '${nonExistentPath}'`);

    // Action: Call `uploadFile` with an invalid `filePath`
    const result = await concept.uploadFile({
      filePath: nonExistentPath,
      owner: owner1,
    });

    // Assertions for return value (`requires` not met leads to error)
    assertEquals(result.file, undefined, "Expected no file ID to be returned when the local file does not exist.");
    assertExists(result.error, "Expected an error message to be returned.");
    assertEquals(
      result.error,
      `Local file not found at path: '${nonExistentPath}'.`,
      "Error message should clearly indicate that the local file was not found.",
    );
    console.log(`  - Error returned: ${result.error}`);

    // Effects check: Verify GCS interaction (should not be called)
    assertEquals(uploadMethodStub.calls.length, 0, "GCS upload method should not be called if the local file does not exist.");
    console.log("  - Mock GCS upload not called, as expected (pre-condition check failed).");

    // Effects check: Verify database state (no new document)
    const filesCollection = db.collection<FileDocument>("FileUrl.files");
    const count = await filesCollection.countDocuments({});
    assertEquals(count, 0, "No file document should be inserted into the database if requirements are not met.");
    console.log("  - Database verification: No file document inserted.");
  });

  // Scenario 3: `filePath` is already uploaded by the same owner (Requirement violation)
  it("should return an error if the same file is uploaded by the same owner twice", async () => {
    console.log("\n--- Test Case: Duplicate upload by same owner ---");

    // First successful upload (to set up the "already uploaded" condition)
    console.log(`  - First upload of file: '${tempFilePath}' by owner: '${owner1}'`);
    const firstResult = await concept.uploadFile({
      filePath: tempFilePath,
      owner: owner1,
    });
    assertExists(firstResult.file, "First upload by owner1 should be successful.");
    assertEquals(firstResult.error, undefined, "First upload should not return an error.");
    const firstFileId = firstResult.file;
    console.log(`  - First upload successful. File ID: '${firstFileId}'`);

    // Attempt to upload the same file by the same owner again
    console.log(`  - Attempting second upload of same file: '${tempFilePath}' by same owner: '${owner1}'`);
    const secondResult = await concept.uploadFile({
      filePath: tempFilePath,
      owner: owner1,
    });

    // Assertions for return value (`requires` not met leads to error)
    assertEquals(secondResult.file, undefined, "Expected no new file ID for a duplicate upload by the same owner.");
    assertExists(secondResult.error, "Expected an error message for duplicate upload.");
    assertEquals(
      secondResult.error,
      `File '${tempFilePath}' has already been uploaded by owner '${owner1}' (File ID: ${firstFileId}).`,
      "Error message should indicate that the file has already been uploaded by this owner.",
    );
    console.log(`  - Error returned: ${secondResult.error}`);

    // Effects check: Verify GCS interaction (should not be called for the second attempt)
    assertEquals(uploadMethodStub.calls.length, 1, "GCS upload method should only be called once (for the initial upload).");
    console.log("  - Mock GCS upload called only once, as expected (pre-condition check failed on second attempt).");

    // Effects check: Verify database state (only one document)
    const filesCollection = db.collection<FileDocument>("FileUrl.files");
    const count = await filesCollection.countDocuments({});
    assertEquals(count, 1, "Only one file document should exist in the database (the first upload).");
    const doc = await filesCollection.findOne({});
    assertEquals(doc?._id, firstFileId, "The existing document should be the one from the first upload.");
    console.log("  - Database verification: Only one file document found.");
  });

  // Scenario 4: Same `filePath` can be uploaded by different owners (Valid case)
  it("should allow the same local file path to be uploaded by different owners", async () => {
    console.log("\n--- Test Case: Same file uploaded by different owners ---");

    // First upload by owner1
    console.log(`  - Uploading file: '${tempFilePath}' by owner: '${owner1}'`);
    const result1 = await concept.uploadFile({
      filePath: tempFilePath,
      owner: owner1,
    });
    assertExists(result1.file, "Upload by owner1 should be successful.");
    assertEquals(result1.error, undefined, "Owner1 upload should not return an error.");
    const fileId1 = result1.file;
    console.log(`  - Owner1 upload successful. File ID: '${fileId1}'`);

    // Second upload by owner2 using the *same* `filePath`
    console.log(`  - Uploading file: '${tempFilePath}' by different owner: '${owner2}'`);
    const result2 = await concept.uploadFile({
      filePath: tempFilePath,
      owner: owner2,
    });
    assertExists(result2.file, "Upload by owner2 should be successful.");
    assertEquals(result2.error, undefined, "Owner2 upload should not return an error.");
    const fileId2 = result2.file;
    console.log(`  - Owner2 upload successful. File ID: '${fileId2}'`);

    // Assert that two different files were created (distinct IDs)
    assertExists(fileId1, "First file ID should exist.");
    assertExists(fileId2, "Second file ID should exist.");
    assertNotEquals(fileId1, fileId2, "File IDs for uploads by different owners should be distinct.");

    // Effects check: Verify GCS interaction (should be called twice, once for each owner)
    assertEquals(uploadMethodStub.calls.length, 2, "GCS upload method should be called twice.");
    assertEquals(uploadMethodStub.calls[0].args[0], tempFilePath, "First GCS upload source path should be correct.");
    assertEquals(uploadMethodStub.calls[1].args[0], tempFilePath, "Second GCS upload source path should be correct.");
    // Verify GCS object names are distinct, ensuring unique storage
    assertNotEquals(uploadMethodStub.calls[0].args[1].destination, uploadMethodStub.calls[1].args[1].destination, "GCS destinations should be different for different file records.");
    console.log("  - Mock GCS upload called twice with different destinations, as expected.");

    // Effects check: Verify database state (two distinct documents)
    const filesCollection = db.collection<FileDocument>("FileUrl.files");
    const count = await filesCollection.countDocuments({});
    assertEquals(count, 2, "Two distinct file documents should exist in the database.");

    const doc1 = await filesCollection.findOne({ _id: fileId1 });
    assertExists(doc1, "Document for fileId1 should exist.");
    assertEquals(doc1.owner, owner1, "Document 1's owner should be owner1.");

    const doc2 = await filesCollection.findOne({ _id: fileId2 });
    assertExists(doc2, "Document for fileId2 should exist.");
    assertEquals(doc2.owner, owner2, "Document 2's owner should be owner2.");
    console.log("  - Database verification: Two distinct file documents found for different owners.");
  });

  // Scenario 5: GCS upload failure (Error handling)
  it("should return an error if Google Cloud Storage upload fails", async () => {
    console.log("\n--- Test Case: Google Cloud Storage upload failure ---");

    // Configure the upload stub to simulate a GCS failure (e.g., network error, permissions)
    uploadMethodStub.returns(Promise.reject(new Error("GCS network error or permissions issue")));
    console.log("  - Mock GCS upload configured to simulate a failure.");

    // Action: Call `uploadFile`
    console.log(`  - Attempting to upload file: '${tempFilePath}' with simulated GCS error`);
    const result = await concept.uploadFile({ filePath: tempFilePath, owner: owner1 });

    // Assertions for return value (error propagated from GCS)
    assertEquals(result.file, undefined, "Expected no file ID to be returned on GCS failure.");
    assertExists(result.error, "Expected an error message on GCS failure.");
    assertEquals(
      result.error,
      "Failed to upload file to Google Cloud Storage: Error: GCS network error or permissions issue.",
      "Error message should clearly reflect the GCS upload failure.",
    );
    console.log(`  - Error returned: ${result.error}`);

    // Effects check: Verify GCS interaction (should still be called once)
    assertEquals(uploadMethodStub.calls.length, 1, "GCS upload method should be called once, even if it fails.");
    console.log("  - Mock GCS upload was called and failed, as expected.");

    // Effects check: Verify database state (no new document - atomicity)
    const filesCollection = db.collection<FileDocument>("FileUrl.files");
    const count = await filesCollection.countDocuments({});
    assertEquals(count, 0, "No file document should be inserted if the GCS upload fails (ensuring atomicity).");
    console.log("  - Database verification: No file document inserted (roll back/never committed).");
  });
});

```
