exports.index = function(req, res) {
	res.render("dashboard", { title: "Dashboard", user: req.session.user });
};

exports.splash = function(req, res) {
	if(req.session.user) {
		res.redirect("/dashboard");
	} else {
		res.render("splash");
	}
}