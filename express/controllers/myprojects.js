/**
 * Created by darshan on 27.06.17.
 */
var blockstarter = require('../../blockchain/blockchain-connect');
module.exports.controller = function(app) {

    // MyProject Page Fetch all Projects of the logged In User.
    app.get('/myprojects', function(req, res) {
        blockstarter.getAllOwnedStatus(req.session.address)
        // blockstarter.getAllStatus(req.session.address)
            .then(function (data) {
                res.render('listProjects',{data:data});
            }).catch((error) => {
            res.render('listProjects',{data:""});
        });
    });

    // View a Project: Detail Page of Project(referenced from MyProjects Page)
    app.get('/myprojects/:id/view', function(req, res) {
        var address = req.params.id;
        blockstarter.getProjectStatusForAddress(address).then(function(data){
            data.running = data.stage === 'Funding';
            data.runningAndSuccessful = data.fundingGoalReached && data.running;
            res.render('view',{data:data});
        });
    });

    // Route for Creation of Project.
    app.get('/myprojects/createProject', function(req, res) {
        res.render('createProject');
    });

    // Post Route of Project Creation.
    app.post('/myprojects/addProject',function (req, res) {
        var title = req.body.title;
        var description = req.body.description;
        var fundinggoal = req.body.fundinggoal;
        if(req.body.title != "" && req.body.description != "" && req.body.fundinggoal != ""){
            blockstarter.createProject(req.session.address, title, description, fundinggoal).then(function(data){
                res.redirect('/myprojects');
            });
        }
    });

    // Cancel Project and Refund money.
    app.get('/myprojects/:id/cancel', function(req, res) {
        var address = req.params.id;
        var owner = req.session.address;
        blockstarter.cancelAndRefundProject(address,owner).then(function(data){
            console.log(data);
            res.redirect('/myprojects');
        }).catch(console.log);
    });

    // End Funding and Withdraw
    app.get('/myprojects/:address/end', function(req, res) {
        var address = req.params.address;
        var owner = req.session.address;
        blockstarter.endFunding(address,owner).then(function (data) {
            res.redirect('/myprojects/' + address + '/view');
        })
    });
}