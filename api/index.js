exports.index = function(req, res) {
  res.json({ result: "This is the API" });
};

exports.users = function(req, res) {
  res.json({ result: "This is the API for Users" });
};