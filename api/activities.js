const express = require("express");
const activitiesRouter = express.Router();
const {
  getActivityById,
  getAllActivities,
  createActivity,
  updateActivity,
} = require("../db/activities");
const jwt = require("jsonwebtoken");
const requireUser = require("./utils");
const { getPublicRoutinesByActivity } = require("../db/routines");

activitiesRouter.use((_, __, next) => {
  console.log("A request is being made to /activities route");
  next();
});

activitiesRouter.get("/", async (req, res, next) => {
  try {
    const activities = await getAllActivities();
    res.send(activities);
  } catch ({ name, message }) {
    next({ name, message });
  }
});

activitiesRouter.post("/", requireUser, async (req, res, next) => {
  const { name, description } = req.body;
  try {
    const activity = await createActivity({ name, description });
    res.send(activity);
  } catch ({ message }) {
    next({ message });
  }
});

activitiesRouter.patch("/:activityId", requireUser, async (req, res, next) => {
  try {
    const { activityId } = req.params
    const { name, description } = req.body;
    const activity = await updateActivity({ id: activityId, name, description });
    res.send(activity);
  } catch ({ message }) {
    next({ message });
  }
});

activitiesRouter.get('/:activityId/routines', async (req, res, next) => {
    try {
        const {activityId} = req.params
        const activity = await getPublicRoutinesByActivity({id: activityId})
        res.send(activity)

    } catch ({message}) {
        next({message})
    }
})

module.exports = activitiesRouter;
