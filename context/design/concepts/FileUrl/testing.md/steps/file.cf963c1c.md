---
timestamp: 'Wed Oct 15 2025 22:17:30 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251015_221730.63538ee3.md]]'
content_id: cf963c1ca8efc4f69b457a4375a68708b315f91aa1f84548f04a9ae3fa8dfe99
---

# file: src/concepts/FileUrl/FileUrlConcept.test.ts

```typescript
import { assertEquals, assertObjectMatch, assertRejects, assertStringIncludes } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import FileUrlConcept from "./FileUrlConcept.ts"; // Assuming the FileUrlConcept is modified for testability
import { Db } from "npm:mongodb";
import { ID } from "@utils/types.ts";

// --- Mocks for Google Cloud Storage ---
// These mocks simulate the GCS API interactions without making actual network calls.

interface MockGCSFileInterface {
  storageKey: string;
  getSignedUrl(options: { version: string; action: string; expires: number; contentType?: string }): Promise<[string]>;
  delete(): Promise<void>;
}

class MockGCSFile implements MockGCSFileInterface {
  constructor(public storageKey: string) {}

  async getSignedUrl(options: {
    version: string;
    action: string;
    expires: number;
    contentType?: string;
  }): Promise<[string]> {
    // console.log(`MockGCSFile: getSignedUrl for ${this.storageKey}, action: ${options.action}`);
    if (options.action === "write") {
      return Promise.resolve([`https://mock-upload.storage.googleapis.com/${this.storageKey}?signature=mock_upload_sig`]);
    } else if (options.action === "read") {
      return Promise.resolve([`https://mock-download.storage.googleapis.com/${this.storageKey}?signature=mock_download_sig`]);
    }
    throw new Error("Unsupported action for signed URL mock");
  }

  async delete(): Promise<void> {
    // console.log(`MockGCSFile: Deleting file ${this.storageKey}`);
    return Promise.resolve();
  }
}

interface MockGCSBucketInterface {
  name: string;
  file(storageKey: string): MockGCSFile;
}

class MockGCSBucket implements MockGCSBucketInterface {
  constructor(public name: string) {}
  file(storageKey: string): MockGCSFile {
    // console.log(`MockGCSBucket: creating file reference for ${storageKey}`);
    return new MockGCSFile(storageKey);
  }
}

interface MockGCSStorageInterface {
  bucket(name: string): MockGCSBucket;
}

class MockGCSStorage implements MockGCSStorageInterface {
  bucket(name: string): MockGCSBucket {
    // console.log(`MockGCSStorage: getting bucket ${name}`);
    return new MockGCSBucket(name);
  }
}

// --- Test Setup ---

// Define types for the internal FileDocument for assertions
interface FileDocument {
  _id: ID;
  owner: ID;
  fileName: string;
  storageKey: string;
  mimeType: string;
  fileSize: number;
  uploaded: boolean;
}

// Global variables for convenience in tests
let db: Db;
let client: Deno.Kv | any; // Use any for client to avoid specific Deno.Kv or MongoClient typing here
let concept: FileUrlConcept;
const TEST_USER_ID: ID = "user123" as ID;
const TEST_BUCKET_NAME = "test-gcs-bucket";

