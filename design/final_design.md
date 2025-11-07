# Final Design Document

In this file I summarize the overarching changes to my project from its initial design in assignment 2 as well as the visual changes to the design from assignment 4b

## Changes From Assignment 2 Concept Design

(many of these are moved over from my assignment 4b design document)

### Added Queries
In my original design, none of my concepts had queries. So I had to make some for each concept so that the front end could access important information. Additionally, as I was implementing queries, I noticed that some of my actions/queries initially took in arguments like normal code but had to change so they took in JSON-like objects (and returned JSON objects)

### Changing file handling
I needed to drastically change the way files work. I realized in 4b that I can't just pass in a file path to the concept since backend cant just acceess the local files. To do this, I changed FileUrl by splitting the uploadfile action into two actions, requestupload and confirmupload. It took A LOT of trial and error working with GCS to get this to work, but I eventually figured out how to create buckets anre quest upload urls to those buckets. Later on, I also realized that I needed to create an action to request a viewing Url every time I want to see the contents of a file, so I created an action to support this.

### MusicTagging AI augmentation rework
I had to basically rework the entire suggestTags action. Before, it would take in an id of a registry in its state and directly add tags to it based on its description and current tags. There were two issues with this. First, when a user is writing a comment, the comment isn't yet saved to the state, so they can't get comment information that the LLM can use to generate tags. On a related note to the first issue, the second issue is that the backend can't add suggested tags to a comment that hasn't been made yet. To remedy these issues, I reworked the whole suggestTags function to now take in a string description and tags. Instead of directly adding suggested tags, it will return the suggested set of tags so that the front end can display them in the text box, which allows the user to edit them if they aren't satisfied.

### Getting the titles of files
In the implementation of assignment 4a, I naively believed that I the fileName or gcsObjectName fields could store the user's desired title for their music. However, I realized that these fields are used for other things. The fileName is the actual name of the file that was uploaded and the gcsObjectName is the name of the object in the GCS bucket. There was no ability for a user to title their work. Thus, for assignment 4b, I added a title field to state of fileUrl since it isn't saved otherwise

### Addition of Sessioning Concept (NEW)
1. had to add Sessioning concept. just copy pasted from concept box
2. added log out route

## Changes From Assignment 4B Visual Design

1. made logging in/registering different pages
2. removed all screen wide text boxes
3. added bubbly animations to background
4. added loading animations since sometimes took a while
