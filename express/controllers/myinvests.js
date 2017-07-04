/**
 * Created by darshan on 27.06.17.
 */
var blockstarter = require('../../blockchain/blockchain-connect');
module.exports.controller = function(app) {

    // My Investments Page: Fetch all Projects in which the User has invested.
    app.get('/myinvests', function(req, res) {
        blockstarter.getAllFundedStatus(req.session.address)
        //blockstarter.getAllStatus(req.session.address)
            .then(function (data) {
                res.render('investors',{data:data});
            }).catch((error) => {
            res.render('investors',{data:""});
        });
    });

    // Invest in a project.
    app.get('/myinvests/investInProject',function (req, res) {
        console.log(req.body.address)
        var backer = req.body.backer;
        var amount = req.body.amount;
        if(req.body.projectAddress != "" && req.body.backer != "" && req.body.amount != ""){
            blockstarter.investInProject(req.session.address, backer, amount)
                .then(function(data){console.log(data)});
            console.log("Investment added to project");
            res.redirect('/myinvests');
        }
    });

    // Detail Page of Project(referenced from MyInvestments Page)
    app.get('/myinvests/:id/investorsview', function(req, res) {
        var address = req.params.id;
        blockstarter.getProjectStatusForAddress(address).then(function(data){
            res.render('investorsviews',{data:data});
        });
    });
}