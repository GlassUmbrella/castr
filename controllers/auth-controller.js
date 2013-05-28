var orm		= require("../lib/model");
var bcrypt	= require("bcrypt-nodejs");
var uuid	= require("node-uuid");

exports.login = function(req, res) {
	if(req.session.user == null) {
		res.render("auth/login", { title: "Login" });
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
	req.session.user = null;
    res.redirect('/');
};

exports.signup = function(req, res) {
	if(req.session.user == null) {
		res.render("auth/signup", { title: "Signup", error: null });
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
			res.render("auth/signup", { title: "Signup", error: errors });
		});
	});
};


exports.forgot = function(req, res) {
	res.render("auth/forgot", { title: "Forgot Password", sent: false });
};

exports.post_forgot = function(req, res) {
	var Users = orm.model("user");

	Users.find({
		where: {
			emailAddress: req.body.emailAddress
		}
	}).success(function(user) {
		if(user) {
			var guid = uuid.v4();
			user.resetCode = guid;
			user.resetRequestTime = new Date();
			user.save().success(function() {
				var mailer = require("../lib/mailer");
				mailer.sendMail({
					from: "Castr Team <team@castr.net>",
				    to: user.emailAddress,
				    subject: "Castr Password Reset",
				    text: "Go here: http://" + req.headers.host + "/reset?resetCode=" + guid + "&emailAddress=" + user.emailAddress
				});
				res.render("auth/forgot", { title: "Forgot Password", sent: true });
			});
		} else {
			res.render("auth/forgot", { title: "Forgot Password", sent: false });
		}
	});
};

exports.reset = function(req, res) {
	res.render("auth/reset", { title: "Reset password", resetCode: req.query.resetCode, emailAddress: req.query.emailAddress, error: false });
};

exports.post_reset = function(req, res) {
	var Users = orm.model("user");

	Users.find({
		where: {
			resetCode: req.body.resetCode,
			emailAddress: req.body.emailAddress
		}
	}).success(function(user) {
		console.log("got user");
		var now = Math.round(new Date().getTime() / 1000);
		if(user && user.resetRequestTime > (now - (24 * 3600))) {
			console.log("within correct time");
			bcrypt.hash(req.body.newPassword, null, null, function(err, hash) {
				console.log("hashed password");
				user.password = hash;
				user.resetCode = null;
				user.resetRequestTime = null;
				user.save().success(function() {
					console.log("saved");
					req.session.user = user;
					res.redirect("/");
				});
			});
		} else {
			res.render("auth/reset", { title: "Reset password", resetCode: req.body.resetCode, emailAddress: req.body.emailAddress, error: true });
		}
	});
};