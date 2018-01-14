var express = require('express');
var bodyParser = require('body-parser');

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

app.get('/loganland', function (req, res) {
    res.redirect('http://terranor-wiki.herokuapp.com');
    return;
});

app.get('/felkerland', function (req, res) {
    res.redirect('http://felker-rpg.herokuapp.com/');
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
app.get('/generators/:name', function(request, response) {
    var name = request.params.name;
    var page = 'pages/index';
    switch(name) {
        case "backstory":
        case "character":
            page = 'pages/generator_backstory';
            break;
        case "town":
        case "fantasytown":
            page = 'pages/generator_town';
            break;
        case "inn":
        case "tavern":
        case "pub":
        case "bar":
            page = 'pages/generator_inn';
            break;
    }
    response.render(page);
    return;
});

// Custom tables
app.get('/tables/:name', function(request, response) {
    var name = request.params.name;
    var page = 'pages/index';
    switch(name) {
        case "camp":
        case "camping":
        case "nighttime":
        case "overnight":
        case "watch":
            page = 'pages/table_nighttime';
            break;
        case "weather":
            page = 'pages/table_weather';
            break;
    }
    response.render(page);
    return;
});

// Custom tools
app.get('/tools/:name', function(request, response) {
    var name = request.params.name;
    var page = 'pages/index';
    switch(name) {
        case 'time':
        case 'clock':
            page = 'pages/time_tracker';
            break;
    }
    response.render(page);
    return;
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});