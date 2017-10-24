/**
 * Created by brentporter on 10/12/17
 * Edited 10/14/17 by brentporter
 * Edited 10/15/17 by brentporter
 * Edited 10/18/17 by brentporter
 * Edited 10/23/17 by brentporter
 */

module.exports = function(app,express) {
    var pgDbConnect = require('pg');
    var dbUrl = "tcp://<YourUserName>:<YourPassword>@<YourIP_or_URL_to_DBSvr>/<Name_of_Schema>";

    var cors = require('cors');

    var forecastRainRouter = express.Router();
    var capMetroRouter = express.Router();

    var fetch = require('node-fetch');

    forecastRainRouter.get('/DataLookup/Forecast/',cors(),query_QPF_1Day,function(req,res,next){
        res.json(req.qpfForecast);
    });

    function query_QPF_1Day(req,res,next){
        var sqlQJson = "SELECT row_to_json(fc)"+
        "FROM (SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features "+
        "FROM (SELECT 'Feature' As type, "+
        "    ST_AsGeoJSON(lg.wkb_geometry)::json As geometry,"+
        "    (SELECT row_to_json(t) "+
        "FROM (SELECT id, qpf) t ) As properties "+
        "FROM qpf24hr_day1_oct14 As lg   ) As f )  As fc;";
        var sqlQ = "SELECT * FROM qpf24hr_day1_oct14;";
        pgDbConnect.connect(dbUrl,function(err,client) {
            client.query(sqlQJson, function (err, results) {
                if (err) {
                    console.error(err);
                    res.statusCode = 500;
                    return res.json({errors: ["Could not retrieve Forecast Rain"]});
                }
                // No results returned mean the object is not found
                if (results.rows[0].Description === null || results.rows.length === 0 || results == null) {
                    // We are able to set the HTTP status code on the res object
                    res.statusCode = 404;
                    return res.json({errors: ["Forecast Rain not found"]});
                }
                console.log(results.rows[0]);
                req.qpfForecast = results.rows[0].row_to_json;
                client.release();
                next();
            });
        })
    }

    capMetroRouter.get('/DataLookup/Capmetro/:route/:dir',cors(),queryCapMetro, function(req,res,next) {
       res.json(req.capRoutes);
    });

    //query CapMetro Upcoming Pickup Times
    capMetroRouter.get('/DataLookup/Capmetro/StopTimes/:route/:stopid',cors(),queryCapMetroUpcomingPickupTimes, function(req,res,next) {
        res.json(req.stopTimes);
    });

    capMetroRouter.param('route', function (req, res, next, route) {
        console.log("Testing on " + route);
        if (isInt(route)) {
            req.route = route;
            next();
        } else {
            res.statusCode = 404;
            return res.json({errors: ["Route not constructed correctly or not recognized - please use numbers only"]});
        }


    });

    capMetroRouter.param('stopid', function (req, res, next, stopid) {
        console.log("Testing on " + stopid);
        if (isInt(stopid)) {
            req.stopid = stopid;
            next();
        } else {
            res.statusCode = 404;
            return res.json({errors: ["Stop ID not constructed correctly or not recognized - please use numbers only"]});
        }


    });

    capMetroRouter.param('dir', function (req, res, next, dir) {
        console.log("Testing on " + dir);
        switch(dir){
            case 'N':
                req.dir = dir;
                next();
                break;
            case 'S':
                req.dir = dir;
                next();
                break;
            case 'W':
                req.dir = dir;
                next();
                break;
            case 'E':
                req.dir = dir;
                next();
                break;
            default:
                res.statusCode = 404;
                return res.json({errors: ["Direction Parameter not constructed correctly or not recognized - please use only N, S, W, or E"]});
        }
    });

    function queryCapMetro(req,res,next){
        fetch('https://www.capmetro.org/planner/s_routetrace.asp?route='+req.params.route+'&dir='+req.params.dir+'&stoptrace=B&opt=1&cmp=1')
            .catch(function(err) {
                return res.json({errors: "Something went wrong with the route stops query - please try again later"});
             })
            .then(function(response) {
                return response.json();

            }).then(function(json){
                req.capRoutes = json.stops;
                next();
            });

    }

    function queryCapMetroUpcomingPickupTimes(req,res,next){
        //https://www.capmetro.org/planner/s_service.asp?tool=NB&output=json&stopid=5880&&route=803
        fetch('https://www.capmetro.org/planner/s_service.asp?tool=NB&output=json&stopid='+req.params.stopid+'&route='+req.params.route)
            .catch(function(err) {
                //console.log(err);
                return res.json({errors: "Something went wrong with the Bus Stop Upcoming Times query - please try again later"});
            })
            .then(function(response) {
                //console.log(response);
                return response.text();
            }).then(function(json){
                var strDivTimesIdx = json.lastIndexOf("[PDF]")+39;
                var strDivTimes = json.substring(strDivTimesIdx,json.lastIndexOf("</span>")+7);
                //console.log(strDivTimes);
                console.log(strDivTimes);
                //console.log(json);
                req.stopTimes = strDivTimes;
                next();
            });
    }


    app.use('/api', capMetroRouter);
    app.use('/api', forecastRainRouter);


};

function isInt(value) {
    return !isNaN(value) && (function(x) { return (x | 0) === x; })(parseFloat(value))
}


