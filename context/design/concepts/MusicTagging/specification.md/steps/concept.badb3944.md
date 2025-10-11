---
timestamp: 'Sat Oct 11 2025 14:42:32 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251011_144232.853247e0.md]]'
content_id: badb39444cec700b95632674199216d08a28cbb7f2cbe3ff2ba5d31a1bd3ddc0
---

# concept: MusicTagging\[Resource, GeminiLLM]

* **purpose**: to classify resources with musical descriptors so they can be easily retrieved later.

* **principle**: after a resource is registered with a description, the user can manage tags associated with it. They may ask an AI to suggest tags based on the description of the resource. Tags can be attached or removed later. They can search for resources that have a specific tag attached and delete them.

* **state**
  * a set of Registry with
    * a `Resource`
    * a `description` of type `String`
    * a `tags` set of `String`

* **actions**
  * `registerResources (resource: Resource, description: String): (registry: Registry)`
    * **requires** `resource` is not .
    * **effects** A new `Registry` entry is created in the concept's state with the given `resources`, `description`, and an empty set of `tags`. The identifier of the new `Registry` entry is returned.

  * `addTag (registry: Registry, tag: String)`
    * **requires** `registry` exists in the state and `tag` is not already present in `registry.tags`.
    * **effects** `tag` is added to the `tags` set of the specified `registry`.

  * `removeTag (registry: Registry, tag: String)`
    * **requires** `registry` exists in the state and `tag` is present in `registry.tags`.
    * **effects** `tag` is removed from the `tags` set of the specified `registry`.

  * `deleteRegistry (registry: Registry)`
    * **requires** `registry` exists in the state.
    * **effects** The specified `registry` entry and all its associated data are removed from the state.

  * `async suggestTags(registry: Registry, llm: GeminiLLM)`
    * **requires** registry exists
    * **effects** uses llm to create and assign a set of tags that fit the description of the passed in registry's resources. Cannot assign a tag if it is already in registry's tags set
