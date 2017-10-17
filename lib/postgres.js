/**
 * Created by brentporter on 10/3/17.
 * This is the module export for pg library initialization
 * for Web GIS on a Shoestring
 */


//Check on if var pg below is needed
var pg = exports;

exports.constructor = function pg(){};

var pgLib = require('pg');

pg.initialize = function(databaseUrl, cb) {
    var client = new pgLib.Client(databaseUrl);
    client.connect(function(err) {
        if (err) {
            return cb(err);
        }

        pg.client = client;
        cb();
    });
};