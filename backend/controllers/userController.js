const userService = require("../services/userService");

exports.createUser = async (req, res) => {
  const user = await userService.createUser(req.body);
  res.json(user);
};

exports.getUsers = async (req, res) => {
  const users = await userService.getUsers();
  res.json(users);
};