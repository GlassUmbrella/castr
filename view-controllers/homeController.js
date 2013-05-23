exports.index = function(req, res) {
	if(global.secure(req, res)) {
		res.render("index.html", {
			title: "Home",
			user: req.session.user,
			subdomain: global.subdomain
		});
	}
};