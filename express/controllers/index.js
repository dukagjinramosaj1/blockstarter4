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

    /**
     * a home page route
     */
    app.get('/', function(req, res) {
        Promise.all([blockstarter.getProjectCount(), blockstarter.getAllStatus()])
          .then(arr => {
            res.render('home', {
              project_count: arr[0],
              projects: arr[1].map(proj => addColors(proj))
            })
          })
          .catch(console.error)
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
