/**
 * Created by darshan on 26.06.17.
 */

var blockstarter = require('../../blockchain/blockchain-connect');
const colorize = require('../colorhelper')

module.exports.controller = function(app) {

    /*  home page route
        fetch all projects to display on homescreen */
    app.get('/', (req,res) => {
        const promises = [blockstarter.getProjectCount(), blockstarter.getAllStatus().then(colorize)]
        Promise.all(promises)
          .then(result => {
            const project_count = result[0]
            let data = result[1]
            console.log(data)

            // only display funding projects
            data = data.filter(project => project.stage === 'Funding')

            res.render('home', {project_count, data});
          })
          .catch((err) => {
            res.render('error', { errorMsg: 'The blockchain seems to be not available' })
            console.log(err)
          })
    });

    // About Login route
    app.get('/login', function(req, res) {
        // any logic goes here
        res.render('login')
    });



    // Login Post route
    app.post('/submit', function(req, res){
        if(req.body.address != "") {
            req.session.address = req.body.address;
            res.redirect('/');
        }else{
            res.redirect('/login');
        }
    });

    // Logout route & Destroying User's Session
    app.get('/logout',function(req,res){
        req.session.destroy();
        res.redirect('/');
    });

    // Detail Page of Project(referenced from Home Page)
    app.get('/:id/detail', function(req, res) {
        var address = req.params.id;
        blockstarter.getProjectStatusForAddress(address).then(colorize).then(function(data){
            data.pollyesperc = data.currentFunding ? data.proPoll / data.currentFunding * 100 : 0
            data.pollnoperc = data.currentFunding ? data.contraPoll / data.currentFunding * 100 : 0
            res.render('detail',{data:data});
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

    app.post('/:id/startPoll', function(req, res) {
        var address = req.params.id;
        var poll = req.body.poll;
        var owner = req.session.address;
        blockstarter.startPoll(address,owner,poll).then(() => {
            res.redirect('/myprojects/'+address+"/view");
        }).catch(console.log);
    });

    app.get('/:id/poll/yes', function(req, res) {
        var address = req.params.id;
        blockstarter.votePoll(address, req.session.address, true).then(() => res.redirect('/myinvests/'+address+"/investorsview"))
    })

    app.get('/:id/poll/no', function(req, res) {
        var address = req.params.id;
        blockstarter.votePoll(address, req.session.address, false).then(() => res.redirect('/myinvests/'+address+"/investorsview"))
    })
}
