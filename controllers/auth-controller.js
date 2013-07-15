var orm		= require("../lib/model");
var bcrypt	= require("bcrypt-nodejs");
var uuid	= require("node-uuid");

exports.login = function(req, res) {
	res.render("auth/login", { title: "Login", message: null });
};

exports.post_login = function(req, res) {
	var Users = orm.model("User");
	var invalidCredentialsMessage = "The username or password you entered is incorrect.";
	
	Users.find({
		where: {	
			emailAddress: req.body.loginEmail
		}
	}).success(function(user) {
		if(user) {
			bcrypt.compare(req.body.loginPassword, user.password, function(err, response) {
				if(response) {
					req.session.user = user;
					res.redirect("/dashboard"); //Login sucessfull
				} else {
					res.render("auth/login", { title: "Login", message: invalidCredentialsMessage }); //Password is wrong
				}
			});
		} else {
			res.render("auth/login", { title: "Login", message: invalidCredentialsMessage }); //Email does not exist
		}
	});
};

exports.logout = function(req, res) {
	req.session.user = null;
    res.redirect('/');
};

exports.join = function(req, res) {
	res.render("auth/join", { title: "Join", inviteCode: req.query.inviteCode, emailAddress: req.query.emailAddress, name: req.query.name, error: false });
};

exports.post_join = function(req, res) {
	var Users = orm.model("User");
	var Invites = orm.model("Invite");
	
	Invites.find({
		where: {	
			dateActivated: null,
			createdUserId: null,
			inviteCode: req.body.signupInviteCode
		}
	}).success(function(invite) {
		if(invite) {
			bcrypt.hash(req.body.signupPassword, null, null, function(err, hash) {
				Users.create({
					name: req.body.signupName,
					emailAddress: req.body.signupEmail,
					password: hash
				}).success(function(user) {
					req.session.user = user;
					invite.dateActivated = new Date();
					invite.createdUserId = user.id;
					invite.save();
					res.redirect("/");
				}).error(function(errors) {
					res.render("auth/join", { title: "Join", error: errors });
				});
			});
		}
	});
};

exports.requestInvite = function(req, res) {
	res.render("auth/request-invite", { title: "Request Invite", error: null, sent: false });
};

exports.post_requestInvite = function(req, res) {
	var Invites = orm.model("Invite");
	
	Invites.create({
		name: req.body.signupName,
		emailAddress: req.body.signupEmail,
		inviteCode: uuid.v4(),
		dateRequested: new Date()
	}).success(function(invite) {
		res.render("auth/request-invite", { title: "Request Invite", error: null, sent: true });
	}).error(function(errors) {
		res.render("auth/request-invite", { title: "Request Invite", error: errors, sent: false });
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
				    html: "<p>To reset your password <a href='http://" + req.headers.host + "/reset?resetCode=" + guid + "&emailAddress=" + user.emailAddress + "'>click here</a>!</p>"
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