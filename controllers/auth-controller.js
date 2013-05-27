var orm = require("../lib/model");

exports.login = function(req, res) {
	if(req.session.user == null) {
		res.render("login", { title: "Login" });
	} else {
		res.redirect('/');
	}
};

exports.post_login = function(req, res) {
	var Users = orm.model("user");
	
	Users.find({
		where: {
			emailAddress: req.body.loginEmail,
			password: req.body.loginPassword
		}
	}).success(function(user) {
		req.session.user = user;
		res.redirect("/");
	});
};

exports.logout = function(req, res) {
	req.session.destroy(function() {
    	res.redirect('/');
	});
};

exports.signup = function(req, res) {
	if(req.session.user == null) {
		res.render("signup", { title: "Signup", error: null });
	} else {
		res.redirect('/');
	}
};

exports.post_signup = function(req, res) {
	var Users = orm.model("user");
	
	Users.create({
		name: req.body.signupName,
		emailAddress: req.body.signupEmail,
		password: req.body.signupPassword
	}).success(function(user) {
		req.session.user = user;
		res.redirect("/");
	}).error(function(errors) {
		res.render("signup", { title: "Signup", error: errors });
	});
};