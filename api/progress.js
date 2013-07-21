var orm	= require("../lib/model");

exports.post_progress = function(req, res) {
	var Progress = orm.model("Progress");
	var userId = req.session.user.id;
	var episodeId = req.params.episodeId;
	var time = req.body.time;

	Progress.findOrCreate({
		UserId: userId, 
		EpisodeId: episodeId
	}).success(function (progress) {
		res.json({ result: progress.time });
	});
}

exports.progress = function(req, res) {
	var Progress = orm.model("Progress");
	var userId = req.session.user.id;
	var episodeId = req.params.episodeId;
	var time = req.body.time;

	Progress.findOrCreate({
		UserId: userId, 
		EpisodeId: episodeId
	}).success(function (progress) {
		progress.time = time;
		progress.save();
		res.json({ result: true });
	});
}