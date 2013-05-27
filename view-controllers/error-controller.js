exports.handle500 = function(err, req, res, next) {
	if (err.status !== 500) next();
	
	res.send("500 error - something bad happened. The error was '" + err.message + "'");
};