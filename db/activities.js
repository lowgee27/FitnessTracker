const client = require('./client');

// database functions
async function createActivity({ name, description }) {
  try {
    const { rows: [activity] } = await client.query(
      `
        INSERT INTO activities(name, description)
        VALUES($1, $2)
        RETURNING *;
      `,
      [name, description]
    );

    return activity;
  } catch (error) {
    console.error('Error creating the activity.');
    throw error;
  }
}

async function getAllActivities() {
  try {
    const { rows: activity } = await client.query(`
      SELECT * FROM activities;
    `);

    return activity;
  } catch (error) {
    console.error('Error fetching activities.');
    throw error;
  }
}

async function getActivityById(id) {
  try {
    const { rows: [activity] } = await client.query(`
      SELECT * FROM activities
      WHERE id = $1
    `,
      [id]
    );

    return activity;
  } catch (error) {
    console.error('Error fetching by id.');
    throw error;
  }
}

async function getActivityByName(name) {
  try {
    const { rows: [activity] } = await client.query(`
      SELECT * FROM activities
      WHERE name = $1
    `,
      [name]
    );

    return activity;
  } catch (error) {
    console.error('Error fetching by id.');
    throw error;
  }
}

// helper function for Routine functions
async function attachActivitiesToRoutines(routines) {
  try{
    const {rows : activity} = await client.query(`
      SELECT 
      activities.*,
      routine_activities.duration,
      routine_activities.count,
      routine_activities.id AS "routineActivityId",
      routine_activities."routineId"
      FROM activities
      JOIN routine_activities
      ON routine_activities."activityId" = activities.id
      WHERE routine_activities."routineId"=$1;`,[routines.id]);
    return activity
  }catch(error){
    throw new Error('cant attach activity to routine')
  }
}

async function updateActivity({ id, ...fields }) {
  
  const setString = Object.keys(fields).map((key, index) => `"${key}"=$${index + 1}`
  ).join(', ');

  if (setString.length === 0) {
    return;
  }

  try {
    
    const { rows: [activity] } = await client.query(`
      UPDATE activities
      SET ${setString}
      WHERE id = ${id}
      RETURNING *;
    `, Object.values(fields));

    return activity;
  
  } catch (error) {
    console.error('Error updating activity.');
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
