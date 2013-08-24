var orm	= require("../lib/model");

exports.index = function(req, res, next) {
	var user = req.session.user;

	var Podcast = orm.model("Podcast");
	Podcast.findAll({ where: { ownerUserId: user.id } })
	.success(function(podcasts) {
		if(podcasts.length == 0) {
			return res.redirect("/podcasts/create");
		} else if(podcasts.length == 1) {
			return res.redirect("/podcasts/{0}/episodes".format(podcasts[0].id));
		} else {
			return res.render("podcasts/podcast-list", { 
				title: "My podcasts",
				activeTab: "podcasts",
				podcasts: podcasts
			});
		}
	});
};

exports.stats = function(req, res, next) {
	var user = req.session.user;
	var podcastId = req.params.podcastId;

	var Podcast = orm.model("Podcast");
	Podcast.find({ where: { ownerUserId: user.id, id: podcastId } })
	.success(function(podcast) {
		res.render("podcasts/podcast-stats", {
			title: "stats - " + podcast.title,
			activeTab: "podcasts",
			activePodcastTab: "stats",
			podcast: podcast
		});
	});
};

exports.create = function(req, res, next) {
	var user = req.session.user;
	var Podcast = orm.model("Podcast");
	Podcast.findAll({ where: { ownerUserId: user.id } })
	.success(function(podcasts) {
		res.render("podcasts/podcast-create", {
			title: "Create your new podcast",
			activeTab: "podcasts",
			hasReachedPodcastCountLimit: false,
			urlIsTaken: false,
			urlIsBanned: false,
			hasOtherPodcasts: podcasts.length > 0
		});
	});
};

exports.post_create = function(req, res, next) {
	var validation = require("../lib/validation");
	
	// check podcast is unique
	var url = req.body.url.toLowerCase();

	var user = req.session.user;
	var Podcast = orm.model("Podcast");
	Podcast.findAll({ where: { ownerUserId: user.id } })
	.success(function(podcasts) {
		if(validation.podcasts.isUrlAllowed(url)) {
			validation.podcasts.isUrlUnique(url, function(isUnique) {
				if(isUnique) {
					// check user hasnt reached their podcast limit
					var user = req.session.user;
					validation.users.hasReachedPodcastCountLimit(user.id, function(reachedLimit) {
						if(reachedLimit) {
							return res.render("podcasts/podcast-create", {
								title: "Create your new podcast",
								activeTab: "podcasts",
								hasReachedPodcastCountLimit: true,
								urlIsTaken: false,
								urlIsBanned: false,
								hasOtherPodcasts: podcasts.length > 0
							});
						}

						var originalPosterFileId = req.body.originalPosterFileId > 0 ? req.body.originalPosterFileId : null;
						var smallPosterFileId = req.body.smallPosterFileId > 0 ? req.body.smallPosterFileId : null;
						var largePosterFileId = req.body.largePosterFileId > 0 ? req.body.largePosterFileId : null;
				
						// create the podcast
						var Podcast = orm.model("Podcast");
						Podcast.create({
							title: req.body.title,
							description: req.body.description,
							coverLocation: "",
							url: url,
							ownerUserId: user.id,
							OriginalPosterFileId: originalPosterFileId,
							SmallPosterFileId: smallPosterFileId,
							LargePosterFileId: largePosterFileId
						}).success(function(podcast) {
							podcast.setUsers([user]);
							res.redirect("/podcasts/{0}/episodes".format(podcast.id));
						});
					});
				} else {
					res.render("podcasts/podcast-create", {
						title: "Create your new podcast",
						activeTab: "podcasts",
						hasReachedPodcastCountLimit: false,
						urlIsTaken: true,
						urlIsBanned: false,
						hasOtherPodcasts: podcasts.length > 0
					});
				}
			});
		} else {
			res.render("podcasts/podcast-create", {
				title: "Create your new podcast",
				activeTab: "podcasts",
				hasReachedPodcastCountLimit: false,
				urlIsTaken: false,
				urlIsBanned: true,
				hasOtherPodcasts: podcasts.length > 0
			});
		}
	});
};

