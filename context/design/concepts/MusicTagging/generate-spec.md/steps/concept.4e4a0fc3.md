---
timestamp: 'Sat Oct 11 2025 14:43:00 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251011_144300.3559f86f.md]]'
content_id: 4e4a0fc393d3e02cafe2696a7d1c71c7f2a3d6ec85a9b4d6cb3e0c4424054f7b
---

# concept: MusicTagging\[Resource, GeminiLLM]

* **purpose**: to classify sets of resources with musical descriptors so they can be easily retrieved later.

* **principle**: after a set of resources are registered with a description, the user can manage tags associated with those resources. They may ask an AI to suggest tags based on the description of the resources. Tags can be attached or removed later. They can search for resources that have a specific tag attached and delete them.

* **state**
  * a set of Registry with
    * a `Resource`
    * a `description` of type `String`
    * a `tags` set of `String`

* **actions**
  * **TODO**: ADD MORE ACTIONS

  * `async suggestTags(registry: Registry, llm: GeminiLLM)`
    * **requires** registry exists
    * **effects** uses llm to create and assign a set of tags that fit the description of the passed in registry's resources. Cannot assign a tag if it is already in registry's tags set
