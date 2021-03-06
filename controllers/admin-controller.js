var orm	= require("../lib/model");

exports.invites = function(req, res, next) {
	var Invites = orm.model("Invite");
	var moment = require("moment");
	
	Invites.findAll().success(function(invites) {
		res.render("admin/invites", { 
			title: "Invites",
			activeTab: "invites",
			invites: invites,
			moment: moment
		});
	});
};

exports.about = function(req, res, next) {
	var fs = require("fs");
	var moment = require("moment");
	
	fs.stat("app.js", function(err, stats) {
		res.render("admin/about", { 
			title: "About",
			activeTab: "about",
			published: stats.mtime,
			moment: moment
		});
	});
};

exports.users = function(req, res, next) {
	var Users = orm.model("User");
	var moment = require("moment");
	
	Users.findAll().success(function(users) {
		res.render("admin/users", { 
			title: "Users",
			activeTab: "users",
			users: users,
			moment: moment
		});
	});
};

exports.post_send_invite = function(req, res, next) {
	var Invites = orm.model("Invite");
	
	Invites.find({
		where: {
			id: req.body.id
		}
	}).success(function(invite) {
		if(invite) {
			invite.dateSent = new Date();
			invite.save();
			
			var mailer = require("../lib/mailer");
			var inviteURL = "{0}{1}".format(global.protocol, global.baseUrl) + "/join?inviteCode=" + invite.inviteCode + "&emailAddress=" + invite.emailAddress + "&name=" + invite.name;
			mailer.sendInviteCode(invite.emailAddress, "{0}{1}".format(global.protocol, global.baseUrl), invite.name, inviteURL);			
			res.json(true);
			
		} else {
			res.json(false);
		}
	});
};