var orm	= require("../lib/model");

exports.list = function(req, res) {
  res.json({ result: "List of users" });
};

exports.isUrlUnique = function(req, res) {
	var url = req.get.url.tolower();
	var Podcast = orm.model("Podcast");
	Podcast.count({ where: { url: url }})
	.success(function(podcastCount) {
		if (podcastCount && podcastCount == 0) {
			res.json( { result: true } );
		} else {
			res.json( { result: false } );
		}
	});
};

exports.latestEpisode = function(req, res) {
	var podcastId = req.params.podcastId;
	var Episode = orm.model("Episode");
	Episode.find({ where: { PodcastId: podcastId }})
	.success(function(episode) {
		if (episode) {
			return res.json({ result: { episode: episode }});
		}
	});
}

exports.numberOfEpisodes = function(req, res) {
	var podcastId = req.params.podcastId;
	var Episode = orm.model("Episode");
	Episode.count({ where: { PodcastId: podcastId }})
	.success(function(episodeCount) {
		if (episodeCount) {
			return res.json({ result: episodeCount });
		}
	});
}