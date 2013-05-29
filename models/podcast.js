//Getting the orm instance
var orm = require("../lib/model")
  , Seq = orm.Seq();

//Creating our module
module.exports = {
	model: {
		name: {
			type: Seq.STRING,
            allowNull: false
		}
	},
    relations:{
       hasMany: [
       		{ name: "Episode" },
       		{ name: "PodcastUsers" }
       ]
    }
}
