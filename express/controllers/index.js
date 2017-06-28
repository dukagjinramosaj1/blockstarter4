/**
 * Created by darshan on 26.06.17.
 */

var blockstarter = require('../../blockchain/blockchain-connect');
module.exports.controller = function(app) {

    /**
     * a home page route
     */



    app.get('/', (req,res) => {
      const promises = [blockstarter.getProjectCount(), blockstarter.getAllStatus()]
      Promise.all(promises)
      .then(result =>{
        res.render('home', {project_count:result[0],projects:result[1]});
      });
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
