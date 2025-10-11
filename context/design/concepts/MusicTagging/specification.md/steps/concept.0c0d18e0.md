---
timestamp: 'Sat Oct 11 2025 14:39:58 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251011_143958.e6d92982.md]]'
content_id: 0c0d18e0bafddeb60ec2549482bbdbd9c2a3f1a83318d4844740f02ac253948f
---

# concept: MusicTagging\[Resource, GeminiLLM]

* **purpose**: to classify sets of resources with musical descriptors so they can be easily retrieved later.

* **principle**: after a set of resources are registered with a description, the user can manage tags associated with those resources. They may ask an AI to suggest tags based on the description of the resources. Tags can be attached or removed later. They can search for resources that have a specific tag attached and delete them.

* **state**
  * a set of Registry with
    * a `resources` set of `Resource`
    * a `description` of type `String`
    * a `tags` set of `String`

* **actions**
  * `registerResources (resources: set of Resource, description: String): (registry: Registry)`
    * **requires** No existing `Registry` entry in the state has this exact set of `resources`.
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
