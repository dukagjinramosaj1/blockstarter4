/**
 * Created by darshan on 26.06.17.
 */

var blockstarter = require('../../blockchain/blockchain-connect');
module.exports.controller = function(app) {

    /**
     * a home page route
     * fetch all projects to display on homescreen
     */
    app.get('/', (req,res) => {
        const promises = [blockstarter.getProjectCount(), blockstarter.getAllStatus()]
        Promise.all(promises)
          .then(result => {
            res.render('home', {project_count: result[0], data: result[1]});
          })
          .catch(() => res.render('error', { errorMsg: 'The blockchain seems to be not available' }))
    });

    /**
     * About Login route
     */
    app.get('/login', function(req, res) {
        // any logic goes here
        res.render('login')
    });

    /**
     * Login Post route
     */
    app.post('/submit', function(req, res){
        if(req.body.address != "") {
            req.session.address = req.body.address;
            res.redirect('/');
        }else{
            res.redirect('/login');
        }
    });

    /**
     * Logout route & Destroying User's Session
     */
    app.get('/logout',function(req,res){
        req.session.destroy();
        res.redirect('/');
    });

    /**
     * Detail Page of Project(referenced from Home Page)
     */
    app.get('/:id/detail', function(req, res) {
        var address = req.params.id;
        blockstarter.getProjectStatusForAddress(address).then(function(data){
            res.render('detail',{data:data});
        });

    });

    /**
     * Detail Page of Project(referenced from MyProjects Page)
     */
    app.get('/myprojects/:id/view', function(req, res) {
        var address = req.params.id;
        blockstarter.getProjectStatusForAddress(address).then(function(data){
            res.render('view',{data:data});
        });
    });

    /**
     * Detail Page of Project(referenced from MyInvestments Page)
     */
    app.get('/myinvests/:id/investorsview', function(req, res) {
        var address = req.params.id;
        blockstarter.getProjectStatusForAddress(address).then(function(data){
            res.render('investorsviews',{data:data});
        });
    });

    app.post('/:id/invest', function(req, res) {
        var address = req.params.id;
        var value = req.body.ether;
        var owner = req.session.address;
        blockstarter.investInProject(address,owner,value).then(function(data){
            console.log(data);
            res.redirect('/'+address+"/detail");
        }).catch(console.log);
    });
}
