var nodemailer = require("nodemailer");
var smptTransport;

this.init = function(options) {
	smtpTransport = nodemailer.createTransport("SMTP", options);
}

// example code to send mail:
// var mailer = require("../lib/mailer");
// mailer.sendMail({
//     from: "Castr Team <team@castr.net>", // sender address
//     to: "weiran@zhang.me.uk", // list of receivers
//     subject: "Hello ✔", // Subject line
//     text: "Hello world ✔", // plaintext body
//     html: "<b>Hello world ✔</b>" // html body
// });

this.sendMail = function(options) {
	smtpTransport.sendMail(options, function(error, response) {
		if (error) {
			// log error
			console.log("Error sending email: " + error);
		}
	})
	smtpTransport.close();
}