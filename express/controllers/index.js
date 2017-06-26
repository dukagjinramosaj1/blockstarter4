/**
 * Created by darshan on 26.06.17.
 */

var blockstarter = require('../../blockchain/blockstarter');
module.exports.controller = function(app) {

    /**
     * a home page route
     */
    app.get('/', function(req, res) {

         res.render('home')
    });
    /**
     * About Login route
     */
    app.get('/login', function(req, res) {
        // any logic goes here
        res.render('login')
    });

}