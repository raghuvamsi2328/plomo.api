const express = require("express");
const { createKid } = require("./kids.controller");
const { authJwt } = require("../../middleware/authJwt");

const kidsRouter = express.Router();

kidsRouter.post("/", authJwt, createKid);

module.exports = {
  kidsRouter
};
