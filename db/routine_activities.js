const client = require('./client');

async function addActivityToRoutine({
  routineId,
  activityId,
  count,
  duration,
}) {
  try {
    const {
      rows: [routineActivity],
    } = await client.query(
      `
      INSERT INTO "routine_activities" ("routineId", "activityId", count, duration)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `,
      [routineId, activityId, count, duration]
    );

    return routineActivity;
  } catch (error) {
    console.error('Error adding activity to routine.');
    throw error;
  }
}

async function getRoutineActivityById(id) {
  try {
    const {
      rows: [routine],
    } = await client.query(
      `
        SELECT * FROM routine_activities WHERE id=$1
      `,
      [id]
    );

    return routine;
  } catch (error) {
    console.error('Error fetching routine activity by id.');
    throw error;
  }
}

async function getRoutineActivitiesByRoutine({ id }) {
  try {
    const { rows: routine } = await client.query(`
      SELECT * FROM routine_activities
      WHERE "routineId" = $1
    `, [id])

    return routine;
  } catch (error) {
    console.error('Error fetching routine activities by routine.')
  }
}

async function updateRoutineActivity({ id, ...fields }) {
  const setString = Object.keys(fields).map((key, index) => `"${key}"=$${index + 1}`).join(', ');
  
  if (setString.length === 0) {
    return;
  }

  try {
    const {rows: [routine] } = await client.query(`
      UPDATE routine_activities
      SET ${setString}
      WHERE id = ${id}
      RETURNING *;
    `, Object.values(fields));

    return routine;
  } catch (error) {
    console.error('Error updating routine activity.');
    throw error;
  }
}

async function destroyRoutineActivity(id) {
  try {
    const { rows: [routine_activity] } = await client.query(`
      DELETE FROM routine_activities
      WHERE id = $1
      RETURNING *;
      `, [id]);

    return routine_activity;
  } catch (error) {
    console.error('Error deleting routine activity.');
    throw error;
}

async function canEditRoutineActivity(routineActivityId, userId) {}

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};
