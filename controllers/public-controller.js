exports.home = function(req, res, next) {
	if (!req.session.user) {
		res.render("public/index", { title: "Podcast to the world" });
	} else {
		res.redirect("/podcasts");
	}
};

exports.feedback = function(req, res, next) {
	res.render("public/feedback", { title: "Feedback" });
};

exports.support = function(req, res, next) {
	res.render("public/support", { title: "Support" });
};

exports.terms = function(req, res, next) {
	res.render("public/terms", { title: "Terms" });
};