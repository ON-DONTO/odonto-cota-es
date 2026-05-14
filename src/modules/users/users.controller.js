'use strict';

const usersService = require('./users.service');

async function list(req, res, next) {
  try {
    const users = await usersService.listAll();
    res.json(users);
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    await usersService.deleteUser(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  list,
  remove
};
