/**
 * Created by brentporter on 10/12/17.
 * This is the Control Code for App
 * called from command line >node app.js
 */

const express = require('express');
const app = express();

var cors = require('cors');
var path = require('path');
var port     = process.env.PORT || 10001;

var bodyParser = require('body-parser');
var expressValidator = require('express-validator');

var DATABASE_URL = 'ENTER IN YOUR CREDENTIAL AND SERVER CONNECTION INFO';

app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());

app.set('view engine', 'jade');
app.use('/public/views/css',express.static(__dirname + '/resources/css'));
app.use('/public/views/images',express.static(__dirname + '/resources/images'));
app.use('/public/views/js',express.static(__dirname + '/resources/js'));
app.use('/public/css',express.static(__dirname + '/resources/css'));
app.use('/public/images',express.static(__dirname + '/resources/images'));
app.use('/public/js',express.static(__dirname + '/resources/js'));

require('./routes/routing.js')(app,express);

app.listen(port);

console.log('The magic happens on port ' + port);

module.exports = app;

