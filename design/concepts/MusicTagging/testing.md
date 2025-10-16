[@specification](specification.md)

[@implementation](../../../src/concepts/MusicTagging/MusicTaggingConcept.ts)

[@testing-concepts](../../background/testing-concepts.md)

[@current-test-file](../../../src/concepts/MusicTagging/MusicTaggingConcept.test.ts)

[@gemini-llm](../../../src/utils/gemini-llm.ts)

<!-- # prompt: You are given an existing test suite for the MusicTagging concept. You should augment the tests so that some of them test the behavior of the suggestTags method. Be sure to make tests that follow the operational principle of the concept specification. Tests should use a sequence of action executions that corresponds to the operational principle, representing the common expected usage of the concept. These sequence is not required to use all the actions; operational principles often do not include a deletion action, for example. Test sequences of action executions that correspond to less common cases: probing interesting corners of the functionality, undoing actions with deletions and cancellations, repeating actions with the same arguments, etc. In some of these scenarios actions may be expected to throw errors. You should have one test sequence for the operational principle, and 3-5 additional interesting scenarios. Every action should be executed successfully in at least one of the scenarios. DO NOT create any more tests than the ones that already exist. Only add a few suggestTags calls in the tests. Use the gemini LLM util that is imported. DO NOT try to make your own LLM. -->

# prompt: add console.logs that display helpful messages to the console with action inputs and outputs so that a human reader can make sense of the test execution when it runs in the console. add green checkmark when tests pass. use a red X only when a test fails. don't change anything else about the current test file

# response:

