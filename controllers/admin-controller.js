var orm	= require("../lib/model");

exports.invites = function(req, res) {
	var Invites = orm.model("Invite");
	
	Invites.findAll().success(function(invites) {
		res.render("admin/invites", { 
			title: "Sent Invites",
			invites: invites
		});
	});
};

exports.post_send_invite = function(req, res) {
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
			mailer.sendMail({
				from: "Castr Team <team@castr.net>",
			    to: invite.emailAddress,
			    subject: "Castr Beta Invite",
			    forceEmbeddedImages: true,
			    html: "<h1>You have received a Castr beta invite code!</h1><p>" + invite.inviteCode + "</p> <p><a href='http://" + req.headers.host + "/join?inviteCode=" + invite.inviteCode + "&emailAddress=" + invite.emailAddress + "&name=" + invite.name + "'>Click here to join!</a></p>"
			});
			
			res.json(true);
			
		} else {
			res.json(false);
		}
	});
};