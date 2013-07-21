var orm	= require("../lib/model");

exports.post_file = function(req, res) {
	var file = {
		url: req.body.url,
		filename: req.body.filename,
		mimetype: req.body.mimetype,
		size: req.body.size,
		key: req.body.key
	};

	var File = orm.model("File");
	File.create(file).success(function(file) {
		res.json({ result: file.id });
	});
}

exports.file = function(req, res) {
	var File = orm.model("File");
	File.find({ where: { id: req.params.fileId }}, function(file) {
		if (file) {
			return res.json({ result: file });
		} else {
			return res.json({ result: false });
		}
	})
}