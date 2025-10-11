[@concept-design-overview](../../background/concept-design-overview.md)

[@concept-specifications](../../background/concept-specifications.md)

[@incomplete-concept](incomplete-spec.md)

# prompt: given an incomplete MusicTagging concept, add necessary actions as described in the concept design overview and specifications instructions

# response:

Here's the completed `MusicTagging` concept, incorporating necessary actions as described in the concept design overview:

# concept: MusicTagging\[Resource, GeminiLLM]

*   **purpose**: to classify sets of resources with musical descriptors so they can be easily retrieved later.

*   **principle**: after a set of resources are registered with a description, the user can manage tags associated with those resources. They may ask an AI to suggest tags based on the description of the resources. Tags can be attached or removed later. They can search for resources that have a specific tag attached and delete them.

*   **state**
    *   a set of Registry with
        *   a `resource` of type `Resource`
        *   a `description` of type `String`
        *   a `tags` set of `String`

*   **actions**

    *   `registerResource (resource: Resource, description: String): (registry: Registry)`
        *   **requires** no `Registry` entry exists in the state for the given `resource`
        *   **effects** a new `Registry` entry is created, associating the `resource` with the `description`, and its `tags` set is initialized as empty. Returns the identifier of the new `Registry` entry.

    *   `addTag (registry: Registry, tag: String)`
        *   **requires** `registry` exists in the state and `tag` is not already present in `registry.tags`
        *   **effects** `tag` is added to the `registry.tags` set

    *   `removeTag (registry: Registry, tag: String)`
        *   **requires** `registry` exists in the state and `tag` is present in `registry.tags`
        *   **effects** `tag` is removed from the `registry.tags` set

    *   `async suggestTags (registry: Registry, llm: GeminiLLM)`
        *   **requires** `registry` exists in the state
        *   **effects** uses `llm` to create a set of tags that fit the `registry.description` and adds them to `registry.tags`. Tags already present in `registry.tags` are not re-added.

    *   `unregisterResource (registry: Registry)`
        *   **requires** `registry` exists in the state
        *   **effects** the `Registry` entry identified by `registry` is removed from the state

*   **queries**

    *   `getMatchingResources (tag: String): (resources: set of Resource)`
        *   **requires** true
        *   **effects** returns a set of `Resource` identifiers from all `Registry` entries whose `tags` set includes the given `tag`