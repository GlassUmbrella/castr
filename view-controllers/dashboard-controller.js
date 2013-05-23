exports.index = function(req, res) {
	res.render("dashboard.html", {
		title: "Dashboard",
		user: req.session.user,
		subdomain: req.subdomain
	});
};