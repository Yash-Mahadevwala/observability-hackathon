const userService = require("../services/userService");

exports.createUser = async (req, res) => {
  const user = await userService.createUser(req.body);
  res.json(user);
};

exports.getUsers = async (req, res) => {
  const users = await userService.getUsers();
  res.json(users);
};

exports.deleteUser = async (req, res) => {
  const deleted = await userService.deleteUser(req.params.id);
  if (!deleted) return res.status(404).json({ message: "User not found" });
  res.json({ message: "User deleted", user: deleted });
};