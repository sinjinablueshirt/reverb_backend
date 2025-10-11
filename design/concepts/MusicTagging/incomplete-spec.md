# concept: MusicTagging[Resource, GeminiLLM]

* **purpose**: to classify resources with musical descriptors so they can be easily retrieved later.

* **principle**: after resources are registered with a description, the user can manage tags associated with those resources. They may ask an AI to suggest tags based on the description of the resources. Tags can be attached or removed later. They can search for resources that have a specific tag attached and delete them.

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
