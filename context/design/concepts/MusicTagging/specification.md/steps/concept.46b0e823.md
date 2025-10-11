---
timestamp: 'Sat Oct 11 2025 14:15:35 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251011_141535.3559f86f.md]]'
content_id: 46b0e823aa8c6aa4c3566ffbe8f4b80a8f66ca6756d23981f08c135d5672e226
---

# concept: MusicTagging\[GeminiLLM]

* **purpose**: to classify sets of music files with descriptors so they can be easily retrieved later.

* **principle**: after a set of music files are registered with a description, the user can manage tags associated with that file. They may ask an AI to suggest tags based on the description of the file. Tags can be attached or removed later. They can search for files that have a specific tag attached and delete files.

* **state**
  * a set of Registry with
    * a `files` set of `String`
    * a `description` of type `String`
    * a `tags` set of `String`

* **actions**
  * **TODO**: ADD MORE ACTIONS

  * `async suggestTags(registry: Registry, llm: GeminiLLM)`
    * **requires** registry exists
    * **effects** uses llm to create and assign a set of tags that fit the description of the passed in registry's files. Cannot assign a tag if it is already in registry's tags set
