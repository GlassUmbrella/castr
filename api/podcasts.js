var orm	= require("../lib/model");

exports.list = function(req, res) {
  res.json({ result: "List of users" });
};

exports.isUrlUnique = function(req, res) {
	// TODO
	res.json( { result: true } );
};