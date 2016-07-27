/**
 * isAuthenticated
 * @description :: Policy that inject user in `req` via JSON Web Token
 */

var passport = require('passport');

module.exports = function (req, res, next) {
    passport.authenticate('jwt', function (error, user, info) {
        console.log("#isAuthenticated ----> authenticate: " + JSON.stringify(user));
        if (error){
        	console.log("ERROR");
        	return res.serverError(error);
        }
        
        if (!user){ 
        	console.log("!USER");
        	return res.unauthorized(null, info && info.code, info && info.message);
        }
        console.log("#_Here12");
        req.user = user;
        console.log("#_Here13" + req.user);    
        next();
    })(req, res);
};
