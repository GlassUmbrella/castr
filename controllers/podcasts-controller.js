var orm	= require("../lib/model");

exports.index = function(req, res) {
	var Podcast = orm.model("Podcast");
	var user = req.session.user;
	var selectedPodcastId = 0;
	if(req.params.podcastId) {
		selectedPodcastId = req.params.podcastId;
	}
	
	Podcast.findAll({ where: { ownerUserId: user.id } })
	.success(function(podcasts) {
		res.render("podcasts/index", { 
			title: "My podcasts",
			activeTab: "podcasts",
			podcasts: podcasts, 
			selectedPodcastId : selectedPodcastId 
		});
	});
};

/**
 * Podcasts 
 */

exports.create = function(req, res) {
	res.render("podcasts/create", {
		title: "Create your new podcast",
		activeTab: "podcasts",
		hasReachedPodcastCountLimit: false,
		urlIsTaken: false,
		urlIsBanned: false
	});
}

exports.post_create = function(req, res) {
	var validation = require("../lib/validation");
	
	// check podcast is unique
	var url = req.body.url.toLowerCase();

	if(validation.podcasts.isUrlAllowed(url)) {
		validation.podcasts.isUrlUnique(url, function(result) {
			if(result) {
				// check user hasnt reached their podcast limit
				var user = req.session.user;
				validation.users.hasReachedPodcastCountLimit(user.id, function(result) {
					if(result) {
						res.render("podcasts/create", {
							title: "Create your new podcast",
							activeTab: "podcasts",
							hasReachedPodcastCountLimit: true,
							urlIsTaken: false,
							urlIsBanned: false
						});
						return;
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
						res.redirect("/podcasts/{0}".format(podcast.id));
					});
				});
			} else {
				res.render("podcasts/create", {
					title: "Create your new podcast",
					activeTab: "podcasts",
					hasReachedPodcastCountLimit: false,
					urlIsTaken: true,
					urlIsBanned: false
				});
			}
		});
	} else {
		res.render("podcasts/create", {
			title: "Create your new podcast",
			activeTab: "podcasts",
			hasReachedPodcastCountLimit: false,
			urlIsTaken: false,
			urlIsBanned: true
		});
	}
}

/**
 * Episodes 
 */

exports.episode = function(req, res) {
	var Episode = orm.model("Episode");
	var Podcast = orm.model("Podcast");

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
			res.render("podcasts/episode-create", { 
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
}

exports.post_episode = function(req, res) {
	var Episode = orm.model("Episode");
	var Podcast = orm.model("Podcast");
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
}

exports.episodeCreate = function(req, res) {
	var Podcast = orm.model("Podcast");

	Podcast.find({ where: { id: req.params.podcastId } })
	.success(function(podcast) {
		if (podcast) {
			res.render("podcasts/episode-create", { 
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
}

exports.post_episodeCreate = function(req, res) {
	var Podcast = orm.model("Podcast");
	var podcastId = req.params.podcastId;
	
	Podcast.find({ where: { id: podcastId } }).success(function(podcast) {
		// TODO: check if episode rate limit reached for podcast
		
		var Episode = orm.model("Episode");
		Episode.create({
			title: req.body.title,
			description: req.body.description,
			notes: req.body.notes,
			isPublished: false
		}).success(function(episode) {
			episode.setPodcast(podcast);
			res.redirect("/podcasts/{0}/episodes/{1}/?action=created".format(podcast.id, episode.id));
		});
	});
};