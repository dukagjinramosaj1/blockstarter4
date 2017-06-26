/**
 * Created by darshan on 27.06.17.
 */
module.exports.controller = function(app) {

    /**
     * a home page route
     */
    app.get('/myinvests', function(req, res) {
        res.render('investors')
    });


}
