const express = require("express");
const routine_activitiesRouter = express.Router();
const {
  getRoutineActivityById,
  updateRoutineActivity,
  destroyRoutineActivity,
  getRoutineById
} = require("../db");
const requireUser = require("./utils");

routine_activitiesRouter.use((_, __, next) => {
  console.log("A request is being made to /activities route");
  next();
});

routine_activitiesRouter.patch("/:routineActivityId", async (req, res, next) => {
    //  Update the count or duration on the routine activity
    const { count, duration } = req.body;
    const id = req.params.routineActivityId;
    try {
      const routineActivity = await getRoutineActivityById(id);
      if (!routineActivity) {
        return next({ message: "can't get routine activity" });
      }
      const routine = await getRoutineById(routineActivity.routineId);
      if (!routine) {
        return next({ message: "can't get routine" });
      }
      if (req.user.id !== routine.creatorId) {
        return next({ message: "must be user" });
      }
      const updatedRoutineActivity = await updateRoutineActivity({
        id,
        count,
        duration,
      });
      res.send(updatedRoutineActivity);
    } catch (error) {
      console.error(error);
      next(error);
    }
  });

routine_activitiesRouter.delete(
  "/:routineActivityId",
  async (req, res, next) => {
    try {
      const { routineActivityId } = req.params;
      const routineActivity = await getRoutineActivityById(routineActivityId);
      const routine = await getRoutineById(routineActivity.routineId);

      if (req.user.id === routine.creatorId) {
        const destroyActivity = await destroyRoutineActivity(routineActivityId);
        res.send(destroyActivity);
      } else {
        next({ message: "error" });
      }
    } catch ({ name, message }) {
      next({
        name: "routine_activityDeleteError",
        message: "Unable to delete routine_activity",
      });
    }
  }
);

module.exports = routine_activitiesRouter;
