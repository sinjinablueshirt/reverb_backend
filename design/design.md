# Design File

## Changes to Application Design

A big change that I made from my initial design was to the TagSearch concept. I explained some of this in the last assignment since TagSearch is also my AI-augmented concept.

The main change (aside from the AI augmentation) is that I made the state a set of "registries" with an resource and tag set under each one. I also changed the actions to work with the new state accordingly. I changed the generic type from object to resource since typescript already seems to have its own Object class.

For the AI augmentation I was mainly thinking of having the AI suggest comment tags based on the content of the comment when a user is giving feedback. These changes are in the principle, state, and actions. For the state I added a "description" field to each registry so that this would be how an LLM gets the context it needs to suggest tags. An LLM-powered action "suggestTags" was added which is the main thing that interacts with the LLM.


## Interesting Moments
1. I actually struggled with getting Context to only implement parts of a concept at first. I was using "implement:" instead of "prompt:". using the latter allowed me to incrementally implement my concepts using Context. In [this snapshot](context/design/concepts/UserAuthentication/implementation.md/steps/response.9eb27d0e.md) was what I got from using "implement:" no matter what. I tried adding instructions after the "implement:" line but they seemsed to have no effect. [This one](context/design/concepts/UserAuthentication/implementation.md/steps/response.e9277c70.md) was what I got when I used prompt. I continued this strategy to incrementally

2. When first approaching tests, I came across a strange error. The only tests I had were for my User Authenticationʻs register action, but for some reason it would error like so:

![alt text](/media/error1.png)

I couldnʻt figure out what was wrong, so what I did was went back to the UserAuthentication testing.md Context file and asked it for help. I put in [this prompt](context/design/concepts/UserAuthentication/testing.md/steps/prompt.175523c2.md) and [the current, failing test file](context/design/concepts/UserAuthentication/testing.md/steps/file.d6057bde.md). The result was a new test file which I ran and it ended up working without running into the same error as before!

## Other Notes

Basically my approach for implementing went like ask Context to implement one action, make tests for that one action, check that everything works, if so then ask Context to add onto the current implementation (without changing anything) and test it and so forth. If an error comes up, Iʻll point to the current implementation/testing file and tell Context what was wrong with it.
