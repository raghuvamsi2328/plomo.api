const express = require("express");
const { signIn, parentLogin, kidsLogin } = require("./auth.controller");

const authRouter = express.Router();

authRouter.post("/signin", signIn);
authRouter.post("/login", parentLogin);
authRouter.post("/kid-login", kidsLogin);

module.exports = {
  authRouter
};
