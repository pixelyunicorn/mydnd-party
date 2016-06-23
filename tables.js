/**

default tags:
* campaign
* combat
* dm
* inventory
* quest
* magic
* monster
* npc
* player
* player-class
* potion
* printout
* race
* reference
* skills
* world-building
default categories:
* DND 1
* DND 2
* DND 3.5
* DND 4
* DND 5
* Pathfinder

resources

| serial id  | text title   | text description                | text url      | text tags           | text categories      | bigint submitted    | int clicks |
|___________________________|_________________________________|_______________|_____________________|______________________|_____________________|____________|
| 1          | "Herbs List" | A list of herbs for each season |"bit.ly/herbs" | "herbs", "world"    | "DND 1"              | 3000                | 0          |
|___________________________|_________________________________|_______________|_____________________|______________________|_____________________|____________|

create table resources (id serial, title text, description text, url text, tags text, categories text, submitted bigint, clicks int);

searches

| serial id | text search | bigint searchtime    |
|___________|_____________|______________________|
| 1         | "hurbs"     | 3001                 |
|___________|_____________|______________________|

create table searches (id serial, search text, searchtime bigint);

user_redirects

| serial id | text campaign | text url          |
|___________|_______________|___________________|
| 1         | "Terranor"    | "bit.ly/terranor" |
|___________|_______________|___________________|

create table user_redirects (id serial, campaign text, url text);

TODO SQL validation
TODO NPC backstory generator

**/