exports.index = function(req, res) {
	if(req.session.user != null) {
		res.render("index.html", { title: "Home", user: req.session.user, subdomain: global.subdomain });
	} else {
		res.redirect("/login");
	}
};