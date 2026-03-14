const userRepo = require("../repositories/userRepository");

exports.createUser = async (data) => {
  return await userRepo.create(data);
};

exports.getUsers = async () => {
  return await userRepo.findAll();
};