/**
 * Episodes 
 */

exports.episodeList = function(req, res, next) {
	var user = req.session.user;
	var podcastId = req.params.podcastId;

	var Podcast = orm.model("Podcast");
	var Episode = orm.model("Episode");
	Podcast.find({ where: { ownerUserId: user.id, id: podcastId }, include: [Episode], order: 'publishDate IS NULL DESC, publishDate DESC'})
	.success(function(podcast) {
		if(podcast) {
			res.render("podcasts/episode-list", {
				title: podcast.title,
				activeTab: "podcasts",
				activePodcastTab: "episodes",
				podcast: podcast
			});
		} else {
			next();
		}
	});
};

exports.episodeEdit = function(req, res, next) {
	var Podcast = orm.model("Podcast");
	var Episode = orm.model("Episode");

	var message = "";
	if (req.query.action == "saved") {
		message = "Episode draft updated.";
	} else if (req.query.action == "created") {
		message = "Episode draft created.";
	} else if (req.query.action == "published") {
		message = "Episode published!";
	}

	Episode.find({ 
		where: { 
			id: req.params.episodeId 
		}, 
		include: [Podcast]
	}).success(function(episode) {
		if (episode) {
			res.render("podcasts/episode-edit", { 
				title: "Edit episode",
				activeTab: "podcasts",
				episode: episode, 
				podcast: episode.podcast,
				isNew: false,
				message: message
			});
		} else {
			res.status(404);
		}
	});
};

exports.post_episodeEdit = function(req, res, next) {
	var Episode = orm.model("Episode");
	var episodeId = req.params.episodeId;
	var podcastId = req.params.podcastId;

	Episode.find({ where: { id: episodeId } })
	.success(function(episode) {
		episode.title = req.body.title;
		episode.description = req.body.description;
		episode.notes = req.body.notes;
		var fileId = req.body.fileId == "" ? null : req.body.fileId;
		episode.AudioFileId = fileId;

		if (req.body.publishAction == "true") {
			episode.isPublished = true;
			episode.publishDate = new Date();
			// get next episode number
			var Podcast = orm.model("Podcast");
			Podcast.find({ where: { id: podcastId } })
			.success(function(podcast) {
				episode.episodeNumber = ++podcast.currentEpisodeNumber;
				episode.save().success(function() {
					podcast.save().success(function() {
						res.redirect("/podcasts/{0}/episodes/{1}/?action=published".format(podcastId, episodeId));
					});
				});
			})
		} else {
			episode.save().success(function() {
				res.redirect("/podcasts/{0}/episodes/{1}/?action=saved".format(podcastId, episodeId));
			});
		}
	});
};

exports.episodeCreate = function(req, res, next) {
	var Podcast = orm.model("Podcast");
	Podcast.find({ where: { id: req.params.podcastId } })
	.success(function(podcast) {
		if (podcast) {
			res.render("podcasts/episode-edit", { 
					title: "Create a new episode", 
					activeTab: "podcasts",
					podcast: podcast,
					episode: { },
					isNew: true,
					message: ""
				});
		} else {
			res.status(404);
		}
	});
};

exports.post_episodeCreate = function(req, res, next) {
	var podcastId = req.params.podcastId;

	var Podcast = orm.model("Podcast");
	Podcast.find({ where: { id: podcastId } }).success(function(podcast) {
		// TODO: check if episode rate limit reached for podcast
		
		var fileId = req.body.fileId == "" ? null : req.body.fileId;

		var Episode = orm.model("Episode");
		Episode.create({
			title: req.body.title,
			description: req.body.description,
			notes: req.body.notes,
			AudioFileId: fileId,
			isPublished: false
		}).success(function(episode) {
			episode.setPodcast(podcast);
			res.redirect("/podcasts/{0}/episodes/{1}/?action=created".format(podcast.id, episode.id));
		});
	});
};