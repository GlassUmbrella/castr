var orm = require("../lib/model");

exports.login = function(req, res) {
	if(req.session.user == null) {
		res.render("login", { title: "Login" });
	} else {
		res.redirect('/');
	}
};

exports.performLogin = function(req, res) {
	var Users = orm.model("user");
	
	Users.find({ where: { emailAddress: req.body.loginEmail, password: req.body.loginPassword } }).success(function(user) {
		req.session.user = user;
		res.redirect("/");
	});
};

exports.logout = function(req, res) {
	req.session.destroy(function() {
    	res.redirect('/');
	});
};