/**
 * Created by darshan on 27.06.17.
 */
module.exports.controller = function(app) {

    /**
     * a home page route
     */
    app.get('/myprojects', function(req, res) {
        res.render('listProjects')
    });


}
