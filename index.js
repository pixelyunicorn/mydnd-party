var express = require('express');
var pg = require('pg');
var bodyParser = require('body-parser');
var ip = require('ip');

var app = express();
app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
    response.render('pages/index');
    return;
});
app.get('/:room', function(request, response) {
    // Get a specific sadness room
    // TODO Validate strings
    // TODO Surface most recent tags at bottom
    // TODO Display chats
    // TODO Send chats
    // TODO Ads
    room = request.params.room.toLowerCase();
    if(room.indexOf('.') > -1) {
        // Is requesting a file
        response.send(room);
        return;
    }   
    // SQL validation
    room = room.replace(/[\W0-9]/g, "");
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        global.client = client;
        client.query("SELECT * FROM room_list WHERE name = '"+room+"'", function(err, result) {
            // Check if the room exists
            console.log(result);
            if(result == undefined || result.rows == 0) {
                //Create it!
                console.log("Create "+room);
                global.client.query("insert into room_list (name) VALUES('"+room+"')");
                global.client.query("SELECT * FROM room_list WHERE name = '"+room+"'", function(err, result) {
                     if (err) { 
                        console.error(err); 
                        response.send("Error " + err); 
                    } else {
                        global.client.query('SELECT * FROM room_chat WHERE room_id = '+result.rows[0].id+' ORDER BY timestamp ASC', function(err, chat_results) {
                            done();
                            if (err) { 
                                console.error(err); 
                                response.send("Error " + err); 
                            } else { 
                                response.render('pages/db', {results: result.rows, chat_results: chat_results.rows} );
                            }
                        });
                    }
                });
                return;
            }
            
            if (err) { 
                console.error(err); 
                response.send("Error " + err); 
            } else { 
                client.query('SELECT * FROM room_chat WHERE room_id = '+result.rows[0].id+' ORDER BY timestamp DESC', function(err, chat_results) {
                    done();
                    if (err) { 
                        console.error(err); 
                        response.send("Error " + err); 
                    } else { 
                        response.render('pages/db', {results: result.rows, chat_results: chat_results.rows} );
                    }
                });
            }
        });
    });
//    response.render('pages/room', {results: result.row});
});
// TODO I NEED TO VALIDATE SINGLE QUOTES
app.post('/api/room/message', function(request, response) {
    //User sent a message
    var roomId = request.body.room;
    var message = request.body.message;
    // Validation
    message = message
        .replace(/\\/g, "backslash")
        .replace(/\(/g, "lparenthesis")
        .replace(/\)/g, "rparenthesis")
        .replace(/'/g, "&039;")
        .replace(/;/g, "semicolon")
        .replace(/[<>]/g, "carat");
    
    var userId = ip.address(); // IP address
    var timestamp = new Date().getTime();
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        client.query("insert into room_chat (room_id, chat_message, chat_user, timestamp) values ("+roomId+", '"+message+"', '"+userId+"', "+timestamp+")", function(err, res) {
            // Inserted!
            console.log("insert into room_chat (room_id, chat_message, chat_user, timestamp) values ("+roomId+", '"+message+"', '"+userId+"', "+timestamp+")");
            response.send("{res: 200}");
        });
    });
});
app.get('/api/rooms', function(request, response) {
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        console.log('room '+request.params.id);
        client.query("select * from room_list", function(err, res) {
            // Get!
            response.send({results: res.rows});
        });
    });
    
});
app.get('/api/messages', function(request, response) {
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        console.log('room '+request.params.id);
        client.query("select * from room_chat LIMIT 100", function(err, res) {
            // Get!
            response.send({results: res.rows});
        });
    });
    
});
app.get('/api/user/:id', function(request, response) {
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        console.log('room '+request.params.id);
        client.query("select * from room_chat where chat_user='"+request.params.id+"' ORDER BY timestamp", function(err, res) {
            // Get!
            response.send({results: res.rows});
        });
    });
    
});
app.get('/api/rooms/latest', function(request, response) {
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        console.log('room '+request.params.id);
        client.query("select * from room_chat LIMIT 100", function(err, res) {
            // Get!
//            response.send({results: res.rows});
            room_ids = [];
            var max_rooms = 5;
            for(r=0;r<res.rows.length;r++) {
                var room = res.rows[r].room_id;
                if(room_ids.indexOf(room) == -1 && room_ids.length < max_rooms) {
                    room_ids.push(room);
                }   
            }
            console.log(room_ids, "Ids");
            
            room_names = [];
            for(r=0;r<room_ids.length;r++) {
                console.log("Query "+room_ids[r]);
                client.query("select * from room_list WHERE id="+room_ids[r], function(err, res) {
                    console.log("Response");
                    room_names.push(res.rows[0].name);  
                    console.log(res.rows[0].name);
                    if(room_names.length >= max_rooms) {
                        response.send({results: room_names});
                    }
                }
            )};
        });
    });
    
});
app.get('/api/room/:id/messages', function(request, response) {
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        console.log('room '+request.params.id);
        client.query("select * from room_chat where room_id = "+request.params.id+" order by timestamp DESC", function(err, res) {
            // Get!
            console.log("select * from room_chat where room_id = "+request.params.id);
            console.log(err);
            console.log(res.rows);
            response.send({results: res.rows});
        });
    });
});
// TODO Easy submission action
// TODO Move the room heading up a little
// TODO Install a pretty font
// TODO More sadness in top left corner
// TODO Character codes
// TODO More APIs
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});