/**
 * Created by darshan on 26.06.17.
 */

var blockstarter = require('../../blockchain/blockchain-connect');
module.exports.controller = function(app) {

    /**
     * a home page route
     */
    var project_count;
    blockstarter.getProjectCount()
      .then(count => project_count = count);

    app.get('/', function(req, res) {
        //console.log(req.session.address);
        res.render('home', {project_count:project_count});
    });
    /**
     * About Login route
     */
    app.get('/login', function(req, res) {
        // any logic goes here
        res.render('login')
    });

    app.post('/submit', function(req, res){
        if(req.body.address != "") {
            req.session.address = req.body.address;
            res.redirect('/');
        }else{
            res.redirect('/login');
        }
    });

    app.get('/logout',function(req,res){
        req.session.destroy();
        res.redirect('/');
    });
}
