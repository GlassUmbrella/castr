exports.home = function(req, res) {
	res.render("public/index", { title: "Show your podcast to the world. " });
};