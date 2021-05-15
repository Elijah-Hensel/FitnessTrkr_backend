// create an api router
// attach other routers from files in this api directory (users, activities...)
// export the api router
require("dotenv").config();
const apiRouter = require("express").Router();
const { getUserById } = require("../db/users");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;

apiRouter.use(async (req, res, next) => {
  const prefix = "Bearer ";
  const auth = req.header("Authorization");

  if (!auth) {
    // nothing to see here
    next();
  } else if (auth.startsWith(prefix)) {
    const token = auth.slice(prefix.length);

    try {
      const parsedToken = jwt.verify(token, JWT_SECRET);
      const id = parsedToken && parsedToken.id
      if (id) {
        req.user = await getUserById(id);
        next();
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  } else {
    next({
      name: "AuthorizationHeaderError",
      message: `Authorization token must start with ${prefix}`,
    });
  }
});
// Routers

const healthRouter = require("./health");
apiRouter.use("/health", healthRouter);

const usersRouter = require("./users");
apiRouter.use("/users", usersRouter);

const activitiesRouter = require("./activities");
apiRouter.use("/activities", activitiesRouter);

const routinesRouter = require("./routines");
apiRouter.use("/routines", routinesRouter);

const routine_activitiesRouter = require("./routine_activities");
apiRouter.use("/routine_activities", routine_activitiesRouter);



module.exports = { apiRouter };
