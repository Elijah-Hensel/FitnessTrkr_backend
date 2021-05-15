const express = require("express");
const healthRouter = express.Router();

healthRouter.get("/", async (_, res, next) => {
    try {
      res.send({ message: "all is well" });
    } catch (err) {
      next({err});
    }
  });

  module.exports = healthRouter