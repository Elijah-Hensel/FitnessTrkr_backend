const client = require("./client");
const bcrypt = require("bcrypt");
const SALT_COUNT = 10;

async function createUser({ username, password }) {
  try {
    const hashedPassword = await bcrypt.hash(password, SALT_COUNT);
    const {
      rows: [user],
    } = await client.query(
      `
        INSERT INTO users(username, password)
        VALUES($1, $2)
        ON CONFLICT (username) DO NOTHING
        RETURNING *;
     `,
      [username, hashedPassword]
    );
    delete user.password;
    return user;
  } catch (error) {
    console.error("Error creating users!");
    throw error;
  }
}

async function getUserByUserName(username) {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
      SELECT *
      FROM users
      WHERE username=$1;
    `,
      [username]
    );
    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    throw error;
  }
}

async function getUser({ username, password }) {
  const user = await getUserByUserName(username);
  const hashedPassword = user.password;
  try {
    const passwordMatch = await bcrypt.compare(password, hashedPassword);
    if (passwordMatch === true) {
      delete user.password;
      return user;
    }
  } catch (err) {
    throw err;
  }
}

async function getUserById(id) {
  try {
    const {
      rows: [user],
    } = await client.query(`
            SELECT *
            FROM users
            WHERE id=${id}
        `);
    if (!user) {
      return null;
    }
    return user;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUserName,
};
