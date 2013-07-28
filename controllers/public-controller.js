exports.home = function(req, res, next) {
	if (!req.session.user) {
		res.render("public/index", { title: "Podcast to the world" });
	} else {
		res.redirect("/feed");
	}
};

exports.apps = function(req, res, next) {
	res.render("public/apps", { title: "Apps" });
};