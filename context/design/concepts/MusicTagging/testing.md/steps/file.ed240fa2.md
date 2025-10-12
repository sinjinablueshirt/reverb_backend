---
timestamp: 'Sat Oct 11 2025 21:05:55 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251011_210555.eff7155e.md]]'
content_id: ed240fa2e46050e63c838166fd72f7ca0354b3c4995b423b417fdb38fa96a1fc
---

# file: src/concepts/MusicTagging/MusicTaggingConcept.test.ts

```typescript
import { assertEquals } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import MusicTaggingConcept from "./MusicTaggingConcept.ts";

Deno.test("MusicTaggingConcept - registerResource", async (t) => {
  const [db, client] = await testDb();
  const concept = new MusicTaggingConcept(db);

  await t.step("should successfully register a new resource", async () => {
    const resourceA = "song:StairwayToHeaven" as ID;
    const descriptionA =
      "A classic rock song by Led Zeppelin, known for its acoustic intro and powerful guitar solo.";

    // Action: registerResource
    const result = await concept.registerResource({
      resource: resourceA,
      description: descriptionA,
    });

    // Assert effects: new Registry ID returned, no error
    assertEquals(typeof (result as { registry: ID }).registry, "string");
    assertEquals("error" in result, false);

    const registryId = (result as { registry: ID }).registry;

    // Verify state change: entry exists in database with correct details
    const storedRegistry = await concept.registries.findOne({
      _id: registryId,
    });
    assertEquals(storedRegistry?.resource, resourceA);
    assertEquals(storedRegistry?.description, descriptionA);
    assertEquals(storedRegistry?.tags, []); // Tags should be empty initially
  });

  await t.step(
    "should return an error if the resource is already registered",
    async () => {
      const resourceB = "album:TheDarkSideOfTheMoon" as ID;
      const descriptionB = "A landmark progressive rock album by Pink Floyd.";

      // First registration (should succeed)
      const firstResult = await concept.registerResource({
        resource: resourceB,
        description: descriptionB,
      });
      assertEquals("error" in firstResult, false);

      // Second registration of the same resource (should fail)
      const secondResult = await concept.registerResource({
        resource: resourceB,
        description: "Attempting to register again.",
      });

      // Assert effects: error message returned
      assertEquals("error" in secondResult, true);
      assertEquals(
        (secondResult as { error: string }).error,
        `Resource ${resourceB} is already registered.`,
      );

      // Verify state: only one entry for the resource exists
      const count = await concept.registries.countDocuments({
        resource: resourceB,
      });
      assertEquals(count, 1);
    },
  );

  await client.close();
});

Deno.test("MusicTaggingConcept - addTag", async (t) => {
  const [db, client] = await testDb();
  const concept = new MusicTaggingConcept(db);

  let registeredRegistryId: ID;
  const resourceC = "artist:Queen" as ID;
  const descriptionC = "A British rock band formed in London in 1970.";

  // Setup: Register a resource once for all addTag tests
  const result = await concept.registerResource({
    resource: resourceC,
    description: descriptionC,
  });
  if ("error" in result) {
    throw new Error(
      `Failed to register resource for addTag tests: ${result.error}`,
    );
  }
  registeredRegistryId = result.registry;
  console.log("Registered registry ID:", registeredRegistryId);

  await t.step(
    "should successfully add a new tag to an existing registry",
    async () => {
      const tag = "rock";

      // Action: addTag
      const result = await concept.addTag({
        registry: registeredRegistryId,
        tag,
      });

      // Assert effects: no error returned
      assertEquals("error" in result, false);
      assertEquals(result, {});

      // Verify state change: tag is present in the registry's tags set
      const storedRegistry = await concept.registries.findOne({
        _id: registeredRegistryId,
      });
      assertEquals(storedRegistry?.tags.includes(tag), true);
      assertEquals(storedRegistry?.tags.length, 1);
    },
  );

  await t.step(
    "should return an error if the registry does not exist",
    async () => {
      const nonExistentRegistryId = "nonExistent:123" as ID;
      const tag = "nonexistent_tag";

      // Action: addTag to a non-existent registry
      const result = await concept.addTag({
        registry: nonExistentRegistryId,
        tag,
      });

      // Assert effects: error message returned
      assertEquals("error" in result, true);
      assertEquals(
        (result as { error: string }).error,
        `Registry ${nonExistentRegistryId} not found.`,
      );
    },
  );

  await t.step(
    "should return an error if the tag is already present in the registry",
    async () => {
      const tagAlreadyPresent = "legendary"; // This tag should be added successfully first
      const tagDuplicate = "legendary"; // Then try to add it again

      // First, add the tag successfully
      const firstAddResult = await concept.addTag({
        registry: registeredRegistryId,
        tag: tagAlreadyPresent,
      });
      assertEquals("error" in firstAddResult, false);

      // Verify state: tag is present
      const registryAfterFirstAdd = await concept.registries.findOne({
        _id: registeredRegistryId,
      });
      assertEquals(
        registryAfterFirstAdd?.tags.includes(tagAlreadyPresent),
        true,
      );

      // Action: Attempt to add the same tag again
      const secondAddResult = await concept.addTag({
        registry: registeredRegistryId,
        tag: tagDuplicate,
      });

      // Assert effects: error message returned
      assertEquals("error" in secondAddResult, true);
      assertEquals(
        (secondAddResult as { error: string }).error,
        `Tag "${tagDuplicate}" already exists for registry ${registeredRegistryId}.`,
      );

      // Verify state: tag is still present, but not duplicated (set behavior)
      const registryAfterSecondAdd = await concept.registries.findOne({
        _id: registeredRegistryId,
      });
      const countOfTag = registryAfterSecondAdd?.tags.filter((t) =>
        t === tagDuplicate
      ).length;
      assertEquals(countOfTag, 1); // Should only appear once
    },
  );

  await client.close();
});

```
