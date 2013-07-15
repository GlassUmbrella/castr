exports.home = function(req, res) {
	if (!req.session.user) {
		res.render("public/index", { title: "Podcast to the world" });
	} else {
		res.redirect("/dashboard");
	}
};