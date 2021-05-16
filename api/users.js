const express = require("express");
const usersRouter = express.Router();
const { createUser, getUser } = require("../db/users");
const { getPublicRoutinesByUser } = require("../db/routines");
const jwt = require("jsonwebtoken");
const requireUser = require("./utils");

usersRouter.use((_, __, next) => {
  console.log("A request is being made to /users route");
  next();
});

usersRouter.post("/register", async (req, res, next) => {
  const { username, password } = req.body;
  try {
    if (password.length < 8) {
      res.send(next(error));
    }
    const user = await createUser({ username, password });

    const token = jwt.sign(
      {
        id: user.id,
        username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1w",
      }
    );

    res.send({
      message: "thank you for signing up",
      token,
      user,
    });

    // res.send({ user });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

usersRouter.post("/login", async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const user = await getUser({ username, password });
    console.log(password, user, "password check");
    if (user) {
      const token = jwt.sign(
        {
          id: user.id,
          username,
        },
        process.env.JWT_SECRET
      );
      res.send({ message: "You're logged in!", token, user });
    } else {
      next({
        name: "IncorrectCredentialsError",
        message: "Username or password is incorrect",
      });
    }
  } catch ({ name, message }) {
    next({ name: "error", message: "unable to log in user!" });
  }
});

usersRouter.get("/me", requireUser, async (req, res, next) => {
  try {
    res.send(req.user);
  } catch (err) {
    next(err);
  }
});

usersRouter.get("/:username/routines", async (req, res, next) => {
  try {
    const { username } = req.params;
    const publicRoutinesUser = await getPublicRoutinesByUser({ username });
    if (!publicRoutinesUser) {
      throw Error(`User does not have public routines.`);
    }
    res.send(publicRoutinesUser);
  } catch ({ name, message }) {
    next({ name, message });
  }
});

module.exports = usersRouter;
