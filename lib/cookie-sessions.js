module.exports = function(name, domain) {
	return function(req, res, next) {
		req.session = req.signedCookies[name] || {};
	
		res.on("header", function(){
			res.cookie(name, req.session, { domain: domain, signed: true });
		});
		
		next();
	}
}