/**
 * Created by brentporter on 10/12/17.
 */

module.exports = function(app,express,postgres) {

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
        postgres.client.query(sqlQJson, function (err, results) {
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
            next();
        });
    }
    capMetroRouter.get('/DataLookup/Capmetro/',cors(), function(req,res,next) {
       res.send('Please Enter a Route Number (ex:803) and Direction (ex:N or S or W or E) after the trailing slash(/), separated by slashes in the url to retrieve stops along route (ex: /803/N)');
    });
    
    capMetroRouter.get('/DataLookup/Capmetro/:route/:dir',cors(),queryCapMetro, function(req,res,next) {
       res.json(req.capRoutes);
    });

    //queryCapMetroUpcomingPickupTimes
    capMetroRouter.get('/DataLookup/Capmetro/StopTimes/:route/:stopid',cors(),queryCapMetroUpcomingPickupTimes, function(req,res,next) {
        res.json(req.stopTimes);
    });

    function queryCapMetro(req,res,next){
        fetch('https://www.capmetro.org/planner/s_routetrace.asp?route='+req.params.route+'&dir='+req.params.dir+'&stoptrace=B&opt=1&cmp=1')
            .catch(function(err) {
             //console.log(err);
             return res.send("Something");
             })
            .then(function(response) {
                return response.json();
                //return res.json();
                //return res.send(res);
            }).then(function(json){
                //console.log(json);
                req.capRoutes = json.stops;
                next();
            });

    }

    function queryCapMetroUpcomingPickupTimes(req,res,next){
        //https://www.capmetro.org/planner/s_service.asp?tool=NB&output=json&stopid=5880&&route=803
        fetch('https://www.capmetro.org/planner/s_service.asp?tool=NB&output=json&stopid='+req.params.stopid+'&route='+req.params.route)
            .catch(function(err) {
                //console.log(err);
                return res.send("Something");
            })
            .then(function(response) {
                console.log(response);
                return response.text();
                //return res.json();
                //return res.send(res);
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


