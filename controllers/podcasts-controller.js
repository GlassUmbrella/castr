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
			title: "My podcasts", podcasts: podcasts, 
			selectedPodcastId : selectedPodcastId 
		});
	});
};

/**
 * Podcasts 
 */

exports.create = function(req, res) {
	res.render("podcasts/create", { title: "Create your new podcast", error: null });
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

exports.episode_create = function(req, res) {
	var Podcast = orm.model("Podcast");

	Podcast.find({ where: { id: req.params.podcastId } })
	.success(function(podcast) {
		if(podcast) {
			res.render("podcasts/episode-create", { 
					title: "Create a new episode", 
					podcast: podcast 
				});
		} else {
			res.status(404);
		}
	});
}

exports.post_episode_create = function(req, res) {
	var Podcast = orm.model("Podcast");
	var podcastId = req.params.podcastId;
	
	Podcast.find({ where: { id: podcastId } }).success(function(podcast) {
		// TODO: check if episode rate limit reached for podcast
		
		var Episode = orm.model("Episode");
		Episode.create({
			title: req.body.title,
			description: req.body.description,
			notes: req.body.notes,
			audioLocation: "",
			isPublished: false
		}).success(function(episode) {
			episode.setPodcast(podcast);
		});
	
		res.redirect("/podcasts/" + podcastId + "/episodes/" + req.body.episodeNumber);
	});
};