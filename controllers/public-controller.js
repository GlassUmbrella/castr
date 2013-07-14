exports.home = function(req, res) {
	res.render("public/index", { title: "Show your podcast to the world." });
};

exports.about = function(req, res) {
	res.render("public/about", { title: "Some text about us" });
};