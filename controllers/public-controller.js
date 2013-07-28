exports.home = function(req, res, next) {
	if (!req.session.user) {
		res.render("public/index", { title: "Podcast to the world" });
	} else {
		res.redirect("/feed");
	}
};