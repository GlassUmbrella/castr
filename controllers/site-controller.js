var orm	= require("../lib/model");

//Runs for every route with a subdomain
exports.setupValues = function(req, res, next) {
	res.locals.userIsFollowingThisPodcast = true;
	res.locals.userOwnsThisPodcast = true;
	next();
}

exports.index = function(req, res, next) {
	var Episode = orm.model("Episode");
	var Podcast = orm.model("Podcast");
	var File = orm.model("File");
	var markdown = require("markdown").markdown;
	var moment = require("moment");

	var podcastDomain = req.subdomain;
	if(podcastDomain) {
		Podcast.find({ 
			where: { url: podcastDomain }
		}).success(function(podcast) {
			if (podcast) {
				Episode.findAll({ 
					where: { 
						PodcastId: podcast.id, 
						isPublished: true 
					},
					include: [File],
					order: "episodeNumber DESC"
				}).success(function(episodes) {
					res.render("site/index", { 
						title: podcast.title,
						activeTab: "home",
						podcast: podcast,
						episodes: episodes
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
	var File = orm.model("File");

	var podcastDomain = req.subdomain;
	if (podcastDomain) {
		Podcast.find({ where: { url: podcastDomain } })
		.success(function(podcast) {
			if (podcast) {
				Episode.find({ 
					where: { 
						PodcastId: podcast.id, 
						episodeNumber: req.params.episodeNumber 
					},
					include: [File]
				}).success(function(episode) {
					if (episode) {
						// find next and previous episodes
						Episode.count({ 
							where: { 
								PodcastId: podcast.id, 
								episodeNumber: parseInt(req.params.episodeNumber) + 1,
								isPublished: true
							}
						}).success(function(nextEpisodeCount) {
							var nextEpisodeExists = nextEpisodeCount > 0;
							Episode.count({ 
								where: { 
									PodcastId: podcast.id, 
									episodeNumber: parseInt(req.params.episodeNumber) - 1,
									isPublished: true
								}
							}).success(function(previousEpisodeCount) {
								var previousEpisodeExists = previousEpisodeCount > 0;
								res.render("site/episode", { 
									title: episode.title, 
									episode: episode, 
									podcast: podcast, 
									nextEpisodeExists: nextEpisodeExists,
									previousEpisodeExists: previousEpisodeExists,
									activeTab: ""
								});
							});
						});
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

exports.mail = function(req, res, next) {
	var Podcast = orm.model("Podcast");

	Podcast.find({ where: { url: req.subdomain }})
	.success(function(podcast) {
		if (podcast) {
			res.render("site/mail", { 
				title: "Contact",
				activeTab: "mail",
				podcast: podcast
			});
		} else {
			return 404;
		}
	});
}