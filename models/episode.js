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
			type: Seq.TEXT,
            allowNull: false
		},
		episodeNumber: {
			type: Seq.INTEGER,
            allowNull: true
		},
		notes: {
			type: Seq.TEXT,
			allowNull: true
		},
		isPublished: {
			type: Seq.BOOLEAN,
			allowNull: false
		}
	},
    relations: {
		hasMany: [
       		{ name: "Progress" }
       	],
       	belongsTo: [
       		{ name: "Podcast" },
       		{ name: "File", foreignKey: "AudioFileId" }
       	]
    },
    options: {}
}
