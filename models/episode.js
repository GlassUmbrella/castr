//Getting the orm instance
var orm = require("../lib/model")
  , Seq = orm.Seq();

//Creating our module
module.exports = {
	model: {
		title: {
			type: Seq.STRING,
            allowNull: false
		},
		publishDate: {
			type: Seq.DATE,
            allowNull: false
		},
		description: {
			type: Seq.STRING,
            allowNull: false
		},
		episodeNumber: {
			type: Seq.INTEGER,
            allowNull: false
		},
		audioLocation: {
			type: Seq.STRING,
            allowNull: false
		}
	},
    relations: {
    	belongsTo: [
	   		{ name: "Podcast" }
		]
    }
}
