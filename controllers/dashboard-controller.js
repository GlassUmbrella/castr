exports.index = function(req, res) {
	res.render("dashboard", { title: "Dashboard", user: req.session.user });
};