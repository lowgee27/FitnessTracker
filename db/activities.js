/* eslint-disable no-useless-catch */
const client = require('./client');

// database functions
async function createActivity({ name, description }) {
  // return the new activity
  try {
    const { rows: [newActivity] } = await client.query(`INSERT INTO activities (name, description) 
    VALUES ($1, $2)
    RETURNING *
    `, [name, description])
    return newActivity;
  } catch (error) {
    throw error;
  }
}

async function getAllActivities() {
  // select and return an array of all activities
  try {
  const { rows } = await client.query(`
  SELECT * FROM activities;
  `)
  return rows;
} catch (error) {
  throw error;
}
}

async function getActivityById(id) {
  try {
  const { rows: [activities] } = await client.query(`
  SELECT * FROM activities
  WHERE id = $1
  `, [id]);
  return activities;
} catch (error) {
  throw error;
}
}
async function getActivityByName(name) {
 try {
  const { rows: [activities] } = await client.query(`
  SELECT * FROM activities
  WHERE name = $1
  `, [name]);

  return activities;
} catch (error) {
  throw error;
 }
}

async function attachActivitiesToRoutines(routines) {
  // select and return an array of all activities
  try {

    for (let i = 0; i < routines.length; ++i) {
      const routine = routines[i];
      const { rows: activities } = await client.query(`
      SELECT activities.*, routine_activities.id AS "routineActivityId", routine_activities."routineId", routine_activities.duration, routine_activities.count
      FROM activities 
      JOIN routine_activities ON routine_activities."activityId" = activities.id
      WHERE routine_activities."routineId"=$1
    `, [routine.id]);

      routine.activities = [];

      for (let j = 0; j < activities.length; ++j) {
        routine.activities.push(activities[j])
      }
    }
    return routines
  } catch (error) {
    throw error;
  }
}

async function updateActivity({ id, ...fields }) {
  // don't try to update the id
  // do update the name and description
  // return the updated activity
  const setString = Object.keys(fields).map(
    (key, index) => `"${key}"=$${index + 1}`
  ).join(', ');

  try {
    if (setString.length > 0) {

      const { rows: [activity] } = await client.query(`
            UPDATE activities
            SET ${setString}
            WHERE id=${id}
            RETURNING *;
          `, Object.values(fields));

      return activity;
    }

  } catch (error) {
    throw error;
  }
}

module.exports = {
  getAllActivities,
  getActivityById,
  getActivityByName,
  attachActivitiesToRoutines,
  createActivity,
  updateActivity,
};
