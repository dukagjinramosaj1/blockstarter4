/**
 * Created by darshan on 27.06.17.
 */
var blockstarter = require('../../blockchain/blockchain-connect');
module.exports.controller = function(app) {

    // My Investments Page: Fetch all Projects in which the User has invested.
    app.get('/myinvests', function(req, res) {
        blockstarter.getAllFundedStatus(req.session.address)
            .then(function (data) {
              console.log(data)
                res.render('investors',{data:data, useraddr: req.session.coloredAddress});
            }).catch((error) => {
              console.error(error)
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
        var user = req.session.address
        Promise.all([
          blockstarter.getProjectStatusForAddress(address),
          blockstarter.getTokenForProjectForUser(address, user),
        ]).then(function(result){
            let data = result[0]
            data.token = result[1]
            data.pollyesperc = data.currentFunding ? data.proPoll / data.currentFunding * 100 : 0
            data.pollnoperc = data.currentFunding ? data.contraPoll / data.currentFunding * 100 : 0
            res.render('investorsviews',{data:data, useraddr: req.session.coloredAddress});
        });
    });

    app.get('/myinvests/:id/transfertokens', function(req, res){
        var projectAddress = req.params.id
        res.render('transfertokens', {projectAddress, useraddr: req.session.coloredAddress})
    });

    app.post('/myinvests/:id/transfertoken', function(req, res){
        const sender = req.session.address
        const receiver = req.body.address
        const amount = req.body.amount
        const projectAddress = req.params.id
        console.log(sender, receiver, amount)
        // TODO connect blockchain
        blockstarter.transferToken(req.params.id, sender, receiver, amount)
          .then(() => res.redirect(`/myinvests`))
          .catch(() => res.redirect('/'))
    });
}
