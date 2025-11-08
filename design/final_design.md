# Final Design Document

In this file I summarize the overarching changes to my project from its initial design in assignment 2 as well as the visual changes to the design from assignment 4b

## Changes From Assignment 2 Concept Design

(many of these are moved over from previous assignments' design documents)

### Changes to TagSearch (now MusicTagging)
I changed its name from TagSearch to MusicTagging to align with what I want it to accomplish for my app.

The main change (aside from the AI augmentation) is that I made the state a set of "registries" with a resource and tag set under each one. In practice, resource would be something like an id for a comment or post. The actions were also adjusted to work with this new structure, but otherwise remain the same in behavior.

For the AI augmentation I was mainly thinking of having the AI suggest comment tags based on the content of the comment when a user is giving feedback. For the state I added a "description" field to each registry so that this would be how an LLM gets the context it needs to suggest tags. An LLM-powered action "suggestTags" was added which is the main thing that interacts with the LLM.

When I was making these changes, I wanted to try out having Context generate the concept spec for me. I provided it basically everything but the actions for the concept as seen in [this snapshot](../context/design/concepts/MusicTagging/generate-spec.md/20251011_144312.5366f730.md). As a result, it gave me a full concept, which I checked. I used most of its actions without change in my actual specification for MusicTagging

### Changes to Comment
My Comment concept did not change as much. The only real difference is that I don't include an "owner" of the resources which comments are tied to. I removed this because it seems more fitting to be a part of a different concept, and the owner of the resource wasn't really used at any point in the actions of the Comment concept.

The other change from my original design was that at the time I just used some dateTime type to work with timestamping comments. I did this because at the time I didn't really know what date/time type to use. Now, it uses the Date type.


### Completely reworking file concept
The biggest change that I made to the design of the *application* was in how music files would be handled. Out of inexperience, I had initially designed my concepts around the assumption that I could just store user-uploaded files in the database just as I did with any other piece of data. Unfortunately, I recently learned that I can't just do that, and the process for uploading and retriving files is more complicated than I thought. I ended up scrapping my old ResourceOwnership concept and creating a new FileUrl concept. It is almost similar to its predecessor in some aspects of its principle, but it differs a lot in its state and actions. The main thing is that it now uses the Google Cloud Storage service to upload, store, and retrieve files (this took A LOT of trial and error).

### Added Queries
In my original design, none of my concepts had queries. So I had to make some for each concept so that the front end could access important information. Additionally, as I was implementing queries, I noticed that some of my actions/queries initially took in arguments like normal code but had to change so they took in JSON-like objects (and returned JSON objects)

### Changing file handling within concept
I needed to drastically change the way files work. I realized in 4b that I can't just pass in a file path to the concept since backend cant just acceess the local files. To do this, I changed FileUrl by splitting the uploadfile action into two actions, requestupload and confirmupload. It took A LOT of trial and error working with GCS to get this to work, but I eventually figured out how to create buckets anre quest upload urls to those buckets. Later on, I also realized that I needed to create an action to request a viewing Url every time I want to see the contents of a file, so I created an action to support this. For these, I updated the [specification](../context/design/concepts/FileUrl/implementation.md/steps/Concept.1d8d269c.md) of the FileUrl concept and passed it into a [prompt](../context/design/concepts/FileUrl/implementation.md/steps/prompt.7cc54e22.md) to create the full implementation, which is what is currently used by the backend now.

### MusicTagging AI augmentation rework
I had to basically rework the entire suggestTags action. Before, it would take in an id of a registry in its state and directly add tags to it based on its description and current tags. There were two issues with this. First, when a user is writing a comment, the comment isn't yet saved to the state, so they can't get comment information that the LLM can use to generate tags. On a related note to the first issue, the second issue is that the backend can't add suggested tags to a comment that hasn't been made yet. To remedy these issues, I reworked the whole suggestTags function to now take in a string description and tags. Instead of directly adding suggested tags, it will return the suggested set of tags so that the front end can display them in the text box, which allows the user to edit them if they aren't satisfied.

### Getting the titles of files
In the implementation of assignment 4a, I naively believed that I the fileName or gcsObjectName fields could store the user's desired title for their music. However, I realized that these fields are used for other things. The fileName is the actual name of the file that was uploaded and the gcsObjectName is the name of the object in the GCS bucket. There was no ability for a user to title their work. Thus, for assignment 4b, I added a title field to state of fileUrl since it isn't saved otherwise

### Addition of Sessioning Concept (NEW)

In the final assignment, I had to implement syncs in the backend. This required using a Sessioning concept. I basically copy-pasted the Sessioning specification and implementation from the concept-box repository and used it for my syncs to make sure users had valid sessions. This required minimal changes to most behavior except that on UserAuthentication/login I had to return the session id to the front end in addition to the user.Also, I introduced a /logout route that allows the front end to delete sessions.



## Changes From Assignment 4B Visual Design

### made logging in/registering different pages
My original app layout had login and register fields on the same entry page. I instead made it so that from the entry page the user could either go to a login page or register page to keep more in line with standard app practices

### removed all screen wide text boxes
originally basically every text box spanned the entire width of the screen, which felt very weird, so I made each text box width more fitting to the application. For example, a login text box doesnʻt need to be as wide as the screen, and so it was shrunk to be more visually appealing.

### added bubbly animations to background. made background more vibrant
I felt that my original design of the background was decent but bland. I decided to make it more interesting by making it not jut a constant tan background. I also added animated circles floating around to give it a bubbly feel with more movement

### added loading animations to anything that had the page update after a user action
I noticed on the Render deployment of the app that some actions would take a moment to go through. In order to show users that clicking a button did something (and their screens arenʻt froen), I added loading animations to most things on the app. This was especially needed when uploading compositions and also just viewing them since retriving viewing URLs took a moment.
