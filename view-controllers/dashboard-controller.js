exports.index = function(req, res) {
	res.render("dashboard.html", {
		title: "Home",
		user: req.session.user,
		subdomain: req.subdomain
	});
};