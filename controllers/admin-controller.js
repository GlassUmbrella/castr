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