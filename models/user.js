//Getting the orm instance
var orm = require("../lib/model")
  , Seq = orm.Seq();

//Creating our module
module.exports = {
	model: {
		emailAddress: {
			type: Seq.STRING,
			validate: {
				notEmpty: true
			}
		},
		name: {
			type: Seq.STRING,
			validate: {
				notEmpty: true
			}
		},
		password: {
			type: Seq.STRING,
			validate: {
				notEmpty: true
			}
		},
		resetCode: {
			type: Seq.STRING
		},
		resetRequestTime: {
			type: Seq.DATE
		}
	}
}
