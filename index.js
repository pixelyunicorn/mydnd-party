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

// API
// Get campaign & all campaigns
//?name=<CAMPAIGN_NAME>
app.get('/api/v1/campaigns', function(request, response) {
    name = request.params.name || "";
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        console.log("select * from user_redirects WHERE campaign = '"+name+"'");
        client.query("select * from user_redirects WHERE campaign = '"+name+"'", function(err, res) {
            console.error(err);
            response.send({results: res.rows});
        });
    }); 
});
// Add campaign
//name = <CAMPAIGN NAME>, url = <CAMPAIGN_URL>
app.post('/api/v1/campaigns', function(request, response) {
    var campaignName = request.body.name;
    var url = request.body.url;
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        client.query("insert into user_redirects (campaign, url) values ('"+campaignName+"', '"+url+"')", function(err, res) {
            response.send({res: 200});
        });
    });     
});
// Get resource & all resources w/ filtering
//?tag=<TAGS>&category=<CATEGORIES>&name=<NAME>
app.get('/api/v1/resources', function(request, response) {
    tag = request.params.tag || "";
    category = request.params.category || "";
    name = request.params.name || "";
    console.log(process.env.DATABASE_URL);
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        console.log(client, err);
        console.log("select * from resources WHERE tags LIKE '%"+tag+"%' OR categories LIKE '%"+category+"%' OR title LIKE '%"+name+"%' ORDER BY clicks DESC");
        client.query("select * from resources WHERE tags LIKE '%"+tag+"%' OR categories LIKE '%"+category+"%' OR title LIKE '%"+name+"%' ORDER BY clicks DESC", function(err, res) {
            console.error(err);
            console.log(res);
            response.send({results: res.rows});
        });
    }); 
});
// Add resource
//title = <TITLE>, description = <DESCRIPTION>, url = <URL>, tags = <TAGS>, categories = <CATEGORY>, submitted = <timestamp>
app.post('/api/v1/resources', function(request, response) {
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        console.log("insert into resources (title, description, url, tags, categories, submitted, clicks) values ('"+request.body.title+"', '"+request.body.description+"', '"+request.body.url+"', '"+request.body.tags+"', '"+request.body.categories+"', "+new Date().getTime()+", 0)");
        client.query("insert into resources (title, description, url, tags, categories, submitted, clicks) values ('"+request.body.title+"', '"+request.body.description+"', '"+request.body.url+"', '"+request.body.tags+"', '"+request.body.categories+"', "+new Date().getTime()+", 0)", function(err, res) {
            response.send({res: 200, msg: err});
        });
    });     
});

// Add a click to a resource
app.post('/api/v1/resources/:id/click', function(request, response) {
    var id = request.params.id;
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        client.query("select clicks from resources where id = "+id, function(err, res) {
            var clicks = res.rows[0].clicks++;
            client.query("update resources set clicks = "+clicks+" where id="+id+"", function(err, res) {
                response.send({res:200, clicks: clicks});
            });
        });
    });  
});

// Shortlinks
app.get('/:campaign', function(request, response) {
    campaign = request.params.campaign.toLowerCase();
    if(campaign.indexOf('.') > -1 || campaign.indexOf('/') > -1) {
        // Is requesting a file
        response.send(campaign);
        return;
    }      
    // Valid
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        client.query("insert into user_redirects (campaign, url) values ('"+campaignName+"', '"+url+"')", function(err, res) {
            res.writeHead(302, {'Location': res.rows[0].url});
            res.end();
        });
    });  
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});