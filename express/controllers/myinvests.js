/**
 * Created by darshan on 27.06.17.
 */
var blockstarter = require('../../blockchain/blockchain-connect');
module.exports.controller = function(app) {

    /**
     * a home page route
     */

    app.get('/myinvests', function(req, res) {
        blockstarter.getAllFundedStatus(req.session.address)
        //blockstarter.getAllStatus(req.session.address)
            .then(function (data) {
                res.render('investors',{data:data});
            }).catch((error) => {
            res.render('investors',{data:""});
        });
    });

    app.get('/myinvests/investInProject',function (req, res) {
        console.log(req.body.address)
        var projectAddress = req.body.projectAddress;
        var backer = req.body.backer;
        var amount = req.body.amount;
        if(req.body.projectAddress != "" && req.body.backer != "" && req.body.amount != ""){
            blockstarter.investInProject(req.session.address, projectAddress, backer, amount).then(function(data){console.log(data)});
            console.log("Investment added to project");
            res.redirect('/investedProjects');
        }
    });

}