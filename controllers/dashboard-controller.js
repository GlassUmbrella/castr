exports.index = function(req, res) {
	var mailer = require("../lib/mailer");
	mailer.sendMail({
		from: "Castr Team <team@castr.net>", // sender address
	    to: "weiran@zhang.me.uk", // list of receivers
	    subject: "Hello ✔", // Subject line
	    text: "Hello world ✔", // plaintext body
	    html: "<b>Hello world ✔</b>" // html body
	});
	
	res.render("dashboard", {
		title: "Dashboard",
		user: req.session.user,
		subdomain: req.subdomain
	});
};