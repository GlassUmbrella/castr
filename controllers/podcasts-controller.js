var orm	= require("../lib/model");

exports.index = function(req, res) {
	var Podcast = orm.model("Podcast");
	var Episode = orm.model("Episode");
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
			}).failure(function(errors) {
				// TODO: handle failure
			});
	
			// redirect the user to that podcast's dashboard
		});
	});
}

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