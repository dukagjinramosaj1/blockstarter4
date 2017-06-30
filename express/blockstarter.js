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

app.listen(app.get('port'), function(){
    console.log('Blockstarter Platform started on http://localhost:' + app.get('port') + ' press Ctrl-C to terminate');
});
