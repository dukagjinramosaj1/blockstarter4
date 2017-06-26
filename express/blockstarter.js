var express = require('express');

var app = express();

app.disable('x-powered-by');

var handlebars = require('express-handlebars').create({defaultLayout:'main'});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.use(require('body-parser').urlencoded({extended: true}));

app.set('port', process.env.PORT || 3000);

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.render('home');
});

app.use(function(req, res, next){
  console.log("Looking for URL : " + req.url);
  next();
});

app.get('/junk', function(req, res, next){
  console.log('Tried to access /junk');
  throw new Error('/junk doesn\'t exist');
});

app.use(function(err, req, res, next){
  console.log('Error : ' + err.message);
  next();
});

app.get('/listProjects', function(req, res){
    res.render('listProjects');
});

app.get('/login', function(req, res){
    res.render('login');
});

app.get('/investors', function(req, res){
  res.render('investors');
});

app.get('/createProject', function(req, res){
    res.render('createProject');
});

app.get('/thankyou', function(req, res){
  res.render('thankyou');
});

var session = require('express-session');

var parseurl = require('parseurl');

app.use(function(req, res, next){
  var views = req.session.views;

  if(!views){
    views = req.session.views = {};
  }

  var pathname = parseurl(req).pathname;

  views[pathname] = (views[pathname] || 0) + 1;

  next();

});

app.get('/viewcount', function(req, res, next){
  res.send('You viewed this page ' + req.session.views['/viewcount'] + ' times');
});

var fs = require("fs");

app.get('/readfile', function(req, res, next){
  fs.readFile('./public/randomfile.txt', function(err, data){
      if(err){
        return console.error(err);
      }
      res.send("the File : " + data.toString());
  });
});

app.get('/writefile', function(req, res, next){
  fs.writeFile('./public/randomfile2.txt',
    'More random text', function(err){
      if(err){
        return console.error(err);
      }
    });

  fs.readFile('./public/randomfile2.txt', function(err, data){
    if(err){
      return console.error(err);
    }
    res.send("The File " + data.toString());
  });

});

app.use(function(req, res){
  res.type('text/html');
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render('500');
});


app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + ' press Ctrl-C to terminate');
});



