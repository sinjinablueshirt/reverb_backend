---
timestamp: 'Sat Oct 11 2025 14:30:20 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251011_143020.09851fc2.md]]'
content_id: e6bb74c143c5b62d9b4b76a64c505d197f044e4485170d90ccbede872fefc5be
---

# concept: MusicTagging\[File, GeminiLLM]

* **purpose**: to classify sets of music files with descriptors so they can be easily retrieved later.

* **principle**: after a set of music files are registered with a description, the user can manage tags associated with that file. They may ask an AI to suggest tags based on the description of the file. Tags can be attached or removed later. They can search for files that have a specific tag attached and delete files.

* **state**
  * a set of Registry with
    * a `files` set of `File`
    * a `description` of type `String`
    * a `tags` set of `String`

* **actions**
  * **TODO**: ADD MORE ACTIONS

  * `async suggestTags(registry: Registry, llm: GeminiLLM)`
    * **requires** registry exists
    * **effects** uses llm to create and assign a set of tags that fit the description of the passed in registry's files. Cannot assign a tag if it is already in registry's tags set