```typescript
import { assertEquals } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import MusicTaggingConcept from "./MusicTaggingConcept.ts";
import { ID } from "@utils/types.ts";
import { GeminiLLM } from "@utils/gemini-llm.ts";

// Helper function to get a fresh concept instance for each test
async function setupConcept() {
  const [db, client] = await testDb();
  const concept = new MusicTaggingConcept(db);
  return { concept, db, client };
}

/**
 * Load configuration from .env
 */
function loadLLM(): GeminiLLM {
  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not found in environment variables.");
    }
    return new GeminiLLM(apiKey);
  } catch (error) {
    console.error(
      "❌ Error loading .env. Please ensure GEMINI_API_KEY is set.",
    );
    console.error("Error details:", (error as Error).message);
    Deno.exit(1);
  }
}

Deno.test("MusicTaggingConcept", async (test) => {
  // # trace: Principle: Register resource, add tags, remove tags, and search (implicitly)
  await test.step(
    "Principle: Register resource, add tags, remove tags, and verify state",
    async () => {
      console.log(
        "\n--- Principle Test: Register, Add, Remove, Suggest Tags ---",
      );
      const { concept, db, client } = await setupConcept();

      // 1. Register a resource
      const resourceId1 = "resource_abc" as ID;
      const description1 = "A powerful orchestral piece with heavy brass.";
      console.log(
        `💡 Calling registerResource with resource: ${resourceId1}, description: "${description1}"`,
      );
      const registerResult = await concept.registerResource({
        resource: resourceId1,
        description: description1,
      });

      if ("registry" in registerResult) {
        const registryId1 = (registerResult as { registry: ID }).registry;
        console.log(`✅ registerResource successful. New registry ID: ${registryId1}`);
        let fetchedRegistry = await concept.registries.findOne({
          _id: registryId1,
        });
        assertEquals(fetchedRegistry?.resource, resourceId1);
        assertEquals(fetchedRegistry?.description, description1);
        assertEquals(fetchedRegistry?.tags, []);
        console.log(`✅ Registry state after registration: ${JSON.stringify(fetchedRegistry)}`);

        // 2. Add a few tags
        const tag1 = "orchestral";
        const tag2 = "epic";
        const tag3 = "brass";

        console.log(`💡 Calling addTag for registry ${registryId1} with tag: "${tag1}"`);
        const addResult1 = await concept.addTag({ registry: registryId1, tag: tag1 });
        assertEquals(addResult1, {});
        console.log(`✅ addTag successful for "${tag1}".`);

        console.log(`💡 Calling addTag for registry ${registryId1} with tag: "${tag2}"`);
        const addResult2 = await concept.addTag({ registry: registryId1, tag: tag2 });
        assertEquals(addResult2, {});
        console.log(`✅ addTag successful for "${tag2}".`);

        console.log(`💡 Calling addTag for registry ${registryId1} with tag: "${tag3}"`);
        const addResult3 = await concept.addTag({ registry: registryId1, tag: tag3 });
        assertEquals(addResult3, {});
        console.log(`✅ addTag successful for "${tag3}".`);

        fetchedRegistry = await concept.registries.findOne({
          _id: registryId1,
        });
        assertEquals(fetchedRegistry?.tags.sort(), [tag1, tag2, tag3].sort());
        console.log(`✅ Registry tags after adding: ${JSON.stringify(fetchedRegistry?.tags)}`);

        // 3. Remove one of the tags
        console.log(`💡 Calling removeTag for registry ${registryId1} with tag: "${tag2}"`);
        const removeResult = await concept.removeTag({ registry: registryId1, tag: tag2 });
        assertEquals(removeResult, {});
        console.log(`✅ removeTag successful for "${tag2}".`);

        fetchedRegistry = await concept.registries.findOne({
          _id: registryId1,
        });
        assertEquals(fetchedRegistry?.tags.sort(), [tag1, tag3].sort());
        console.log(`✅ Registry tags after removing: ${JSON.stringify(fetchedRegistry?.tags)}`);

        // Implicit search/retrieval verification is done by fetching the registry
        // and asserting its contents, as there is no explicit search method defined.
        assertEquals(fetchedRegistry?.tags.includes(tag1), true);
        assertEquals(fetchedRegistry?.tags.includes(tag2), false);
        assertEquals(fetchedRegistry?.tags.includes(tag3), true);
        console.log(`✅ Tags verification: "${tag1}" present, "${tag2}" absent, "${tag3}" present.`);

        // 4. add suggestTags call to verify it works in the principle test
        const llm = loadLLM();
        console.log(`💡 Calling suggestTags for registry ${registryId1}`);
        const suggestResult = await concept.suggestTags({
          registry: registryId1,
          llm: llm,
        });
        if ("error" in suggestResult) {
          console.log(`❌ suggestTags failed: ${suggestResult.error}`);
        } else {
          console.log(`✅ suggestTags successful.`);
        }
        assertEquals(
          "error" in suggestResult,
          false,
          "suggestTags should succeed",
        );

        // Fetch again because suggestTags should have added tags
        fetchedRegistry = await concept.registries.findOne({
          _id: registryId1,
        });
        if (fetchedRegistry === null) {
          throw new Error("Registry should exist after suggestTags");
        }
        console.log("Tags after suggestTags:", fetchedRegistry?.tags);
        assertEquals(
          fetchedRegistry.tags.length > 2,
          true,
          "There should be at more than 2 tags after suggestTags",
        );
        console.log(`✅ Total tags after suggestTags: ${fetchedRegistry.tags.length}`);
      } else {
        console.log(`❌ registerResource failed: ${registerResult.error}`);
        throw new Error("Initial resource registration failed.");
      }
      await client.close();
      console.log("--- End of Principle Test ---");
    },
  );

  // # trace: Scenario 1: Error handling for duplicate resource registration
  await test.step(
    "Scenario 1: registerResource fails on duplicate resource",
    async () => {
      console.log(
        "\n--- Scenario 1: Duplicate Resource Registration ---",
      );
      const { concept, client } = await setupConcept();

      const resourceId = "res_duplicate" as ID;
      const description = "Some description.";

      // First registration should succeed
      console.log(
        `💡 Calling registerResource (1st attempt) with resource: ${resourceId}`,
      );
      const registerResult1 = await concept.registerResource({
        resource: resourceId,
        description: description,
      });
      if ("registry" in registerResult1) {
        console.log(`✅ registerResource (1st attempt) successful. ID: ${registerResult1.registry}`);
      } else {
        console.log(`❌ registerResource (1st attempt) failed: ${registerResult1.error}`);
        throw new Error("Expected first registration to succeed.");
      }
      assertEquals("registry" in registerResult1, true);

      // Second registration of the same resource should fail
      console.log(
        `💡 Calling registerResource (2nd attempt) with resource: ${resourceId}`,
      );
      const registerResult2 = await concept.registerResource({
        resource: resourceId,
        description: "Another description for the same resource.",
      });
      if ("error" in registerResult2) {
        console.log(`✅ registerResource (2nd attempt) failed as expected: ${registerResult2.error}`);
      } else {
        console.log(`❌ registerResource (2nd attempt) unexpectedly succeeded.`);
      }
      assertEquals(
        "error" in registerResult2,
        true,
        "Should return an error for duplicate resource",
      );
      assertEquals(
        (registerResult2 as { error: string }).error,
        `Resource ${resourceId} is already registered.`,
      );

      await client.close();
      console.log("--- End of Scenario 1 ---");
    },
  );

  // # trace: Scenario 2: Error handling for addTag (duplicate tag, non-existent registry)
  await test.step(
    "Scenario 2: addTag fails on duplicate tag or non-existent registry",
    async () => {
      console.log(
        "\n--- Scenario 2: addTag Error Handling ---",
      );
      const { concept, client } = await setupConcept();

      const resourceId = "res_addtag_errors" as ID;
      const description = "league of legends"; // Description for a non-music related topic to test suggestTags
      console.log(
        `💡 Calling registerResource with resource: ${resourceId}, description: "${description}"`,
      );
      const registerResult = await concept.registerResource({
        resource: resourceId,
        description: description,
      });
      if (!("registry" in registerResult)) {
        console.log(`❌ registerResource failed: ${registerResult.error}`);
        throw new Error("Failed to register resource for addTag errors test.");
      }
      const registryId = (registerResult as { registry: ID }).registry;
      console.log(`✅ registerResource successful. ID: ${registryId}`);

      const tag = "genre_pop";
      const nonExistentRegistryId = "non_existent_registry" as ID;

      // 1. use suggestTags to try add a tag first (expecting 0 tags for "league of legends")
      const llm = loadLLM();
      console.log(`💡 Calling suggestTags for registry ${registryId} (description: "league of legends")`);
      const suggestResult = await concept.suggestTags({
        registry: registryId,
        llm: llm,
      });
      if ("error" in suggestResult) {
        console.log(`✅ suggestTags failed as expected: ${suggestResult.error}`);
      } else {
        console.log(`❌ suggestTags unexpectedly succeeded.`);
      }
      assertEquals(
        "error" in suggestResult,
        true,
        "suggestTags should not suggest any tags for this description",
      );

      // 2. Add tag successfully
      console.log(`💡 Calling addTag for registry ${registryId} with tag: "${tag}"`);
      const addResult1 = await concept.addTag({ registry: registryId, tag });
      assertEquals(addResult1, {});
      console.log(`✅ addTag successful for "${tag}".`);

      let fetchedRegistry = await concept.registries.findOne({
        _id: registryId,
      });
      assertEquals(fetchedRegistry?.tags, [tag]);
      console.log(`✅ Registry tags after adding: ${JSON.stringify(fetchedRegistry?.tags)}`);

      // 3. Attempt to add the same tag again (should fail)
      console.log(`💡 Calling addTag (duplicate attempt) for registry ${registryId} with tag: "${tag}"`);
      const addResult2 = await concept.addTag({ registry: registryId, tag });
      if ("error" in addResult2) {
        console.log(`✅ addTag failed as expected: ${addResult2.error}`);
      } else {
        console.log(`❌ addTag (duplicate attempt) unexpectedly succeeded.`);
      }
      assertEquals(
        "error" in addResult2,
        true,
        "Should return an error for duplicate tag",
      );
      assertEquals(
        (addResult2 as { error: string }).error,
        `Tag "${tag}" already exists for registry ${registryId}.`,
      );

      // Tags should remain unchanged
      fetchedRegistry = await concept.registries.findOne({
        _id: registryId,
      });
      assertEquals(fetchedRegistry?.tags, [tag]);
      console.log(`✅ Registry tags unchanged after failed duplicate add: ${JSON.stringify(fetchedRegistry?.tags)}`);

      // 4. Attempt to add a tag to a non-existent registry (should fail)
      console.log(`💡 Calling addTag for non-existent registry ${nonExistentRegistryId} with tag: "new_tag"`);
      const addResult3 = await concept.addTag({
        registry: nonExistentRegistryId,
        tag: "new_tag",
      });
      if ("error" in addResult3) {
        console.log(`✅ addTag failed as expected: ${addResult3.error}`);
      } else {
        console.log(`❌ addTag for non-existent registry unexpectedly succeeded.`);
      }
      assertEquals(
        "error" in addResult3,
        true,
        "Should return an error for non-existent registry",
      );
      assertEquals(
        (addResult3 as { error: string }).error,
        `Registry ${nonExistentRegistryId} not found.`,
      );

      await client.close();
      console.log("--- End of Scenario 2 ---");
    },
  );

  // # trace: Scenario 3: Error handling for removeTag (non-existent tag, non-existent registry)
  await test.step(
    "Scenario 3: removeTag fails on non-existent tag or non-existent registry",
    async () => {
      console.log(
        "\n--- Scenario 3: removeTag Error Handling ---",
      );
      const { concept, client } = await setupConcept();

      const resourceId = "res_removetag_errors" as ID;
      const description = "A test resource for removeTag errors.";
      console.log(
        `💡 Calling registerResource with resource: ${resourceId}, description: "${description}"`,
      );
      const registerResult = await concept.registerResource({
        resource: resourceId,
        description: description,
      });
      if (!("registry" in registerResult)) {
        console.log(`❌ registerResource failed: ${registerResult.error}`);
        throw new Error("Failed to register resource for removeTag errors test.");
      }
      const registryId = (registerResult as { registry: ID }).registry;
      console.log(`✅ registerResource successful. ID: ${registryId}`);

      const existingTag = "upbeat";
      const nonExistentTag = "sad";
      const nonExistentRegistryId = "non_existent_registry_remove" as ID;

      // Add the existingTag
      console.log(`💡 Calling addTag for registry ${registryId} with tag: "${existingTag}"`);
      await concept.addTag({ registry: registryId, tag: existingTag });
      let fetchedRegistry = await concept.registries.findOne({
        _id: registryId,
      });
      assertEquals(fetchedRegistry?.tags, [existingTag]);
      console.log(`✅ Registry tags after adding: ${JSON.stringify(fetchedRegistry?.tags)}`);

      // 1. Attempt to remove a tag that does not exist (should fail)
      console.log(`💡 Calling removeTag for registry ${registryId} with non-existent tag: "${nonExistentTag}"`);
      const removeResult1 = await concept.removeTag({
        registry: registryId,
        tag: nonExistentTag,
      });
      if ("error" in removeResult1) {
        console.log(`✅ removeTag failed as expected: ${removeResult1.error}`);
      } else {
        console.log(`❌ removeTag for non-existent tag unexpectedly succeeded.`);
      }
      assertEquals(
        "error" in removeResult1,
        true,
        "Should return an error for non-existent tag",
      );
      assertEquals(
        (removeResult1 as { error: string }).error,
        `Tag "${nonExistentTag}" not found for registry ${registryId}.`,
      );

      // Tags should remain unchanged
      fetchedRegistry = await concept.registries.findOne({
        _id: registryId,
      });
      assertEquals(fetchedRegistry?.tags, [existingTag]);
      console.log(`✅ Registry tags unchanged after failed remove: ${JSON.stringify(fetchedRegistry?.tags)}`);

      // 2. Attempt to remove a tag from a non-existent registry (should fail)
      console.log(`💡 Calling removeTag for non-existent registry ${nonExistentRegistryId} with tag: "${existingTag}"`);
      const removeResult2 = await concept.removeTag({
        registry: nonExistentRegistryId,
        tag: existingTag,
      });
      if ("error" in removeResult2) {
        console.log(`✅ removeTag failed as expected: ${removeResult2.error}`);
      } else {
        console.log(`❌ removeTag for non-existent registry unexpectedly succeeded.`);
      }
      assertEquals(
        "error" in removeResult2,
        true,
        "Should return an error for non-existent registry",
      );
      assertEquals(
        (removeResult2 as { error: string }).error,
        `Registry ${nonExistentRegistryId} not found.`,
      );

      // 3. Successfully remove the existing tag
      console.log(`💡 Calling removeTag for registry ${registryId} with existing tag: "${existingTag}"`);
      const removeResult3 = await concept.removeTag({
        registry: registryId,
        tag: existingTag,
      });
      assertEquals(removeResult3, {});
      console.log(`✅ removeTag successful for "${existingTag}".`);

      fetchedRegistry = await concept.registries.findOne({
        _id: registryId,
      });
      assertEquals(fetchedRegistry?.tags, []);
      console.log(`✅ Registry tags after successful remove: ${JSON.stringify(fetchedRegistry?.tags)}`);

      await client.close();
      console.log("--- End of Scenario 3 ---");
    },
  );

  // # trace: Scenario 4: Deletion and re-registration
  await test.step(
    "Scenario 4: deleteRegistry and re-registration of resource",
    async () => {
      console.log(
        "\n--- Scenario 4: Delete and Re-registration ---",
      );
      const { concept, client } = await setupConcept();

      const resourceId = "res_delete_reregister" as ID;
      const description1 = "Initial description.";
      const description2 = "New description after re-registration.";
      const tag1 = "old_tag";
      const tag2 = "new_tag";

      // 1. Register a resource and add a tag
      console.log(
        `💡 Calling registerResource with resource: ${resourceId}, description: "${description1}"`,
      );
      const registerResult1 = await concept.registerResource({
        resource: resourceId,
        description: description1,
      });
      if (!("registry" in registerResult1)) {
        console.log(`❌ registerResource failed: ${registerResult1.error}`);
        throw new Error("Failed to register resource for delete/re-register test.");
      }
      const registryId1 = (registerResult1 as { registry: ID }).registry;
      console.log(`✅ registerResource successful. ID: ${registryId1}`);

      console.log(`💡 Calling addTag for registry ${registryId1} with tag: "${tag1}"`);
      await concept.addTag({ registry: registryId1, tag: tag1 });
      console.log(`✅ addTag successful for "${tag1}".`);

      let fetchedRegistry1 = await concept.registries.findOne({
        _id: registryId1,
      });
      assertEquals(fetchedRegistry1?.resource, resourceId);
      assertEquals(fetchedRegistry1?.tags, [tag1]);
      console.log(`✅ Registry state before delete: ${JSON.stringify(fetchedRegistry1)}`);

      // 2. Delete the registry
      console.log(`💡 Calling deleteRegistry for registry ${registryId1}`);
      const deleteResult = await concept.deleteRegistry({
        registry: registryId1,
      });
      assertEquals(deleteResult, {});
      console.log(`✅ deleteRegistry successful.`);

      // Verify it's gone
      fetchedRegistry1 = await concept.registries.findOne({
        _id: registryId1,
      });
      assertEquals(fetchedRegistry1, null, "Registry should be deleted");
      console.log(`✅ Registry ${registryId1} confirmed deleted.`);

      // Attempt to delete again (should fail)
      console.log(`💡 Calling deleteRegistry (2nd attempt) for registry ${registryId1} (expecting error)`);
      const deleteResult2 = await concept.deleteRegistry({
        registry: registryId1,
      });
      if ("error" in deleteResult2) {
        console.log(`✅ deleteRegistry (2nd attempt) failed as expected: ${deleteResult2.error}`);
      } else {
        console.log(`❌ deleteRegistry (2nd attempt) unexpectedly succeeded.`);
      }
      assertEquals(
        "error" in deleteResult2,
        true,
        "Should return an error for non-existent registry on second delete",
      );
      assertEquals(
        (deleteResult2 as { error: string }).error,
        `Registry ${registryId1} not found.`,
      );

      // 3. Register the *same* resource again (should succeed now)
      console.log(
        `💡 Calling registerResource (re-registration) with resource: ${resourceId}, description: "${description2}"`,
      );
      const registerResult2 = await concept.registerResource({
        resource: resourceId,
        description: description2,
      });
      if ("registry" in registerResult2) {
        console.log(`✅ registerResource (re-registration) successful.`);
      } else {
        console.log(`❌ registerResource (re-registration) failed: ${registerResult2.error}`);
        throw new Error("Expected re-registration to succeed.");
      }
      assertEquals(
        "registry" in registerResult2,
        true,
        "Should successfully re-register resource",
      );
      const registryId2 = (registerResult2 as { registry: ID }).registry;
      assertEquals(
        registryId1 !== registryId2,
        true,
        "New ID should be generated",
      );
      console.log(`✅ New registry ID after re-registration: ${registryId2}`);

      let fetchedRegistry2 = await concept.registries.findOne({
        _id: registryId2,
      });
      assertEquals(fetchedRegistry2?.resource, resourceId);
      assertEquals(fetchedRegistry2?.description, description2);
      assertEquals(fetchedRegistry2?.tags, []); // Should have an empty tag list
      console.log(`✅ Re-registered registry state: ${JSON.stringify(fetchedRegistry2)}`);

      // 4. Add a new tag to the re-registered resource
      console.log(`💡 Calling addTag for re-registered registry ${registryId2} with tag: "${tag2}"`);
      await concept.addTag({ registry: registryId2, tag: tag2 });
      console.log(`✅ addTag successful for "${tag2}".`);
      fetchedRegistry2 = await concept.registries.findOne({
        _id: registryId2,
      });
      assertEquals(fetchedRegistry2?.tags, [tag2]);
      console.log(`✅ Re-registered registry tags after adding: ${JSON.stringify(fetchedRegistry2?.tags)}`);

      await client.close();
      console.log("--- End of Scenario 4 ---");
    },
  );
});

```