Deno.test("FileUrlConcept", async (t) => {
  Deno.test.beforeEach(async () => {
    [db, client] = await testDb();
    // Temporarily set the GCS_BUCKET_NAME for successful constructor execution
    Deno.env.set("GCS_BUCKET_NAME", TEST_BUCKET_NAME);
    // Initialize the concept with a mock storage instance
    concept = new FileUrlConcept(db, new MockGCSStorage());
    console.log("--- Test Setup Complete ---");
  });

  Deno.test.afterEach(async () => {
    // Clean up environment variables
    Deno.env.delete("GCS_BUCKET_NAME");
    if (client && typeof client.close === "function") {
      await client.close();
    }
    console.log("--- Test Teardown Complete ---");
  });

  await t.step({
    name: "Scenario 1: Operational Principle - Initiate Upload (Happy Path)",
    fn: async () => {
      console.log("\n# trace: User initiates a file upload.");
      const fileName = "my_document.pdf";
      const mimeType = "application/pdf";
      const fileSize = 1024 * 500; // 500 KB

      console.log(`Action: initiateFileUpload(fileName: "${fileName}", owner: "${TEST_USER_ID}", mimeType: "${mimeType}", fileSize: ${fileSize})`);
      const result = await concept.initiateFileUpload({ fileName, owner: TEST_USER_ID, mimeType, fileSize });

      console.log("Confirmation: Action returned successfully.");
      assertEquals(typeof result, "object", "Result should be an object");
      assertObjectMatch(result as object, { file: (v: string) => typeof v === "string", uploadUrl: (v: string) => v.startsWith("https://mock-upload") });

      const { file: fileId, uploadUrl } = result as { file: ID; uploadUrl: string };
      console.log(`Effect: New file ID: ${fileId}, Upload URL: ${uploadUrl}`);

      console.log("Confirmation: Verify file metadata in database.");
      const fileInDb = await concept.files.findOne({ _id: fileId }) as FileDocument;

      assertEquals(fileInDb?._id, fileId, "File ID in DB should match returned ID");
      assertEquals(fileInDb?.owner, TEST_USER_ID, "Owner should be correctly assigned");
      assertEquals(fileInDb?.fileName, fileName, "File name should be correctly assigned");
      assertStringIncludes(fileInDb?.storageKey, `uploads/${fileId}/${fileName}`, "Storage key should include file ID and name");
      assertEquals(fileInDb?.mimeType, mimeType, "MIME type should be correctly assigned");
      assertEquals(fileInDb?.fileSize, fileSize, "File size should be correctly assigned");
      assertEquals(fileInDb?.uploaded, false, "Uploaded status should be 'false' initially");

      assertStringIncludes(uploadUrl, fileInDb?.storageKey, "Upload URL should contain the storage key");
      console.log("Confirmation: All effects of initiateFileUpload confirmed.");
    },
    // Only includes actions currently implemented. The full principle would involve confirmFileUpload and getDownloadUrl.
    // This scenario demonstrates the first step of the principle: initiating upload and getting a URL.
  });

  await t.step("Scenario 2: Invalid Inputs for initiateFileUpload", async () => {
    console.log("\n# trace: User attempts to initiate upload with various invalid inputs.");

    // Test case: Empty file name
    console.log("Action: initiateFileUpload with empty fileName");
    const result1 = await concept.initiateFileUpload({ fileName: "", owner: TEST_USER_ID, mimeType: "image/png", fileSize: 100 });
    assertObjectMatch(result1 as object, { error: "File name cannot be empty." });
    console.log(`Effect: ${result1.error} (expected)`);

    // Test case: Empty owner
    console.log("Action: initiateFileUpload with empty owner");
    const result2 = await concept.initiateFileUpload({ fileName: "valid.txt", owner: "" as ID, mimeType: "text/plain", fileSize: 100 });
    assertObjectMatch(result2 as object, { error: "Owner ID cannot be empty." });
    console.log(`Effect: ${result2.error} (expected)`);

    // Test case: Empty mime type
    console.log("Action: initiateFileUpload with empty mimeType");
    const result3 = await concept.initiateFileUpload({ fileName: "valid.txt", owner: TEST_USER_ID, mimeType: "", fileSize: 100 });
    assertObjectMatch(result3 as object, { error: "MIME type cannot be empty." });
    console.log(`Effect: ${result3.error} (expected)`);

    // Test case: Zero file size
    console.log("Action: initiateFileUpload with zero fileSize");
    const result4 = await concept.initiateFileUpload({ fileName: "valid.txt", owner: TEST_USER_ID, mimeType: "text/plain", fileSize: 0 });
    assertObjectMatch(result4 as object, { error: "File size must be positive." });
    console.log(`Effect: ${result4.error} (expected)`);

    // Test case: Negative file size
    console.log("Action: initiateFileUpload with negative fileSize");
    const result5 = await concept.initiateFileUpload({ fileName: "valid.txt", owner: TEST_USER_ID, mimeType: "text/plain", fileSize: -50 });
    assertObjectMatch(result5 as object, { error: "File size must be positive." });
    console.log(`Effect: ${result5.error} (expected)`);

    console.log("Confirmation: No files should have been created for invalid inputs.");
    const count = await concept.files.countDocuments();
    assertEquals(count, 0, "No file documents should be present in the DB");
  });

  await t.step("Scenario 3: Missing GCS Bucket Configuration", async () => {
    console.log("\n# trace: User attempts to initiate upload when GCS_BUCKET_NAME is unset.");
    Deno.env.delete("GCS_BUCKET_NAME"); // Unset the variable to simulate missing config

    console.log("Action: initiateFileUpload with GCS_BUCKET_NAME unset");
    const result = await concept.initiateFileUpload({
      fileName: "config_test.jpg",
      owner: TEST_USER_ID,
      mimeType: "image/jpeg",
      fileSize: 1000,
    });

    assertObjectMatch(result as object, { error: "Google Cloud Storage bucket name is not configured." });
    console.log(`Effect: ${result.error} (expected)`);

    console.log("Confirmation: No file should be created in the database.");
    const count = await concept.files.countDocuments();
    assertEquals(count, 0, "No file documents should be present in the DB");
  });

  await t.step("Scenario 4: Repeat Initiate File Upload (same arguments, different outcomes)", async () => {
    console.log("\n# trace: A user tries to upload seemingly the 'same' file twice.");
    const fileName = "report.docx";
    const mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    const fileSize = 1024 * 1024 * 2; // 2 MB

    // First initiation
    console.log("Action: initiateFileUpload (first time)");
    const result1 = await concept.initiateFileUpload({ fileName, owner: TEST_USER_ID, mimeType, fileSize });
    assertEquals(typeof result1, "object");
    assertObjectMatch(result1 as object, { file: (v: string) => typeof v === "string", uploadUrl: (v: string) => v.startsWith("https://mock-upload") });
    const { file: fileId1, uploadUrl: uploadUrl1 } = result1 as { file: ID; uploadUrl: string };
    console.log(`Effect: First file created with ID: ${fileId1}, Upload URL: ${uploadUrl1}`);

    // Second initiation with identical logical arguments
    console.log("Action: initiateFileUpload (second time, same inputs)");
    const result2 = await concept.initiateFileUpload({ fileName, owner: TEST_USER_ID, mimeType, fileSize });
    assertEquals(typeof result2, "object");
    assertObjectMatch(result2 as object, { file: (v: string) => typeof v === "string", uploadUrl: (v: string) => v.startsWith("https://mock-upload") });
    const { file: fileId2, uploadUrl: uploadUrl2 } = result2 as { file: ID; uploadUrl: string };
    console.log(`Effect: Second file created with ID: ${fileId2}, Upload URL: ${uploadUrl2}`);

    console.log("Confirmation: Two distinct files should have been created.");
    assertEquals(await concept.files.countDocuments(), 2, "There should be two file documents in the DB");
    assertObjectMatch(await concept.files.findOne({ _id: fileId1 }) as object, { _id: fileId1, uploaded: false });
    assertObjectMatch(await concept.files.findOne({ _id: fileId2 }) as object, { _id: fileId2, uploaded: false });

    assertEquals(fileId1 !== fileId2, true, "File IDs should be unique for each initiation");
    assertEquals(uploadUrl1 !== uploadUrl2, true, "Upload URLs should be unique for each initiation due to unique storage keys");
    assertStringIncludes(uploadUrl1, fileId1, "First URL contains first ID");
    assertStringIncludes(uploadUrl2, fileId2, "Second URL contains second ID");

    console.log("Confirmation: Repetitive initiation creates distinct new file entities and URLs.");
  });
});

```
