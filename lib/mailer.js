var nodemailer = require("nodemailer");
var smptTransport;

this.init = function(options) {
	smtpTransport = nodemailer.createTransport("SMTP", options);
};

this.sendMail = function(options) {
	options.from = "Castr Team <team@castr.net>";
	options.forceEmbeddedImages = true;
	smtpTransport.sendMail(options, function(error, response) {
		if (error) {
			// log error
			console.log("Error sending email: " + error);
		}
	})
	smtpTransport.close();
};

this.sendPasswordReset = function(toAddress, baseAddress, fullName, resetURL) {
	var mailer = this;
	this.getEmailTemplate("password-reset", function(emailTemplate) {
		emailTemplate = emailTemplate.replaceAll("{HomeUrl}", baseAddress);
		emailTemplate = emailTemplate.replaceAll("{FullName}", fullName);
		emailTemplate = emailTemplate.replaceAll("{ResetURL}", resetURL);

		mailer.sendMail({
		    to: toAddress,
		    subject: "Castr Password Reset",
		    html: emailTemplate
		});
	});
};

this.sendInviteCode = function(toAddress, baseAddress, fullName, registerURL) {
	var mailer = this;
	this.getEmailTemplate("invite", function(emailTemplate) {
		emailTemplate = emailTemplate.replaceAll("{HomeUrl}", baseAddress);
		emailTemplate = emailTemplate.replaceAll("{FullName}", fullName);
		emailTemplate = emailTemplate.replaceAll("{RegisterURL}", registerURL);

		mailer.sendMail({
		    to: toAddress,
		    subject: "Castr Invite",
		    html: emailTemplate
		});
	});
};

this.getEmailTemplate = function(name, callback) {
	var fs = require("fs");
	fs.readFile("resources/email-templates/" + name + ".html", "utf8", function(err, data) {
		if(err) {
			return console.log(err); //Somehow stop dodgy email from being sent? e.g. the template was missing.
		}
		return callback(data);
	});
};