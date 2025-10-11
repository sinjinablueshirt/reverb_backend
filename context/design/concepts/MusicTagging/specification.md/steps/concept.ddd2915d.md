---
timestamp: 'Sat Oct 11 2025 14:33:52 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251011_143352.f10f45c1.md]]'
content_id: ddd2915de846d04e957d327e584ad26dd5946a351820749adcbc9109f4c96f0c
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
  * **TODO**: ADD MORE ACTIONS

  * `async suggestTags(registry: Registry, llm: GeminiLLM)`
    * **requires** registry exists
    * **effects** uses llm to create and assign a set of tags that fit the description of the passed in registry's resources. Cannot assign a tag if it is already in registry's tags set
