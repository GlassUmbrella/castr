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
		error: null
	});
}

exports.post_create = function(req, res) {
	var validation = require("../lib/validation");
	
	// check podcast is unique
	var url = req.body.url.toLowerCase();
	
	validation.podcasts.isUrlUnique(url, function(result) {
		if(!result) {
			console.log("Url isn't unique!");
		}

		// check user hasnt reached their podcast limit
		var user = req.session.user;
		validation.users.hasReachedPodcastCountLimit(user.id, function(result) {
			if(!result) {
				console.log("Max podcasts reached!");
			}
	
			// create the podcast
			var Podcast = orm.model("Podcast");
			Podcast.create({
				title: req.body.title,
				description: req.body.description,
				coverLocation: "",
				url: url,
				ownerUserId: user.id
			}).success(function(podcast) {
				podcast.setUsers([user]);
				res.redirect("/podcasts/{0}".format(podcast.id));
			});
		});
	});
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