var orm	= require("../lib/model");
var bcrypt = require("bcrypt-nodejs");
var uuid = require("node-uuid");

exports.login = function(req, res) {
	res.render("auth/login", { title: "Login", message: null });
};

exports.post_login = function(req, res) {
	var Users = orm.model("User");
	var invalidCredentialsMessage = "The email address or password you entered is incorrect.";
	
	Users.find({
		where: {	
			emailAddress: req.body.loginEmail
		}
	}).success(function(user) {
		if(user) {
			bcrypt.compare(req.body.loginPassword, user.password, function(err, response) {
				if(response) {
					req.session.user = user;
					res.redirect("/feed"); //Login sucessfull
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
	res.render("auth/join", { 
		title: "Join", 
		inviteCode: req.query.inviteCode, 
		emailAddress: req.query.emailAddress, 
		name: req.query.name, 
		error: false 
	});
};

exports.post_join = function(req, res) {
	var Users = orm.model("User");
	var Invites = orm.model("Invite");

	var inviteCode = req.body.signupInviteCode;
	var email = req.body.signupEmail.toLowerCase();
	
	Invites.find({
		where: {	
			dateActivated: null,
			createdUserId: null,
			inviteCode: inviteCode
		}
	}).success(function(invite) {
		if(invite || inviteCode == "magic") {
			bcrypt.hash(req.body.signupPassword, null, null, function(err, hash) {
				Users.count({ where: { emailAddress: email } }).success(function(count) {
					if (count > 0) {
						res.render("auth/join", { 
							title: "Join",
							inviteCode: req.body.signupInviteCode, 
							emailAddress: email, 
							name: req.body.signupName,  
							error: "We found an existing account with that email address. If you forgot your password, you can recover it by clicking the button below." 
						});
					} else {
						Users.create({
							name: req.body.signupName,
							emailAddress: email,
							password: hash	
						}).success(function(user) {
							req.session.user = user;
							if(invite) {
								invite.dateActivated = new Date();
								invite.createdUserId = user.id;
								invite.save();
							}
							res.redirect("/");
						});
					}
				});
			});
		} else {
			res.render("auth/join", { 
				title: "Join", 
				inviteCode: req.body.signupInviteCode, 
				emailAddress: email, 
				name: req.body.signupName,  
				error: "We didn't recognise that invite code." 
			});
		}
	});
};

exports.requestInvite = function(req, res) {
	res.render("auth/request-invite", { title: "Request Invite", error: null, sent: false });
};

exports.post_requestInvite = function(req, res) {
	var Invites = orm.model("Invite");
	
	if(req.body.signupName && req.body.signupEmail) {
		Invites.find({
			where: {	
				emailAddress: req.body.signupEmail
			}
		}).success(function(invite) {
			if(!invite) {
				Invites.create({
					name: req.body.signupName,
					emailAddress: req.body.signupEmail,
					inviteCode: uuid.v4(),
					dateRequested: new Date()
				}).success(function(invite) {
					var mailer = require("../lib/mailer");
					mailer.sendInQueue(invite.emailAddress, "http://" + req.headers.host, invite.name);
					res.render("auth/request-invite", { 
						title: "Request Invite", 
						error: null, 
						sent: true 
					});
				});
			} else {
				res.render("auth/request-invite", { 
					title: "Request Invite", 
					error: "You're already in the invite queue. Hang on tight, we're sending out invites as quick as we can..", 
					sent: false 
				});
			}
		});
	} else {
		res.render("auth/request-invite", { title: "Request Invite", error: "We need your name and email address.", sent: false });
	}
};

exports.forgot = function(req, res) {
	res.render("auth/forgot", { title: "Forgot Password", sent: false, error: false });
};

exports.post_forgot = function(req, res) {
	var Users = orm.model("User");

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
				var resetURL = "http://" + req.headers.host + "/reset?resetCode=" + guid + "&emailAddress=" + user.emailAddress;
				mailer.sendPasswordReset(user.emailAddress, "http://" + req.headers.host, user.name, resetURL);
				res.render("auth/forgot", { title: "Forgot Password", sent: true, error: false });
			});
		} else {
			res.render("auth/forgot", { title: "Forgot Password", sent: false, error: true });
		}
	});
};

exports.reset = function(req, res) {
	res.render("auth/reset", { title: "Reset password", resetCode: req.query.resetCode, emailAddress: req.query.emailAddress, error: false });
};

exports.post_reset = function(req, res) {
	var Users = orm.model("User");

	Users.find({
		where: {
			resetCode: req.body.resetCode,
			emailAddress: req.body.emailAddress
		}
	}).success(function(user) {
		var now = Math.round(new Date().getTime() / 1000);
		if(user && user.resetRequestTime > (now - (24 * 3600))) {
			bcrypt.hash(req.body.newPassword, null, null, function(err, hash) {
				user.password = hash;
				user.resetCode = null;
				user.resetRequestTime = null;
				user.save().success(function() {
					req.session.user = user;
					res.redirect("/");
				});
			});
		} else {
			res.render("auth/reset", { title: "Reset password", resetCode: req.body.resetCode, emailAddress: req.body.emailAddress, error: true });
		}
	});
};

exports.profile = function(req, res) {
	var user = req.session.user;
	res.render("auth/profile", { title: "Your details", updated: false, error: false, name: user.name, email: user.emailAddress });
};

exports.post_profile = function(req, res) {
	var Users = orm.model("User");

	Users.find({
		where: {
			id: req.session.user.id
		}
	}).success(function(user) {
		user.name = req.body.editName;
		user.emailAddress = req.body.editEmail;
		if(req.body.editPassword != null && req.body.editPassword != '') {
			bcrypt.hash(req.body.editPassword, null, null, function(err, hash) {
				user.password = hash;
				user.save().success(function() {
					req.session.user = user;
					res.render("auth/profile", { title: "Your details", updated: true, error: false, name: user.name, email: user.emailAddress });
				});
			});
		} else {
			user.save().success(function() {
				req.session.user = user;
				res.render("auth/profile", { title: "Your details", updated: true, error: false, name: user.name, email: user.emailAddress });
			});
		}
	});
};
