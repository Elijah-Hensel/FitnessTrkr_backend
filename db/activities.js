const client = require("./client");

async function getActivityById(id) {
  try {
    const {
      rows: [activity],
    } = await client.query(
      `
          SELECT *
          FROM activities
          WHERE id=$1;
        `,
      [id]
    );

    if (!activity) {
      throw {
        name: "ActivityNotFoundError",
        message: "Could not find an activity with that id",
      };
    }
    return activity;
  } catch (error) {
    throw error;
  }
}

async function getAllActivities() {
  try {
    const { rows } = await client.query(`
        SELECT *
        FROM activities
    `);

    return rows;
  } catch (err) {
    console.error("Could not get all activities!");
    throw err;
  }
}

async function createActivity({ name, description }) {
  try {
    const {
      rows: [activity],
    } = await client.query(
      `
            INSERT INTO activities(name, description)
            VALUES($1, $2)
            ON CONFLICT (name) DO NOTHING
            RETURNING *;
        `,
      [name, description]
    );
    return activity;
  } catch (err) {
    console.error("Could not create activity!");
    throw err;
  }
}

async function updateActivity({ id, name, description }) {
  try {
    const {
      rows: [activity],
    } = await client.query(
      `
            UPDATE activities
            SET name=$2, description=$3
            WHERE id=$1
            RETURNING *;
        `,
      [id, name, description]
    );
    return activity;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  getActivityById,
  getAllActivities,
  createActivity,
  updateActivity,
};
