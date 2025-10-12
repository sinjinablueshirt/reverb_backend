---
timestamp: 'Sat Oct 11 2025 21:03:44 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251011_210344.ab0646aa.md]]'
content_id: 6ef7946ea712f940a05396ddb39c3453a7417d893f654f101e579c15aafcb2bd
---

# file: src/concepts/MusicTagging/MusicTaggingConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Declare collection prefix, use concept name
const PREFIX = "MusicTagging" + ".";

// Generic types of this concept
type Resource = ID;
type GeminiLLM = any; // Placeholder for the LLM type, as it's an external dependency
type RegistryID = ID; // Type for the identifier of a Registry entry

/**
 * a set of Registry with
 *   a `Resource`
 *   a `description` of type `String`
 *   a `tags` set of `String`
 */
interface Registry {
  _id: RegistryID;
  resource: Resource;
  description: string;
  tags: string[];
}

export default class MusicTaggingConcept {
  registries: Collection<Registry>;

  constructor(private readonly db: Db) {
    this.registries = this.db.collection(PREFIX + "registries");
  }

  /**
   * registerResource (resource: Resource, description: String): (registry: Registry)
   *
   * @requires no `Registry` entry exists in the state for the given `resource`
   * @effects A new `Registry` entry is created in the concept's state with the given `resource`,
   *          `description`, and an empty set of `tags`. The identifier of the new `Registry` entry is returned.
   */
  async registerResource(
    { resource, description }: { resource: Resource; description: string },
  ): Promise<{ registry: RegistryID } | { error: string }> {
    // Check precondition: no Registry entry exists for the given resource
    const existingRegistry = await this.registries.findOne({ resource });
    if (existingRegistry) {
      return { error: `Resource ${resource} is already registered.` };
    }

    // Effect: Create a new Registry entry
    const newRegistryId = freshID() as RegistryID;
    const newRegistry: Registry = {
      _id: newRegistryId,
      resource: resource,
      description: description,
      tags: [],
    };

    await this.registries.insertOne(newRegistry);

    // Return the identifier of the new Registry entry
    return { registry: newRegistryId };
  }

  /**
   * addTag (registry: Registry, tag: String)
   *
   * @requires `registry` exists in the state and `tag` is not already present in `registry.tags`.
   * @effects `tag` is added to the `tags` set of the specified `registry`.
   */
  async addTag(
    { registry, tag }: { registry: RegistryID; tag: string },
  ): Promise<Empty | { error: string }> {
    // Check precondition: registry exists
    const existingRegistry = await this.registries.findOne({ _id: registry });
    if (!existingRegistry) {
      return { error: `Registry ${registry} not found.` };
    }

    // Check precondition: tag is not already present
    if (existingRegistry.tags.includes(tag)) {
      return { error: `Tag "${tag}" already exists for registry ${registry}.` };
    }

    // Effect: Add tag to the tags set
    await this.registries.updateOne(
      { _id: registry },
      { $addToSet: { tags: tag } }, // $addToSet ensures tag is added only if it's not already there
    );

    return {};
  }
}

```
