
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3001);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/donuts', routes.donuts);
app.get('/playground', routes.playground);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

//////////////////////////////////////
////// data and metadata routes //////
//////////////////////////////////////
var db = require('monk')('localhost/test'),
    genomes = db.get('genomes'),
    users = db.get('users'),
    fastbit = db.get('fastbit');

app.get('/genome', function (req, res, next) {
    // return a list of genomes from mongodb
    // available properties are {genomeID, species, version, taxon, description, sequences}
    // download everything but sequences.
    // client will lazy load the sequences and lengths for each requested genome
    genomes.find({}, 'genomeID species version', function(err,docs) {
        res.json(docs);
    });
});
app.get('/genome/:id', function (req,res,next) {
    // return info on this genome 
    genomes.findOne({genomeID:+req.params.id}, '-sequences', function(err,doc) {
        res.json(doc);
    });
});
app.get('/genome/:id/chromosomes', function (req,res,next) {
   // return chromosomes and lengths for requested genome 
   genomes.findOne({genomeID:+req.params.id}, 'sequences', function(err,doc) {
       res.json(doc.sequences);
   });
});

app.get('/genome/:id/datasets', function (req,res,next) {
    // return the datasets annotated on requested genome
    fastbit.find({genomeID:+req.params.id}, function(err,docs) {
        res.json(docs);
    });
});
var fb = {
    hostname: 'localhost',
    port: 3000
};
app.get('/data/:set', function (req,res) { 
    // return this data set (check permissions?)
    // /:set/describe
    var options = {
        hostname: fb.hostname,
        port: fb.port,
        path: '/'+req.params.set+'/describe'
    };
    http.get(options, function(response) {
        var body = '';
        response.on('data', function (chunk) {
            body += chunk;
        });
        response.on('end', function() {
            res.send(body);
        });
    }).on('error', function(e) {
        throw(e);
    });
});

app.get('/data/:set/:command', function (req,res,next) { // don't web-cache this because of the permissions check the node-fastbit service caches too, so no worries.
    // check permissions 
    // proxy the request through the node-fastbit service
    var options = {
        hostname: fb.hostname,
        port: fb.port,
        path: req.url.replace(/^\/data/,'')
    };
    http.get(options, function(response) {
        var body = '';
        response.on('data', function (chunk) {
            body += chunk;
        });
        response.on('end', function() {
            res.send(body);
        });
    }).on('error', function(e) {
        throw(e);
    });
});
