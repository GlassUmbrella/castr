var orm	= require("../lib/model");

exports.index = function(req, res) {
	var Episode = orm.model("Episode");
	var Podcast = orm.model("Podcast");

	var podcastDomain = req.subdomain;
	if(podcastDomain) {
		Podcast.find({ where: { url: podcastDomain }, include: [Episode], orderBy: [Episode.episodeNumber] })
		.success(function(podcast) {
			if(podcast) {
				res.render("episodes/index", { title: "Episodes", podcast: podcast, episodes: podcast.episodes });
			} else {
				res.status(404);
			}
		});
	} else {
		res.status(404);
	}
};

exports.episode = function(req, res) {
	var Episode = orm.model("Episode");
	var Podcast = orm.model("Podcast");

	var podcastDomain = req.subdomain;
	if (podcastDomain) {
		Podcast.find({ where: { url: podcastDomain } })
		.success(function(podcast) {
			if(podcast) {
				Episode.find({ where: { PodcastId: podcast.id, episodeNumber: req.params.episodeNumber } })
				.success(function(episode) {
					if (episode) {
						res.render("episodes/episode", { title: episode.title, episode: episode, podcast: podcast });
					} else {
						res.status(404);
					}
				});
			} else {
				res.status(404);
			}
		});
	} else {
		res.status(404);
	}
};

exports.rss = function(req, res) {
	res.end("<xml>This is supposed to be a RSS feed.</xml>");
}

exports.itunes = function(req, res) {
	res.end("TODO: redirect to iTunes RSS");
}

exports.contact = function(req, res) {
	var Podcast = orm.model("Podcast");

	Podcast.find({ where: { url: req.subdomain }})
	.success(function(podcast) {
		if(podcast) {
			res.render("podcasts/contact", { title: "Contact", podcast: podcast });
		} else {
			return 404;
		}
	});
}