var orm		= require("../lib/model");
var bcrypt	= require("bcrypt-nodejs");
var uuid	= require("node-uuid");

exports.login = function(req, res) {
	res.render("auth/login", { title: "Login" });
};

exports.post_login = function(req, res) {
	var Users = orm.model("Users");
	
	Users.find({
		where: {
			emailAddress: req.body.loginEmail
		}
	}).success(function(user) {
		if(user) {
			bcrypt.compare(req.body.loginPassword, user.password, function(err, responce) {
				if(responce) {
					req.session.user = user;
					res.redirect("/"); //Login sucessfull
				} else {
					res.render("auth/login", { title: "Login" }); //Password is wrong
				}
			});
		} else {
			res.render("auth/login", { title: "Login" }); //Email does not exist
		}
	});
};

exports.logout = function(req, res) {
	req.session.user = null;
    res.redirect('/');
};

exports.signup = function(req, res) {
	res.render("auth/signup", { title: "Signup", error: null });
};

exports.post_signup = function(req, res) {
	var Users = orm.model("Users");
	
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
	var Users = orm.model("Users");

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
				    forceEmbeddedImages: true,
				    html: "<img src='http://" + global.baseUrl + "/images/logo.png' /><p>To reset your password <a href='http://" + req.headers.host + "/reset?resetCode=" + guid + "&emailAddress=" + user.emailAddress + "'>click here</a>!</p>"
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
	var Users = orm.model("Users");

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