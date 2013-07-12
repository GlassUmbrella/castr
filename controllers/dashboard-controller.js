exports.index = function(req, res) {
	res.render("dashboard/index", { title: "Dashboard" });
};

exports.splash = function(req, res) {
	if(req.session.user) {
		res.redirect("/dashboard");
	} else {
		res.render("splash");
	}
}