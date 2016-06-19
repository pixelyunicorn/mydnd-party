/**

room_list

| int id     | text name            |
|___________________________________|
| 1          | "emags"              |
|___________________________________|

create table room_list (id int, name text);
insert into room_list VALUES(1, 'emags');

room_chat

| int chat_id | text chat_user | text chat_message | bigint timestamp | int room_id |
|___________________________________________________________________________________|
| 1           | fleker         | emags is sadness  | 102              | 1           |
|___________________________________________________________________________________|

create table room_chat (chat_id int, chat_user text, chat_message text, timestamp bigint, room_id int);
insert into room_chat VALUES(1, 'fleker', 'emags is sadness', 102, 1);

**/