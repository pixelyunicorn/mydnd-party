var express = require('express');
//var pg = require('pg');
var firebase = require("firebase");
var bodyParser = require('body-parser');

firebase.initializeApp({
  serviceAccount: "mydnd-party-ae1947af60f3.json",
  databaseURL: "https://mydnd-party.firebaseio.com"
});
var db = firebase.database();

var app = express();
app.set('port', (process.env.PORT || 5000));

function mysql_validate(str) {
    if(str != undefined) {
        return str.replace(/[;]/g, "")
            .replace(/[']/g, "&#39;")
            .replace(/["]/g, "&quot;");
    } 
    return "";
}
function key_validate(str) {
    if(str != undefined) {
        return str.replace(/[\W0-9]/g, "");   
    }
    return "";
}
function url_validate(str) {
    if(str != undefined) {
        return str.replace(/["';]/g, "");   
    }
    return "";
}
function number_validate(int) {
    if(int != undefined) {
        return int.replace(/[\D]/g, "");   
    }
    return "";
}

app.use(express.static(__dirname + '/public'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Index
app.get('/', function(request, response) {
    response.render('pages/index');
    return;
});

// Add new resource
app.get('/add', function(request, response) {
    response.render('pages/add');
    return;
});

// Campaign shortlink
app.get('/campaign', function(request, response) {
    response.render('pages/campaign');
    return;
});

// Search results
app.get('/search', function(request, response) {
    response.render('pages/search');
    return;
});

// Custom generators
// Search results
app.get('/generators/:name', function(request, response) {
    var name = request.params.name;
    if(name == "backstory")
        response.render('pages/generator_backstory');
    return;
});
app.put('/generators/:name/suggest', function(request, response) {
    console.log(request);
    var name = request.params.name;
    var suggestion = request.body.suggestion;
    console.log(name, suggestion);
    db.ref('/generators/backstory/suggestions').push({
        value: suggestion 
    });
    response.send({res: 200, msg: "OK"});
});

function returnSnapshot(snap) {
    //        console.log(snapshot);
        c = [];
        snap.forEach(function(dinoSnapshot) {
//        console.log("The dinosaur just shorter than the stegasaurus is " + dinoSnapshot.val());
            c.push(dinoSnapshot.val());
            console.log(c);
      });
    response.send({results: c, err: "OK"});   
}
// API
// Get campaign & all campaigns
//?name=<CAMPAIGN_NAME>
app.get('/api/v1/campaigns', function(request, response) {
    name = mysql_validate(request.params.name) || "";
    db.ref('/campaigns').orderByChild('name').startAt(name).on("value", function(snapshot) {
        returnSnapshot(snapshot);
  });
});
// Add campaign
//name = <CAMPAIGN NAME>, url = <CAMPAIGN_URL>
app.post('/api/v1/campaigns', function(request, response) {
    var campaignName = key_validate(request.body.name);
    var url = url_validate(request.body.url);
    var campaignsRef = db.ref('/campaigns');
    campaignsRef.push({
        name: request.body.name,
        url: request.body.url
    });
    response.send({res: 200, msg: "OK"});
});
// Get resource & all resources w/ filtering
//?tag=<TAGS>&category=<CATEGORIES>&name=<NAME>
app.get('/api/v1/resources', function(request, response) {
    console.log(request.query);
    tag = request.query.tag || "";
    category = request.query.category || "";
    name = request.query.name || "";
    if(tag !== undefined)
        tag = tag.toLocaleLowerCase();
    if(category !== undefined)
        category = category.toLocaleLowerCase();
    if(name !== undefined)
        name = name.toLocaleLowerCase();
    console.log(request.query);
    console.log(tag, category, name);
        db.ref('/resources').orderByChild('clicks').on('value', function(snap) {
//            returnSnapshot(snapshot); 
            c = [];
            snap.forEach(function(dinoSnapshot) {
                console.log(dinoSnapshot.val().title, dinoSnapshot.val().tags.toLowerCase().indexOf(tag) > -1, tag != "", dinoSnapshot.val().categories.toLowerCase().indexOf(category) > -1, category != "", dinoSnapshot.val().title.toLowerCase().indexOf(name) > -1, name != "");
                if((dinoSnapshot.val().tags.toLowerCase().indexOf(tag) > -1 && tag != "") || (dinoSnapshot.val().categories.toLowerCase().indexOf(category) > -1 && category != "") || (dinoSnapshot.val().title.toLowerCase().indexOf(name) > -1 && name != "")) {
                    console.log("The dinosaur just shorter than the stegasaurus is ", dinoSnapshot.val());
                    c.push(dinoSnapshot.val());
                    c[c.length-1].id = dinoSnapshot.key;
                    console.log(c);
                }
            });
            response.send({results: c, err: "OK"}); 
            response.end();
        });
});
// Add resource
//title = <TITLE>, description = <DESCRIPTION>, url = <URL>, tags = <TAGS>, categories = <CATEGORY>, submitted = <timestamp>
app.post('/api/v1/resources', function(request, response) {
    /*pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        console.log("insert into resources (title, description, url, tags, categories, submitted, clicks) values ('"+request.body.title+"', '"+request.body.description+"', '"+request.body.url+"', '"+request.body.tags+"', '"+request.body.categories+"', "+new Date().getTime()+", 0)");
        if(request.body.description.length > 140) {
            request.body.description = request.body.description.substring(0,140);   
        }
        client.query("insert into resources (title, description, url, tags, categories, submitted, clicks) values ('"+request.body.title+"', '"+request.body.description+"', '"+request.body.url+"', '"+request.body.tags+"', '"+request.body.categories+"', "+new Date().getTime()+", 0)", function(err, res) {
            response.send({res: 200, msg: err});
        });
    });  */
    if(request.body.description.length > 140) {
            request.body.description = request.body.description.substring(0,140);   
        }
    var resourcesRef = db.ref('/resources');
    resourcesRef.push({
        title: request.body.title,
        description: request.body.description,
        url: request.body.url,
        tags: request.body.tags,
        categories: request.body.categories,
        submitted: new Date().getTime(),
        clicks: 0
    });
    response.send({res: 200, msg: "OK"});
});

// Add a click to a resource and redirect
app.get('/api/v1/resources/:id/click', function(request, response) {
    var id = request.params.id;
    var upvotesRef = db.ref("/resources/"+id+"/clicks");
    upvotesRef.transaction(function (current_value) {
      return (current_value || 0) + 1;
    }); 
    db.ref("/resources/"+id+"/url").on('value', function(snapshot) {
//        response.writeHead(302, {'Location': snapshot.val()});
        response.redirect(snapshot.val());
//        response.end();
    });    
});

// Shortlinks
app.get('/:campaign', function(request, response) {
    campaign = key_validate(request.params.campaign.toLowerCase());
    if(campaign.indexOf('.') > -1 || campaign.indexOf('/') > -1) {
        // Is requesting a file
        response.send(campaign);
        return;
    }      
    // Valid
    db.ref('/campaigns').orderByChild('name').startAt(campaign).on("value", function(snap) {
    snap.forEach(function(dinoSnapshot) {
//        console.log("The dinosaur just shorter than the stegasaurus is " + dinoSnapshot.val());
//        response.writeHead(302, {'Location': dinoSnapshot.val().url});
        response.redirect(dinoSnapshot.val().url);
//            response.end();
    });    
    });
    /*pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        client.query("select * from user_redirects where campaign='"+campaign+"'", function(err, res) {
            if(res.rows.length == 0 || res.rows[0].url == undefined) {
                console.error("Redirection fails");
                response.writeHead(404, {});
                response.end();
                return;
            }
            console.log("Found "+res.rows[0]);
            console.log("Redirecting to "+res.rows[0].url);
            var location = res.rows[0].url;
            if(location.substr(0,4) != "http") {
                location = "http://"+location;   
            }
            response.writeHead(302, {'Location': res.rows[0].url});
            response.end();
        });
    });  */
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

//TODO shortlink conflict resolution