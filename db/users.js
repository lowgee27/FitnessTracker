/* eslint-disable no-useless-catch */
const client = require("./client");

// database functions

// user functions
async function createUser({ username, password }) {

  try {
    const { rows: [user] } = await client.query(`
INSERT INTO users(username, password)
VALUES ($1, $2)
RETURNING *;
`, [username, password]);

    delete user.password;

    return user;
  } catch (error) {
    throw error;
  }

}

async function getUser({ username, password }) {
  try {
    const { rows: [user] } = await client.query(`
SELECT * FROM users WHERE username=$1
`, [username]);
    if (user.password === password) {
      delete user.password;
      return user;
    }
  } catch (error) {
    throw error;
  }
}

async function getUserById(userId) {
  try {
    const { rows: [user] } = await client.query(`
SELECT * FROM users WHERE id=$1
`, [userId]);

    delete user.password;
    return user;
  } catch (error) {
    throw error;
  }
}

async function getUserByUsername(userName) {
  try {
    const { rows: [user] } = await client.query(`
SELECT * FROM users WHERE username=$1
`, [userName]);

    return user;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
}
