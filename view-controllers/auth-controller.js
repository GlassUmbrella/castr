// mock users table
var users = [
	{
		email: "eddie@castr.net",
		password: "password",
		name: "Eddie Lee"
	}, 
	{
		email: "weiran@castr.net",
		password: "password",
		name: "Weiran Zhang"
	}
];

exports.login = function(req, res) {
	if(req.session.user == null) {
		res.render("login.html", { title: "Login" });
	} else {
		res.redirect('/');
	}
};

exports.performLogin = function(req, res) {
	for (var i = 0; i < users.length; i++) {
		if(users[i].email == req.body.loginEmail && users[i].password == req.body.loginPassword) {
			req.session.user = users[i];
		}
	};
	res.redirect("/");
};

exports.logout = function(req, res) {
	req.session.destroy(function() {
    	res.redirect('/');
	});
};