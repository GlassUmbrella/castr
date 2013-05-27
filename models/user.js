//Getting the orm instance
var orm = require("../lib/model")
  , Seq = orm.Seq();

//Creating our module
module.exports = {
	model: {
		emailAddress: Seq.STRING,
		name: Seq.STRING,
		password: Seq.STRING
	}
}
