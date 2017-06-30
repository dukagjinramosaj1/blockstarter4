/**
 * Created by darshan on 27.06.17.
 */
var blockstarter = require('../../blockchain/blockchain-connect');
module.exports.controller = function(app) {

    app.get('/myprojects/view/:id', function(req, res) {
        res.render('view');
    });

    /**
     * MyProject Page Fetch all Projects of the logged In User.
     */
    app.get('/myprojects', function(req, res) {
        // blockstarter.getAllOwnedStatus(req.session.address)
        blockstarter.getAllStatus(req.session.address)
            .then(function (data) {
                res.render('listProjects',{data:data});
            }).catch((error) => {
                res.render('listProjects',{data:""});
        });
    });

    /**
     * Route for Creation of Project.
     */
    app.get('/myprojects/createProject', function(req, res) {
        res.render('createProject');
    });

    /**
     * Post Route of Project Creation.
     */
    app.post('/myprojects/addProject',function (req, res) {
        var title = req.body.title;
        var description = req.body.description;
        var fundinggoal = req.body.fundinggoal;

        if(req.body.title != "" && req.body.description != "" && req.body.fundinggoal != ""){
            blockstarter.createProject(req.session.address, title, description, fundinggoal).then(function(data){console.log(data)});
            res.redirect('/myprojects');
        }
    });
}
