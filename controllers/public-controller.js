exports.home = function(req, res) {
	res.render("public/index", { title: "Podcast to the world" });
};

exports.about = function(req, res) {
	res.render("public/about", { title: "About" });
};