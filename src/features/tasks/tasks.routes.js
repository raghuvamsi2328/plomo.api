const express = require("express");
const { authJwt } = require("../../middleware/authJwt");
const { createTaskHandler, listTasksHandler } = require("./tasks.controller");

const tasksRouter = express.Router();

tasksRouter.post("/", authJwt, createTaskHandler);
tasksRouter.post("/list", authJwt, listTasksHandler);

module.exports = {
  tasksRouter
};
