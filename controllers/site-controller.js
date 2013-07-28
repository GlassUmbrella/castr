var orm	= require("../lib/model");

exports.index = function(req, res, next) {
	var Episode = orm.model("Episode");
	var Podcast = orm.model("Podcast");
	var markdown = require("markdown").markdown;
	var moment = require("moment");

	var podcastDomain = req.subdomain;
	if(podcastDomain) {
		Podcast.find({ 
			where: { url: podcastDomain }
		}).success(function(podcast) {
			if(podcast) {
				Episode.findAll({ 
					where: { 
						PodcastId: podcast.id, 
						isPublished: true 
					},
					order: "episodeNumber DESC"
				})
				.success(function(episodes) {
					res.render("site/index", { 
						title: podcast.title, 
						podcast: podcast,
						episodes: episodes,
						markdown: markdown, // markdown parser
						moment: moment
					});
				});
			} else {
				res.status(404);
			}
		});
	} else {
		res.status(404);
	}
};

exports.episode = function(req, res, next) {
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
						res.render("site/episode", { title: episode.title, episode: episode, podcast: podcast });
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

exports.rss = function(req, res, next) {
	res.end("<xml>This is supposed to be a RSS feed.</xml>");
}

exports.itunes = function(req, res, next) {
	res.end("TODO: redirect to iTunes RSS");
}

exports.contact = function(req, res, next) {
	var Podcast = orm.model("Podcast");

	Podcast.find({ where: { url: req.subdomain }})
	.success(function(podcast) {
		if(podcast) {
			res.render("site/contact", { title: "Contact", podcast: podcast });
		} else {
			return 404;
		}
	});
}