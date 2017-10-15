/**
 * Created by brentporter on 10/12/17.
 */

module.exports = function(app,express,postgres) {

    var cors = require('cors');

    var forecastRainRouter = express.Router();
    var capMetroRouter = express.Router();

    //var http = require('http');
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
            // By attaching a Photo property to the request
            // Its data is now made available in our handler function
            req.qpfForecast = results.rows[0].row_to_json;
            next();
        });
    }

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


    var countiesResidenceImpactRouter = express.Router();

    countiesResidenceImpactRouter.get('/DataLookup/County/RollupCounts/ResidencesImpacted/', cors(),function (req, res) {
        //res.send({ message: 'Please Enter a County FIPS code for data summary of impacted homes after the trailing /'});
        res.send('Please Enter a County FIPS code for data summary of impacted homes after the trailing slash(/) in the url');
    });
    countiesResidenceImpactRouter.get('/DataLookup/County/RollupCounts/ResidencesImpacted/:fipsCode',cors(), query_Current_County_Impacted_Residences, function (req, res) {
        res.json(req.countyDetails);
    });

    countiesResidenceImpactRouter.get('/DataLookup/County/Json/',cors(), query_Current_County_Redux, function (req, res) {
        res.json(req.countyDeclared);
    });

    countiesResidenceImpactRouter.param('fipsCode', function (req, res, next, fipsCode) {
        console.log("Testing on " + fipsCode);
        if (isInt(fipsCode)) {
            req.fipsCode = fipsCode;
            next();
        } else {
            res.statusCode = 404;
            return res.json({errors: ["County FIPS not constructed correctly"]});
        }


    });

    var damagePhotoExampleCollectionRouter = express.Router();

    damagePhotoExampleCollectionRouter.get('/DataLookup/DamagePhotos/Harvey/',cors(),query_Damage_Photos_Harvey,function(req,res){
        res.json(req.photoCollection);
    });

    function query_Damage_Photos_Harvey(req,res,next){
        //var fipsCodeIn = req.params.fipsCode;
        var sqlQ = "SELECT * FROM damage_harvey_examples_photo_collection;";
        postgres.client.query(sqlQ, function (err, results) {
            if (err) {
                console.error(err);
                res.statusCode = 500;
                return res.json({errors: ["Could not retrieve Damage Photos"]});
            }

            // No results returned mean the object is not found
            if (results.rows[0].Description === null || results.rows.length === 0 || results == null) {
                // We are able to set the HTTP status code on the res object
                res.statusCode = 404;
                return res.json({errors: ["Description not found"]});
            }
            console.log(results.rows[0]);
            // By attaching a Photo property to the request
            // Its data is now made available in our handler function
            req.photoCollection = results.rows;
            next();
        });
    }

    var dashboardRollupRouter = express.Router();

    dashboardRollupRouter.get('/DataLookup/Dashboard/Rollup/',cors(),query_Dashboard_Rollup,function(req,res){
        res.json(req.dashboardData);
    });

    function query_Dashboard_Rollup(req,res,next){
        var sqlQ = "SELECT hrr2017.card_summaries_json()";
        postgres.client.query(sqlQ,function(err,results){
            if(err){
                console.log(err);
                res.statusCode = 500;
                return res.json({errors:"Could not retrieve Card Summaries"});
            }

            if(results.rows[0].card_summaries_json === null || results.rows.length === 0 || results == null){
                res.statusCode = 404;
                return res.json({errors: ["Declared JSON not found"]});
            }
            console.log(results.rows[0]);
            // By attaching a Photo property to the request
            // Its data is now made available in our handler function
            req.dashboardData = results.rows[0].card_summaries_json;
            next();
        })
    }

    function query_Current_County_Redux(req,res,next){
        //var fipsCodeIn = req.params.fipsCode;
        var sqlQ = "SELECT hrr2017.co_declared_json();";
        postgres.client.query(sqlQ, function (err, results) {
            if (err) {
                console.error(err);
                res.statusCode = 500;
                return res.json({errors: ["Could not retrieve County Details"]});
            }

            // No results returned mean the object is not found
            if (results.rows[0].co_declared_json === null || results.rows.length === 0 || results == null) {
                // We are able to set the HTTP status code on the res object
                res.statusCode = 404;
                return res.json({errors: ["County FIPS not found"]});
            }
            console.log(results.rows[0]);
            // By attaching a Photo property to the request
            // Its data is now made available in our handler function
            req.countyDeclared = results.rows[0].co_declared_json;
            next();
        });
    }

    function query_Current_County_Impacted_Residences(req, res, next) {
        var fipsCodeIn = req.params.fipsCode;
        var sqlQ = "SELECT hrr2017.co_overview_json(" + fipsCodeIn + ");";
        postgres.client.query(sqlQ, function (err, results) {
            if (err) {
                console.error(err);
                res.statusCode = 500;
                return res.json({errors: ["Could not retrieve County Details"]});
            }

            // No results returned mean the object is not found
            if (results.rows[0].co_overview_json === null || results.rows.length === 0 || results == null) {
                // We are able to set the HTTP status code on the res object
                res.statusCode = 404;
                return res.json({errors: ["County FIPS not found"]});
            }

            // By attaching a Photo property to the request
            // Its data is now made available in our handler function
            req.countyDetails = results.rows[0].co_overview_json;
            next();
        });
    }


    app.use('/api', countiesResidenceImpactRouter);
    app.use('/api', dashboardRollupRouter);
    app.use('/api', damagePhotoExampleCollectionRouter);
    app.use('/api', capMetroRouter);
    app.use('/api', forecastRainRouter);

    app.get('/public/views/', function (req, res) {
        res.render('index'); // load the index.ejs file
    });

    app.get('/public/views', function (req, res) {
        res.render('index'); // load the index.ejs file
    });

    app.get('/Public/views/', function (req, res) {
        res.render('index'); // load the index.ejs file
    });

};

function isInt(value) {
    return !isNaN(value) && (function(x) { return (x | 0) === x; })(parseFloat(value))
}


