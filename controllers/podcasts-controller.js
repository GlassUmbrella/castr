var orm	= require("../lib/model");

exports.index = function(req, res) {
	
};

exports.create = function (req, res) {
	res.render("podcast/create", { title: "Create your new podcast", error: null });
}

exports.post_create = function (req, res) {
	// check podcast is unique
	
	
	// check user hasnt reached their podcast limit
	
	// create the podcast
	
	// redirect the user to that podcast's dashboard
}

// api

exports.isUrlUnique = function (req, res) {
	
}

// helpers

this.isUrlUnique = function (url) {
	var Podcasts = orm.model("Podcasts");
	Podcasts.count({ where: { url: url }}).success(function (count) {
		return count == 0;
	});
}