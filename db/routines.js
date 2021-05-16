const client = require("./client");
const util = require("./utils");

async function attachActivitiesToRoutines(routines) {
  const routineArray = [...routines];
  const binds = routines.map((_, index) => `$${index + 1}`).join(", ");
  const routineIds = routines.map((routine) => routine.id);
  if (routineIds.length === 0) {
    return;
  }
  try {
    const { rows: activities } = await client.query(
      `
      SELECT activities.*, routine_activities.duration, routine_activities.count,
      routine_activities.id AS "routineActivityId", routine_activities."routineId"
      FROM activities
      JOIN routine_activities ON routine_activities."activityId" = activities.id
      WHERE routine_activities."routineId" IN (${binds});
    `,
      routineIds
    );
    for (const routine of routineArray) {
      const activitiesMerge = activities.filter(
        (activity) => routine.id === activity.routineId
      );
      routine.activities = activitiesMerge;
    }
    return routineArray;
  } catch (error) {
    throw error;
  }
  ///check duration id count return routine.activity.id
}

async function getRoutineById(id) {
  try {
    const {
      rows: [routine],
    } = await client.query(
      `
            SELECT *
            FROM routines
            WHERE id=$1
        `,
      [id]
    );

    return routine;
  } catch (err) {
    console.error("Could not get routine by that id!");
    throw err;
  }
}

async function getRoutinesWithoutActivities() {
  try {
    const { rows } = await client.query(`
        SELECT *
        FROM routines;
      `);
    return rows;
  } catch (err) {
    console.error("Could not get routines without activities");
    throw err;
  }
}

async function getAllRoutines() {
  try {
    const { rows: routines } = await client.query(`
            SELECT routines.*, users.username AS "creatorName"
            FROM routines
            JOIN users ON routines."creatorId"=users.id;
        `);

    return await attachActivitiesToRoutines(routines);
  } catch (err) {
    console.error("Could not get all routines!!");
    throw err;
  }
}

async function getAllPublicRoutines() {
  try {
    const { rows: routines } = await client.query(`
        SELECT routines.*, users.username AS "creatorName"
        FROM routines
        JOIN users ON routines."creatorId"=users.id
        WHERE "isPublic"=true;
        `);
    return await attachActivitiesToRoutines(routines);
  } catch (err) {
    console.error("Could not get all public routines!!");
    throw err;
  }
}

async function getAllRoutinesByUser({ username }) {
  try {
    const { rows: routines } = await client.query(
      `
        SELECT routines.*, users.username AS "creatorName"
        FROM routines
        JOIN users ON routines."creatorId"=users.id
        WHERE username=$1;
        `,
      [username]
    );
    return await attachActivitiesToRoutines(routines);
  } catch (err) {
    console.error("There was a problem getting all routines by user!");
    throw err;
  }
}

async function getPublicRoutinesByUser({ username }) {
  try {
    const { rows: routines } = await client.query(
      `
            SELECT routines.*, users.username AS "creatorName"
            FROM routines
            JOIN users ON routines."creatorId"=users.id
            WHERE username=$1 AND "isPublic"=$2;
            `,
      [username, true]
    );
    return await attachActivitiesToRoutines(routines);
  } catch (err) {
    console.error("There was a problem getting all routines by user!");
    throw err;
  }
}

async function getPublicRoutinesByActivity({ id }) {
  try {
    const { rows: routines } = await client.query(`
            SELECT routines.*, users.username AS "creatorName"
            FROM routines
            JOIN users ON routines."creatorId"=users.id
            WHERE "isPublic"=true
            `);
    return await attachActivitiesToRoutines(routines);
  } catch (err) {
    console.error("Unable to get public routines by activity!");
    throw err;
  }
}

async function createRoutine({ creatorId, isPublic, name, goal }) {
  try {
    const {
      rows: [routines],
    } = await client.query(
      `
          INSERT INTO routines("creatorId", "isPublic", name, goal)
          VALUES($1, $2, $3, $4)
          RETURNING *;
       `,
      [creatorId, isPublic, name, goal]
    );
    if (!routines) {
      return null;
    }
    return routines;
  } catch (err) {
    console.error("Could not create routines!");
    throw err;
  }
}

async function updateRoutine({ id, ...fields }) {
  try {
    const toUpdate = {};
    for (let column in fields) {
      if (fields[column] !== undefined) {
        toUpdate[column] = fields[column];
      }
    }
    let routine;
    if (util.dbFields(fields).insert.length > 0) {
      const { rows } = await client.query(
        `
          UPDATE routines
          SET ${util.dbFields(toUpdate).insert}
          WHERE id=${id}
          RETURNING *;
      `,
        Object.values(toUpdate)
      );
      routine = rows[0];
      return routine;
    }
  } catch (err) {
    console.error("Unable to update routine!!");
    throw err;
  }
}

async function destroyRoutine(id) {
  try {
    const routineId = getRoutineById(id);
    if (!routineId) {
      throw { message: "Error this routine doesnt exist" };
    }
    await client.query(
      `
    DELETE FROM routine_activities
    WHERE "routineId"=$1;
    `,
      [id]
    );
    const {
      rows: [routine],
    } = await client.query(
      `
    DELETE FROM routines
    WHERE id=$1
    RETURNING *;
    `,
      [id]
    );
    return routine;
  } catch {
    throw error;
  }
}

module.exports = {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllRoutinesByUser,
  getAllPublicRoutines,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
};
