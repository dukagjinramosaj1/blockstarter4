/**
 * Created by darshan on 26.06.17.
 */

var blockstarter = require('../../blockchain/blockchain-connect');

function addColors(p) {
  const address = p.address.substring(p.address.indexOf('x') + 1);
  let i = 0
  let colors = {}
  let lastNumbers = [0,0]
  while (i < address.length) {
    const color = address.substring(i, i+6)
    colors[`x${i/6}`] = `#${color}`

    // calculate last two positions
    const chars = color.split('')
    for (let j = 0; j < chars.length; j++) {
      lastNumbers[j % 2] = lastNumbers[j % 2] + parseInt(chars[j], 16)
    }

    i = i + 6
  }
  lastNumbers[0] = lastNumbers[0] % 16
  lastNumbers[1] = lastNumbers[1] % 16
  colors[`x${i/6 - 1}`] = colors[`x${i/6 - 1}`] + lastNumbers[0].toString(16) + lastNumbers[1].toString(16)

  p.colors = colors
  return p
}

let x = {address: '0xc7bea5cdcb1b399f7f9a1d888271e09d29727813'}
addColors(x)
console.log(x)

module.exports.controller = function(app) {

    /*  home page route
        fetch all projects to display on homescreen */
    app.get('/', (req,res) => {
        const promises = [blockstarter.getProjectCount(), blockstarter.getAllStatus()]
        Promise.all(promises)
          .then(result => {
            const project_count = result[0]
            let data = result[1]

            // only display funding projects
            data = data.filter(project => project.stage === 'Funding')

            res.render('home', {project_count, data});
          })
          .catch(() => res.render('error', { errorMsg: 'The blockchain seems to be not available' }))
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
        blockstarter.getProjectStatusForAddress(address).then(function(data){
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
