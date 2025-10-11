---
timestamp: 'Sat Oct 11 2025 14:42:32 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251011_144232.853247e0.md]]'
content_id: 7fa10ef59ca48c7e5917bcf660447af76e9610ee753d921c76cae184b942ebd6
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
    * **effects** A
