var nodemailer = require("nodemailer");
var smptTransport;

this.init = function(options) {
	smtpTransport = nodemailer.createTransport("SMTP", options);
}

this.sendMail = function(options) {
	smtpTransport.sendMail(options, function(error, response) {
		if (error) {
			// log error
			console.log("Error sending email: " + error);
		}
	})
	smtpTransport.close();
}