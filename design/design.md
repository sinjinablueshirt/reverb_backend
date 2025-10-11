# Design File

## Changes to Application Design

### TagSearch (now MusicTagging)
A big change that I made from my initial design was to the TagSearch concept. I explained some of this in the last assignment since TagSearch is also my AI-augmented concept.

Firstly, I changed its name from TagSearch to MusicTagging to align with what I want it to accomplish for my app.

The main change (aside from the AI augmentation) is that I made the state a set of "registries" with a resource and tag set under each one. In practice, resource would be something like an id for a comment or post. The actions were also adjusted to work with this new structure, but otherwise remain the same in behavior.

For the AI augmentation I was mainly thinking of having the AI suggest comment tags based on the content of the comment when a user is giving feedback. These changes are in the principle, state, and actions. For the state I added a "description" field to each registry so that this would be how an LLM gets the context it needs to suggest tags. An LLM-powered action "suggestTags" was added which is the main thing that interacts with the LLM.

When I was making these changes, I wanted to try out having Context generate the concept spec for me. I provided it basically everything but the actions for the concept as seen in [this snapshot](context/design/concepts/MusicTagging/generate-spec.md/20251011_144312.5366f730.md). As a result, it gave me a full concept, which I checked. I used most of its actions without change in my actual specification for MusicTagging


## Interesting Moments
1. I actually struggled with getting Context to only implement parts of a concept at first. I was using "implement:" instead of "prompt:". using the latter allowed me to incrementally implement my concepts using Context. In [this snapshot](context/design/concepts/UserAuthentication/implementation.md/steps/response.9eb27d0e.md) was what I got from using "implement:" no matter what. I tried adding instructions after the "implement:" line but they seemed to have no effect. [This one](context/design/concepts/UserAuthentication/implementation.md/steps/response.e9277c70.md) was what I got when I used prompt. I continued this strategy to incrementally develop all of my concepts

2. When first approaching tests, I came across a strange error. The only tests I had were for my User Authenticationʻs register action, but for some reason it would error like so:

![alt text](/media/error1.png)

I couldnʻt figure out what was wrong, so what I did was went back to the UserAuthentication testing.md file and asked it for help. I put in [this prompt](context/design/concepts/UserAuthentication/testing.md/steps/prompt.175523c2.md) and [the current, failing test file](context/design/concepts/UserAuthentication/testing.md/steps/file.d6057bde.md). The result was new test code which I ran and it ended up working without running into the same error as before!

3. I came to the realization when I was working on my second concept (MusicTagging) that when I am prompting Context for tests, I shouldnʻt only pass in a code implementation of the concept since it doesnʻt really "know" the operational principle of the concept on its own. To follow this idea, I started passing in the concept specification file. This ended up bringing about a bunch of other problems. [In this snapshot](context/design/concepts/MusicTagging/testing.md/20251011_151131.ee58ae05.md), you can see how Context tried making its own register function. I had to change and test out the prompt over multiple iterations to end up with [this](). I believe that now Context knows that it should use the operational principle when designing tests.

## Other Notes

Basically my approach for implementing went like ask Context to implement one action, make tests for that one action, check that everything works, if so then ask Context to add onto the current implementation (without changing anything) and test it and so forth. If an error comes up, Iʻll point to the current implementation/testing file and tell Context what was wrong with it.

In /design/concepts are folders containing all relevant files relating to the design of each concept. implementation.md is the file in which I prompted Context for a partial implementation of the concept. specification.md contains the concept spec for that folder. testing.md is the file in which I prompted Context for tests to the concept implementation.
