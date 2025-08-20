const User = require('../models/user');

const createUser = async (data) => await User.create(data);
const getAllUsers = async () => await User.find();
const getUserById = async (id) => await User.findById(id);
const updateUser = async (id, data) => await User.findByIdAndUpdate(id, data);
const deleteUser = async (id) => await User.findByIdAndDelete(id);

module.exports = { createUser, getAllUsers, getUserById, updateUser, deleteUser };
