exports.index = function(req, res) {
	
};

exports.create = function (req, res) {
	res.render("podcast/create", { title: "Create your new podcast", error: null });
}

exports.post_create = function (req, res) {
	
}