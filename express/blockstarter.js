var express = require('express');
var app = express();
var fs = require('fs');
var session = require('express-session');

app.disable('x-powered-by');

var handlebars = require('express-handlebars').create({defaultLayout:'main'});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.use(require('body-parser').urlencoded({extended: true}));

app.set('port', process.env.PORT || 3000);

app.use(express.static(__dirname + '/public'));

app.use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: true,
    saveUninitialized: true
}));

app.use(function(req, res, next){
    var err = req.session.error,
        msg = req.session.notice,
        success = req.session.success;

    if (err) res.locals.error = err;
    if (msg) res.locals.notice = msg;
    if (success) res.locals.success = success;

    if(req.session.address != undefined){
        res.locals.success = true;
        res.locals.error = ""
    }else{
        res.locals.error = "Please Login to use the App."
        res.locals.success = false;
    }
    next();
});


// dynamically include routes (Controller)
fs.readdirSync('./controllers').forEach(function (file) {
    if(file.substr(-3) == '.js') {
        route = require('./controllers/' + file);
        route.controller(app);
    }
});

app.use(function(req, res, next){
    console.log("Looking for URL : " + req.url);
    next();
});


// app.use(function(err, req, res, next){
//   console.log('Error : ' + err.message);
//   next();
// });

app.get('/listProjects', function(req, res){
    res.render('listProjects');
});

// app.get('/login', function(req, res){
//     res.render('login');
// });

// app.get('/investors', function(req, res){
//   res.render('investors');
// });
//
// app.get('/createProject', function(req, res){
//     res.render('createProject');
// });


function isloggin(){
    if(session.address){
        console.log("In If");
    }else{
        console.log("In else");
    }
}
// app.use(function(req, res){
//   res.type('text/html');
//   res.status(404);
//   res.render('404');
// });
//
// app.use(function(err, req, res, next){
//   console.error(err.stack);
//   res.status(500);
//   res.render('500');
// });


app.listen(app.get('port'), function(){
    console.log('Express started on http://localhost:' + app.get('port') + ' press Ctrl-C to terminate');
});