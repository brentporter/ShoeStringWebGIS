/**
 * Created by brentporter on 10/9/17
 * Edited 10/14/17 by brentporter
 * Edited 10/15/17 by brentporter
 * Edited 10/18/17 by brentporter
 * Edited 10/23/17 by brentporter
 */

module.exports = function(app,express) {

    var pgStraightUp = require('pg');
    var dbUrl = "tcp://<YourUserName>:<YourPassword>@<YourIP_or_URL_to_DBSvr>/<Name_of_Schema>";

    var cors = require('cors');

    var chartCountyHousing = express.Router();
    chartCountyHousing.get('/DataLookup/Dashboard/Chart/County/Housing/:fipsCode',cors(),query_ChartHousingCounty,function(req,res){
            res.json(req.housing_county_charts_json)
        }
    );

    chartCountyHousing.param('fipsCode', function (req, res, next, fipsCode) {
        console.log("Testing on " + fipsCode);
        if (isInt(fipsCode)) {
            req.fipsCode = fipsCode;
            next();
        } else {
            res.statusCode = 404;
            return res.json({errors: ["County FIPS not constructed correctly or not recognized"]});
        }


    });

    function query_ChartHousingCounty(req,res,next){
        var fipsCodeIn = req.params.fipsCode;
        var sqlQ = "SELECT hrr2017.housing_by_county_linked("+fipsCodeIn+")";
        pgStraightUp.connect(dbUrl, function(err,client) {
            client.query(sqlQ, function (err, results) {
                if (err) {
                    console.error(err);
                    res.statusCode = 500;
                    return res.json({errors: ["Could not retrieve Chart Info"]});
                }

                // No results returned mean the object is not found
                /*if (results.rows[0].Description === null || results.rows.length === 0 || results == null) {
                 // We are able to set the HTTP status code on the res object
                 res.statusCode = 404;
                 return res.json({errors: ["Chart Info not found"]});
                 }*/
                console.log(results.rows[0]);
                // By attaching a Photo property to the request
                // Its data is now made available in our handler function
                req.housing_county_charts_json = results.rows[0].housing_by_county_linked.datasource;
                client.release();
                next();
            });
        })
    }

    var chartCountyInfrastructure = express.Router();
    chartCountyInfrastructure.get('/DataLookup/Dashboard/Chart/County/Infrastructure/:fipsCode',cors(),query_ChartInfrastructureCounty,function(req,res){
        res.json(req.infrastructure_by_county_charts_json);
    });

    function query_ChartInfrastructureCounty(req,res,next) {
        var fipsCodeIn = req.params.fipsCode;
        var sqlQ = "SELECT hrr2017.infrastructure_by_county_json(" + fipsCodeIn + ")";
        pgStraightUp.connect(dbUrl, function (err, client) {
            client.query(sqlQ, function (err, results) {
                if (err) {
                    console.error(err);
                    res.statusCode = 500;
                    return res.json({errors: ["Could not retrieve Chart Info"]});
                }

                // No results returned mean the object is not found
                /*if (results.rows[0].Description === null || results.rows.length === 0 || results == null) {
                 // We are able to set the HTTP status code on the res object
                 res.statusCode = 404;
                 return res.json({errors: ["Chart Info not found"]});
                 }*/
                console.log(results.rows[0]);
                // By attaching a Photo property to the request
                // Its data is now made available in our handler function
                req.infrastructure_by_county_charts_json = results.rows[0].infrastructure_by_county_json.datasource;
                client.release();
                next();
                //done();
            });
            //pgStraightUp.release(client);
        })

    }

    var chartRolloutHousing = express.Router();
                        ///HurricaneRecoveryDashboard/views/api/DataLookup/Dashboard/Chart/Housing/
    chartRolloutHousing.get('/DataLookup/Dashboard/Chart/Housing/',cors(),query_ChartHousingRollup,function(req,res){
        res.json(req.housing_all_counties_charts_json)
        }
    );

    function query_ChartHousingRollup(req,res,next) {
        var sqlQ = "SELECT hrr2017.housing_all_counties_linked()";
        pgStraightUp.connect(dbUrl, function (err, client) {
            client.query(sqlQ, function (err, results) {
                if (err) {
                    console.error(err);
                    res.statusCode = 500;
                    return res.json({errors: ["Could not retrieve Chart Info"]});
                }

                // No results returned mean the object is not found
                /*if (results.rows[0].Description === null || results.rows.length === 0 || results == null) {
                 // We are able to set the HTTP status code on the res object
                 res.statusCode = 404;
                 return res.json({errors: ["Chart Info not found"]});
                 }*/
                console.log(results.rows[0]);
                // By attaching a Photo property to the request
                // Its data is now made available in our handler function
                req.housing_all_counties_charts_json = results.rows[0].housing_all_counties_linked.datasource;
                client.release();
                next();
            });
        })
    }

    var chartRolloutInfrastructure = express.Router();
    chartRolloutInfrastructure.get('/DataLookup/Dashboard/Chart/Infrastructure/',cors(),query_ChartInfrastructureRollup,function(req,res){
        res.json(req.infrastructure_all_counties_charts_json);
    });

    function query_ChartInfrastructureRollup(req,res,next) {
        var sqlQ = "SELECT hrr2017.infrastructure_all_counties_json()";
        pgStraightUp.connect(dbUrl, function (err, client) {
            client.query(sqlQ, function (err, results) {
                if (err) {
                    console.error(err);
                    res.statusCode = 500;
                    return res.json({errors: ["Could not retrieve Chart Info"]});
                }

                // No results returned mean the object is not found
                /*if (results.rows[0].Description === null || results.rows.length === 0 || results == null) {
                 // We are able to set the HTTP status code on the res object
                 res.statusCode = 404;
                 return res.json({errors: ["Chart Info not found"]});
                 }*/
                console.log(results.rows[0]);
                // By attaching a Photo property to the request
                // Its data is now made available in our handler function
                req.infrastructure_all_counties_charts_json = results.rows[0].infrastructure_all_counties_json.datasource;
                client.release();
                next();
            });
        })
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
            return res.json({errors: ["County FIPS not constructed correctly or not recognized"]});
        }


    });

    var damagePhotoExampleCollectionRouter = express.Router();

    damagePhotoExampleCollectionRouter.get('/DataLookup/DamagePhotos/Harvey/',cors(),query_Damage_Photos_Harvey,function(req,res){
        res.json(req.photoCollection);
    });

    function query_Damage_Photos_Harvey(req,res,next) {
        //var fipsCodeIn = req.params.fipsCode;
        var sqlQ = "SELECT * FROM damage_harvey_examples_photo_collection;";
        pgStraightUp.connect(dbUrl, function (err, client) {
            client.query(sqlQ, function (err, results) {
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
                client.release();
                next();
            });
        })
    }

    var dashboardRollupRouter = express.Router();

    dashboardRollupRouter.get('/DataLookup/Dashboard/Rollup/',cors(),query_Dashboard_Rollup,function(req,res){
        res.json(req.dashboardData);
    });

    function query_Dashboard_Rollup(req,res,next) {
        var sqlQ = "SELECT hrr2017.card_summaries_json()";
        pgStraightUp.connect(dbUrl, function (err, client) {
            client.query(sqlQ, function (err, results) {
                if (err) {
                    console.log(err);
                    res.statusCode = 500;
                    return res.json({errors: "Could not retrieve Card Summaries"});
                }

                if (results.rows[0].card_summaries_json === null || results.rows.length === 0 || results == null) {
                    res.statusCode = 404;
                    return res.json({errors: ["Declared JSON not found"]});
                }
                console.log(results.rows[0]);
                // By attaching a Photo property to the request
                // Its data is now made available in our handler function
                req.dashboardData = results.rows[0].card_summaries_json;
                client.release();
                next();
            })
        })
    }

    function query_Current_County_Redux(req,res,next) {
        //var fipsCodeIn = req.params.fipsCode;
        var sqlQ = "SELECT hrr2017.co_declared_json();";
        pgStraightUp.connect(dbUrl, function (err, client) {
            client.query(sqlQ, function (err, results) {
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
                client.release();
                next();
            });
        })
    }

    function query_Current_County_Impacted_Residences(req, res, next) {
        var fipsCodeIn = req.params.fipsCode;
        var sqlQ = "SELECT hrr2017.co_overview_json(" + fipsCodeIn + ");";
        pgStraightUp.connect(dbUrl, function (err, client) {
            client.query(sqlQ, function (err, results) {
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
                client.release();
                next();
            });
        })
    }


    app.use('/HurricaneRecoveryDashboard/views/api', countiesResidenceImpactRouter);
    app.use('/HurricaneRecoveryDashboard/views/api', dashboardRollupRouter);
    app.use('/HurricaneRecoveryDashboard/views/api', damagePhotoExampleCollectionRouter);
    app.use('/HurricaneRecoveryDashboard/views/api', chartRolloutInfrastructure);
    app.use('/HurricaneRecoveryDashboard/views/api', chartRolloutHousing);
    app.use('/HurricaneRecoveryDashboard/views/api', chartCountyHousing);
    app.use('/HurricaneRecoveryDashboard/views/api', chartCountyInfrastructure);

    /*app.get('/public/views/', function (req, res) {
        res.render('index'); // load the index.ejs file
    });

    app.get('/public/views', function (req, res) {
        res.render('index'); // load the index.ejs file
    });

    app.get('/Public/views/', function (req, res) {
        res.render('index'); // load the index.ejs file
    });*/

    app.get('/HurricaneRecoveryDashboard/views/', function (req, res) {
        res.render('index'); // load the index.ejs file
    });

    app.get('/HurricaneRecoveryDashboard/views', function (req, res) {
        res.render('index'); // load the index.ejs file
    });

    app.get('/hurricanerecoverydashboard/views/', function (req, res) {
        res.render('index'); // load the index.ejs file
    });
};

function isInt(value) {
    return !isNaN(value) && (function(x) { return (x | 0) === x; })(parseFloat(value))
}


