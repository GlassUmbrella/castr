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
            allowNull: true
		},
		description: {
			type: Seq.STRING,
            allowNull: false
		},
		episodeNumber: {
			type: Seq.INTEGER,
            allowNull: true
		},
		audioLocation: {
			type: Seq.STRING,
            allowNull: false
		},
		notes: {
			type: Seq.STRING,
			allowNull: true
		},
		isPublished: {
			type: Seq.BOOLEAN,
			allowNull: false
		}
	},
    relations: {
    	belongsTo: [
	   		{ name: "Podcast" }
		]
    }
}
