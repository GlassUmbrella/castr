var orm	= require("../lib/model");

exports.isUrlUnique = function(req, res) {
	var url = req.get.url.tolower();
	var Podcast = orm.model("Podcast");
	Podcast.count({ where: { url: url }})
	.success(function(podcastCount) {
		if (podcastCount && podcastCount == 0) {
			res.json({ result: true });
		} else {
			res.json({ result: false });
		}
	});
};

exports.list = function(req, res) {
	var Podcast = orm.model("Podcast");

	Podcast.findAll({ where: { ownerUserId: req.session.user.id } })
	.success(function(podcasts) {
		if (podcasts) {
			res.json({ result: podcasts });
		} else {
			res.json({ result: [] });
		}
	});
};

exports.episodes = function(req, res) {
	var podcastId = req.params.podcastId;
	var Podcast = orm.model("Podcast");
	var Episode = orm.model("Episode");

	Podcast.find({ where: { ownerUserId: req.session.user.id, id: podcastId }, include: [Episode]})
	.success(function(podcast) {
		if (podcast) {
			res.json({ result: podcast.episodes });
		} else {
			res.status(401);
		}
	});
};

exports.changeTitle = function(req, res) {
	var podcastId = req.params.podcastId;
	var Podcast = orm.model("Podcast");

	Podcast.find({ where: { ownerUserId: req.session.user.id, id: podcastId }})
	.success(function(podcast) {
		if (podcast) {
			podcast.title = req.params.newName;
			podcast.save().success(function() {
				res.json({ result: true });
			});
		} else {
			res.status(401);
		}
	});
};

exports.changeDescription = function(req, res) {
	var podcastId = req.params.podcastId;
	var Podcast = orm.model("Podcast");

	Podcast.find({ where: { ownerUserId: req.session.user.id, id: podcastId }})
	.success(function(podcast) {
		if (podcast) {
			podcast.description = req.params.newDescription;
			podcast.save().success(function() {
				res.json({ result: true });
			});
		} else {
			res.status(401);
		}
	});
};