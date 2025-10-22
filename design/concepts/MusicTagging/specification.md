
# concept: MusicTagging[Resource]

* **purpose**: to classify resources with musical descriptors so they can be easily retrieved later.

* **principle**: after a resource is registered with a description, the user can manage tags associated with it. They may ask an AI to suggest tags based on the description of the resource. Tags can be attached or removed later. They can search for resources that have a specific tag attached and delete them.

* **state**
    * a set of Registry with
        * a `Resource`
        * a `description` of type `String`
        * a `tags` set of `String`

* **actions**
    *   `registerResource (resource: Resource, description: String): (registry: Registry)`
        *   **requires** no `Registry` entry exists in the state for the given `resource`
        *   **effects** A new `Registry` entry is created in the concept's state with the given `resource`, `description`, and an empty set of `tags`. The identifier of the new `Registry` entry is returned.

    *   `addTag (registry: Registry, tag: String)`
        *   **requires** `registry` exists in the state and `tag` is not already present in `registry.tags`.
        *   **effects** `tag` is added to the `tags` set of the specified `registry`.

    *   `removeTag (registry: Registry, tag: String)`
        *   **requires** `registry` exists in the state and `tag` is present in `registry.tags`.
        *   **effects** `tag` is removed from the `tags` set of the specified `registry`.

    *   `deleteRegistry (registry: Registry)`
        *   **requires** `registry` exists in the state.
        *   **effects** The specified `registry` entry and all its associated data are removed from the state.

    * `async suggestTags(description: string, existingTags: list of string): (tags: list of string)`
        * **requires** `description` is not empty
        * **effects** uses an llm to create a set of tags that fit the `description` in a musical context and returns this set. Tags already present in `existingTags` are not suggested.
