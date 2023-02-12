const client = require("./client");
const { attachActivitiesToRoutines } = require('./activities');

async function createRoutine({ creatorId, isPublic, name, goal }) {
  try{
    const { rows: [routine] } = await client.query(`
    INSERT INTO routines("creatorId", "isPublic", name, goal)
    VALUES($1, $2, $3, $4)
    RETURNING *;
  `, [creatorId, isPublic, name, goal]);

  return routine;
  } catch (error) {
    console.error('Error creating routine.');
    throw error;
  }
}

async function getRoutineById(id) {
  try {
    const { rows: [routine] } = await client.query(`
      SELECT * FROM routines
      WHERE id = $1
    `,
      [id]
    );

    
    return routine;
  } catch (error) {
    console.error('Error fetching by id.');
    throw error;
  }
}

async function getRoutinesWithoutActivities() {
  try{
    const { rows } = await client.query(`
      SELECT * FROM routines;
    `);

    return rows;
  } catch (error) {
    console.error('Error fetching routines.');
    throw error;
  }
}

async function getAllRoutines() {
  try {
    const { rows: routines } = await client.query(`
      SELECT routines.*,
      users.username AS "creatorName"
      FROM routines
      JOIN users ON users.id = routines."creatorId"
   `);

    return attachActivitiesToRoutines(routines);
  } catch (error) {
    throw new Error('Error fetching all routines.')
  }
}

async function getAllPublicRoutines() {
  try {
    const { rows: routines } = await client.query(`
      SELECT routines.*, users.username AS "creatorName"
      FROM routines
      JOIN users ON routines."creatorId" = users.id
      WHERE "isPublic" = TRUE;
    `);

    return await attachActivitiesToRoutines(routines);
  } catch (error) {
    console.error('Error fetching public routines.');
    throw error;
  }
}

async function getAllRoutinesByUser({ username }) {
  try {
    const { rows: routines } = await client.query(`
      SELECT routines.*, users.username AS "creatorName"
      FROM routines
      JOIN users ON routines."creatorId" = users.id
      WHERE "username" = $1
    `, [username]);

    return await attachActivitiesToRoutines(routines);
  } catch (error) {
    console.error('Error fetching routines by user.');
    throw error;
  }
}

async function getPublicRoutinesByUser({ username }) {
  try {

    const { rows: routines } = await client.query(`
          SELECT routines.*, users.username AS "creatorName"
          FROM routines
          JOIN users ON routines."creatorId" = users.id
          WHERE "username" = $1 AND "isPublic" = TRUE
        `, [username]);

    return await attachActivitiesToRoutines(routines);
  } catch (error) {
    console.error('Error fetching public routines by user.');
    throw error;
  }
}

async function getPublicRoutinesByActivity({ id }) {
  try {

    const { rows: routines } = await client.query(`
        SELECT routines.*, users.username AS "creatorName"
        FROM routines 
        JOIN users ON routines."creatorId" = users.id
        JOIN routine_activities ON routines.id = routine_activities."routineId"
        WHERE routine_activities."activityId" = $1 AND routines."isPublic" = TRUE
        `, [id]);

    return await attachActivitiesToRoutines(routines);
  } catch (error) {
    console.error('Error fetching public routines by user.');
    throw error;
  }
}

async function updateRoutine({ id, ...fields }) {
  
  const setString = Object.keys(fields).map((key, index) => `"${key}"=$${index + 1}`).join(', ');
  
  if (setString.length === 0) {
    return;
  }

  try {
    const {rows: [routine] } = await client.query(`
      UPDATE routines
      SET ${setString}
      WHERE id = ${id}
      RETURNING *;
    `, Object.values(fields));

    return routine;
  } catch (error) {
    console.error('Error updating routine.');
    throw error;
  }
}

async function destroyRoutine(id) {
  try {
    await client.query(`
      DELETE FROM routine_activities
      WHERE "routineId" = $1;
      `, [id]);
    const { rows: routine } = await client.query(`
      DELETE FROM routines
      WHERE id = $1
      `, [id]);


    return routine;
  } catch (error) {
    console.error('Error deleting routine.');
    throw error;
  }

}

module.exports = {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
};
