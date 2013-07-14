exports.home = function(req, res) {
	if (!req.session.user) {
		res.render("public/index", { title: "Podcast to the world" });
	} else {
		res.redirect("/dashboard");
	}
};

exports.about = function(req, res) {
	res.render("public/about", { title: "About" });
};