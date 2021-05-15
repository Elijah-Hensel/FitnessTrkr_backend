const client = require("./client");

async function getRoutineActivityById(id) {
  try {
    const {
      rows: [routine],
    } = await client.query(`
            SELECT *
            FROM routine_activities
            WHERE id=${id}
        `);

    return routine;
  } catch (err) {
    console.error("Could not get routine activity with that id!");
    throw err;
  }
}

async function addActivityToRoutine({
  routineId,
  activityId,
  count,
  duration,
}) {
  try {
    const {
      rows: [routine_activity],
    } = await client.query(
      `
        INSERT INTO routine_activities("routineId", "activityId", count, duration)
        VALUES($1, $2, $3, $4)
        RETURNING *;
    `,
      [routineId, activityId, count, duration]
    );
    return routine_activity;
  } catch (err) {
    console.error("Could not add activities to the routine!");
    throw err;
  }
}

async function updateRoutineActivity({ id, count, duration }) {
  try {
    const {
      rows: [routine_activity],
    } = await client.query(
      `
        UPDATE routine_activities
        SET count=$2, duration=$3
        WHERE id=$1
        RETURNING *;
    `,
      [id, count, duration]
    );
    return routine_activity;
  } catch (err) {
    throw err;
  }
}

async function destroyRoutineActivity(id) {
  try {
    const {
      rows: [routine_activity],
    } = await client.query(`
    DELETE FROM routine_activities
    WHERE id=${id}
    RETURNING *;
    `);
    return routine_activity;
  } catch (err) {
    console.error("Could not destroy routine activity!");
    throw err;
  }
}

async function getRoutineActivitiesByRoutine({ id }) {
  try {
    const { rows: routine_activity } = await client.query(
      `
      SELECT *
      FROM routine_activities
      WHERE "routineId"=$1;
      `,
      [id]
    );
    return routine_activity;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  getRoutineActivitiesByRoutine,
};
