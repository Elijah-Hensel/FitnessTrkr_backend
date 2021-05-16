const express = require("express");
const routinesRouter = express.Router();
const {
  getRoutineById,
  getAllPublicRoutines,
  createRoutine,
  updateRoutine,
  destroyRoutine,
} = require("../db/routines");
const { addActivityToRoutine } = require("../db/routine_activities");
const requireUser = require("./utils");

routinesRouter.use((_, __, next) => {
  console.log("A request is being made to /routines route");
  next();
});

routinesRouter.get("/", async (_, res, next) => {
  try {
    const routines = await getAllPublicRoutines();
    res.send(routines);
  } catch ({ message }) {
    next({ message });
  }
});

routinesRouter.post("/", requireUser, async (req, res, next) => {
  try {
    const { isPublic, name, goal } = req.body;
    const creatorId = req.user.id;
    const routine = await createRoutine({ creatorId, isPublic, name, goal });
    res.send(routine);
  } catch ({ message }) {
    next({ message });
  }
});

routinesRouter.patch("/:routineId", requireUser, async (req, res, next) => {
  const { id } = req.user;
  const { routineId } = req.params;
  const { isPublic, name, goal } = req.body;
  try {
    const routineToUpdate = await getRoutineById(routineId);
    // console.log(routineToUpdate, "ROUTINE TO UPDATE CONSOLE");
    if (!routineToUpdate) {
      next({
        name: "routineToUpdateError",
        message: "No routine found with that id",
      });
    } else {
      // console.log(id, routineToUpdate.creatorId);
      if (id !== routineToUpdate.creatorId) {
        res.status(403);
        next({
          name: "routineIdDoesNotEqualError",
          message: "Routine id does not match user id",
        });
      }
      const routine = await updateRoutine({
        id: routineId,
        name,
        goal,
        isPublic,
      });
      // console.log(routine, "ROUTINE CONSOLE");

      if (routine) {
        res.send(routine);
      } else {
        next({ name: "patchError", message: "Failed to update routine" });
      }
    }
  } catch ({ message }) {
    next({ message });
  }
});

routinesRouter.delete("/:routineId", requireUser, async (req, res, next) => {
  try {
    const { id } = req.user;
    const { routineId } = req.params;
    if (!id) {
      res.status(403);
      next({
        name: "RoutineDoesNotExistError",
        message: "This routine does not exist to be deleted!",
      });
    } else {
      const routine = await destroyRoutine(routineId);
      if (id === routine.creatorId) {
        res.send(routine);
      } else
        next({
          name: "userNotRoutineOwnerError",
          message: "You can not delete a routine that is not yours!",
        });
    }
  } catch ({ name, message }) {
    next({
      name: "deleteRoutineError",
      message: "Could not delete this routine!",
    });
  }
});

routinesRouter.post("/:routineId/activities", async (req, res, next) => {
  try {
    let { routineId, activityId, count, duration } = req.body;
    const newRoutineId = req.params.routineId;
    const parsedRoutineId = parseInt(newRoutineId);

    if (parsedRoutineId === routineId) {
      res.status(402);
      next({
        name: "routineActivityAlreadyExistsError",
        message: "A routine with this id already exists!",
      });
    } else {
      routineId = parsedRoutineId;
      const activity = await addActivityToRoutine({
        routineId,
        activityId,
        count,
        duration,
      });
      res.send(activity);
    }
  } catch ({ name, message }) {
    next({
      name: "attachActivitiesToRoutineError",
      message: "Could not attach the activity to the routine!",
    });
  }
});

module.exports = routinesRouter;
