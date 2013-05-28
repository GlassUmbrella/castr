var orm = require("../lib/model");
var bcrypt = require("bcrypt-nodejs");

exports.login = function(req, res) {
	if(req.session.user == null) {
		res.render("login", { title: "Login" });
	} else {
		res.redirect('/');
	}
};

exports.post_login = function(req, res) {
	var Users = orm.model("user");
	
	var request = req;
	var responce = res;
	
	Users.find({
		where: {
			emailAddress: req.body.loginEmail
		}
	}).success(function(user) {
		bcrypt.compare(req.body.loginPassword, user.password, function(err, res) {
			if(res) {
				request.session.user = user;
				responce.redirect("/");
			}
		});
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
	
	bcrypt.hash(req.body.signupPassword, null, null, function(err, hash) {
		Users.create({
			name: req.body.signupName,
			emailAddress: req.body.signupEmail,
			password: hash
		}).success(function(user) {
			req.session.user = user;
			res.redirect("/");
		}).error(function(errors) {
			res.render("signup", { title: "Signup", error: errors });
		});
	});
};