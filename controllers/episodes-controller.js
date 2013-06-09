var orm	= require("../lib/model");

exports.create = function(req, res) {
	var Podcast = orm.model("Podcast");
	var Episode = orm.model("Episode");
	var podcastId = req.params.podcastId;
	
	Podcast.find({ where: { id: podcastId }, include: [Episode] }).success(function(result) {
		var podcast = result;
	
		// TODO: check if episode limit reached for podcast
		
		console.log("Episodes: " + podcast.episodes);
		var episodeNumber = 1;
		if(podcast.episodes.length > 0) {
			var sortedEpisodes = podcast.episodes.sort(function(a, b) {
				return b.episodeNumber - a.episodeNumber;
			});
			
			episodeNumber = sortedEpisodes[0].episodeNumber + 1;
		}
	
		res.render("episodes/create", { title: "Create a new episode", podcast: podcast, episodeNumber: episodeNumber });
	});
};

exports.post_create = function(req, res) {
	var Podcast = orm.model("Podcast");
	var podcastId = req.params.podcastId;
	
	Podcast.find({ where: { id: podcastId } }).success(function(podcast) {
		// TODO: check if episode limit reached for podcast
		
		var Episode = orm.model("Episode");
		Episode.create({
			title: req.body.title,
			publishDate: new Date(),
			description: req.body.description,
			episodeNumber: req.body.episodeNumber,
			audioLocation: ""
		}).success(function(episode) {
			episode.setPodcast(podcast);
		});
	
		res.redirect("/podcasts/" + podcastId + "/episodes/" + req.body.episodeNumber);
	});
};

exports.episodesIndex = function(req, res) {
	var Episode = orm.model("Episode");
	var Podcast = orm.model("Podcast");
	
	Podcast.find({ where: { id: req.params.podcastId }, include: [Episode] }).success(function(podcast) {
		console.log(podcast);
		res.render("episodes/index", { title: "Episodes", podcast: podcast, episodes: podcast.episodes });
	});
};

exports.episode = function(req, res) {
	var Episode = orm.model("Episode");
	Episode.find({ where: { PodcastId: req.params.podcastId, episodeNumber: req.params.episodeNumber } })
	.success(function(episode) {
		res.render("episodes/episode", { title: episode.title, episode: episode });
	})
};