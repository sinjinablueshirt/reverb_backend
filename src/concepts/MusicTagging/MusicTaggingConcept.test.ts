import { assertEquals } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import MusicTaggingConcept from "./MusicTaggingConcept.ts";
import { ID } from "@utils/types.ts";

// Helper function to get a fresh concept instance for each test
async function setupConcept() {
  const [db, client] = await testDb();
  const concept = new MusicTaggingConcept(db);
  return { concept, db, client };
}

Deno.test("MusicTaggingConcept", async (test) => {
  // # trace: Principle: Register resource, add tags, remove tags, and search (implicitly)
  await test.step(
    "Principle: Register resource, add tags, remove tags, and verify state",
    async () => {
      const { concept, db, client } = await setupConcept();

      // 1. Register a resource
      const resourceId1 = "resource_abc" as ID;
      const description1 = "A powerful orchestral piece with heavy brass.";
      const registerResult = await concept.registerResource({
        resource: resourceId1,
        description: description1,
      });

      assertEquals(
        "registry" in registerResult,
        true,
        "Should successfully register resource",
      );
      const registryId1 = (registerResult as { registry: ID }).registry;

      let fetchedRegistry = await concept.registries.findOne({
        _id: registryId1,
      });
      assertEquals(fetchedRegistry?.resource, resourceId1);
      assertEquals(fetchedRegistry?.description, description1);
      assertEquals(fetchedRegistry?.tags, []);

      // 2. Add a few tags
      const tag1 = "orchestral";
      const tag2 = "epic";
      const tag3 = "brass";

      await concept.addTag({ registry: registryId1, tag: tag1 });
      await concept.addTag({ registry: registryId1, tag: tag2 });
      await concept.addTag({ registry: registryId1, tag: tag3 });

      fetchedRegistry = await concept.registries.findOne({
        _id: registryId1,
      });
      assertEquals(fetchedRegistry?.tags.sort(), [tag1, tag2, tag3].sort());

      // 3. Remove one of the tags
      await concept.removeTag({ registry: registryId1, tag: tag2 });

      fetchedRegistry = await concept.registries.findOne({
        _id: registryId1,
      });
      assertEquals(fetchedRegistry?.tags.sort(), [tag1, tag3].sort());

      // Implicit search/retrieval verification is done by fetching the registry
      // and asserting its contents, as there is no explicit search method defined.
      assertEquals(fetchedRegistry?.tags.includes(tag1), true);
      assertEquals(fetchedRegistry?.tags.includes(tag2), false);
      assertEquals(fetchedRegistry?.tags.includes(tag3), true);

      await client.close();
    },
  );

  // # trace: Scenario 1: Error handling for duplicate resource registration
  await test.step(
    "Scenario 1: registerResource fails on duplicate resource",
    async () => {
      const { concept, client } = await setupConcept();

      const resourceId = "res_duplicate" as ID;
      const description = "Some description.";

      // First registration should succeed
      const registerResult1 = await concept.registerResource({
        resource: resourceId,
        description: description,
      });
      assertEquals("registry" in registerResult1, true);

      // Second registration of the same resource should fail
      const registerResult2 = await concept.registerResource({
        resource: resourceId,
        description: "Another description for the same resource.",
      });
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
    },
  );

  // # trace: Scenario 2: Error handling for addTag (duplicate tag, non-existent registry)
  await test.step(
    "Scenario 2: addTag fails on duplicate tag or non-existent registry",
    async () => {
      const { concept, client } = await setupConcept();

      const resourceId = "res_addtag_errors" as ID;
      const description = "A test resource for addTag errors.";
      const registerResult = await concept.registerResource({
        resource: resourceId,
        description: description,
      });
      const registryId = (registerResult as { registry: ID }).registry;

      const tag = "genre_pop";
      const nonExistentRegistryId = "non_existent_registry" as ID;

      // 1. Add tag successfully
      const addResult1 = await concept.addTag({ registry: registryId, tag });
      assertEquals(addResult1, {});

      let fetchedRegistry = await concept.registries.findOne({
        _id: registryId,
      });
      assertEquals(fetchedRegistry?.tags, [tag]);

      // 2. Attempt to add the same tag again (should fail)
      const addResult2 = await concept.addTag({ registry: registryId, tag });
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

      // 3. Attempt to add a tag to a non-existent registry (should fail)
      const addResult3 = await concept.addTag({
        registry: nonExistentRegistryId,
        tag: "new_tag",
      });
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
    },
  );

  // # trace: Scenario 3: Error handling for removeTag (non-existent tag, non-existent registry)
  await test.step(
    "Scenario 3: removeTag fails on non-existent tag or non-existent registry",
    async () => {
      const { concept, client } = await setupConcept();

      const resourceId = "res_removetag_errors" as ID;
      const description = "A test resource for removeTag errors.";
      const registerResult = await concept.registerResource({
        resource: resourceId,
        description: description,
      });
      const registryId = (registerResult as { registry: ID }).registry;

      const existingTag = "upbeat";
      const nonExistentTag = "sad";
      const nonExistentRegistryId = "non_existent_registry_remove" as ID;

      // Add the existingTag
      await concept.addTag({ registry: registryId, tag: existingTag });
      let fetchedRegistry = await concept.registries.findOne({
        _id: registryId,
      });
      assertEquals(fetchedRegistry?.tags, [existingTag]);

      // 1. Attempt to remove a tag that does not exist (should fail)
      const removeResult1 = await concept.removeTag({
        registry: registryId,
        tag: nonExistentTag,
      });
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

      // 2. Attempt to remove a tag from a non-existent registry (should fail)
      const removeResult2 = await concept.removeTag({
        registry: nonExistentRegistryId,
        tag: existingTag,
      });
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
      const removeResult3 = await concept.removeTag({
        registry: registryId,
        tag: existingTag,
      });
      assertEquals(removeResult3, {});
      fetchedRegistry = await concept.registries.findOne({
        _id: registryId,
      });
      assertEquals(fetchedRegistry?.tags, []);

      await client.close();
    },
  );

  // # trace: Scenario 4: Deletion and re-registration
  await test.step(
    "Scenario 4: deleteRegistry and re-registration of resource",
    async () => {
      const { concept, client } = await setupConcept();

      const resourceId = "res_delete_reregister" as ID;
      const description1 = "Initial description.";
      const description2 = "New description after re-registration.";
      const tag1 = "old_tag";
      const tag2 = "new_tag";

      // 1. Register a resource and add a tag
      const registerResult1 = await concept.registerResource({
        resource: resourceId,
        description: description1,
      });
      const registryId1 = (registerResult1 as { registry: ID }).registry;
      await concept.addTag({ registry: registryId1, tag: tag1 });

      let fetchedRegistry1 = await concept.registries.findOne({
        _id: registryId1,
      });
      assertEquals(fetchedRegistry1?.resource, resourceId);
      assertEquals(fetchedRegistry1?.tags, [tag1]);

      // 2. Delete the registry
      const deleteResult = await concept.deleteRegistry({
        registry: registryId1,
      });
      assertEquals(deleteResult, {});

      // Verify it's gone
      fetchedRegistry1 = await concept.registries.findOne({
        _id: registryId1,
      });
      assertEquals(fetchedRegistry1, null, "Registry should be deleted");

      // Attempt to delete again (should fail)
      const deleteResult2 = await concept.deleteRegistry({
        registry: registryId1,
      });
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
      const registerResult2 = await concept.registerResource({
        resource: resourceId,
        description: description2,
      });
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

      let fetchedRegistry2 = await concept.registries.findOne({
        _id: registryId2,
      });
      assertEquals(fetchedRegistry2?.resource, resourceId);
      assertEquals(fetchedRegistry2?.description, description2);
      assertEquals(fetchedRegistry2?.tags, []); // Should have an empty tag list

      // 4. Add a new tag to the re-registered resource
      await concept.addTag({ registry: registryId2, tag: tag2 });
      fetchedRegistry2 = await concept.registries.findOne({
        _id: registryId2,
      });
      assertEquals(fetchedRegistry2?.tags, [tag2]);

      await client.close();
    },
  );
});
