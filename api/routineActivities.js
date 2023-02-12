const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;
const { canEditRoutineActivity,
      updateRoutineActivity,
      destroyRoutineActivity,
      getRoutineActivityById,
      getRoutineById
} = require('../db');

// PATCH /api/routine_activities/:routineActivityId

router.patch('/:routineActivityId', async (req, res, next) => {
      // getting all required info passed in
      const { routineActivityId } = req.params;
      const { duration, count } = req.body;
      const id = routineActivityId;

      try {
            // fetch original routine activity to be patched
            const originalRoutineActivity = await getRoutineActivityById(id);
            const routineToBeUpdated = originalRoutineActivity.routineId;

            // fetch the routine at id to get the name needed for the error message
            const originalRoutine = await getRoutineById(id);
            const name = originalRoutine.name;

            // authenticating user
            const userToken = req.headers.authorization;
            const token = userToken.split(' ');
            const decoded = jwt.verify(token[1], JWT_SECRET);
            const userId = decoded.id;
            const userName = decoded.username;

            // check to see if user is allowed to edit routine activity
            const authorizedUser = await canEditRoutineActivity(routineToBeUpdated, userId);
            // response
            if (authorizedUser) {
                  const updatedRoutineActivity = await updateRoutineActivity({ id, duration, count });
                  res.send(updatedRoutineActivity);
            } else {
                  res.status(403)
                  res.send({
                        error: 'error',
                        name: '403',
                        message: `User ${userName} is not allowed to update ${name}`
                  })
            }
      } catch ({ name, message }) {
            next({ name, message })
      }
})

// DELETE /api/routine_activities/:routineActivityId

router.delete('/:routineActivityId', async (req, res, next) => {
      // getting all required info passed in
      const { routineActivityId } = req.params;
      const id = routineActivityId;

      try {
            // fetch original routine activity to be deleted
            const originalRoutineActivity = await getRoutineActivityById(id);
            const routineToBeUpdated = originalRoutineActivity.routineId;

            // fetch the routine at id to get the name needed for the error message
            const originalRoutine = await getRoutineById(id);
            const name = originalRoutine.name;

            // authenticating user
            const userToken = req.headers.authorization;
            const token = userToken.split(' ');
            const decoded = jwt.verify(token[1], JWT_SECRET);
            const userId = decoded.id;
            const userName = decoded.username;

            // check to see if user is allowed to edit routine activity
            const authorizedUser = await canEditRoutineActivity(routineToBeUpdated, userId);

            // response
            if (authorizedUser) {
                  const deleteActivity = await destroyRoutineActivity(id);
                  res.send(deleteActivity);
            } else {
                  res.status(403)
                  res.send({
                        error: 'error',
                        name: '403',
                        message: `User ${userName} is not allowed to delete ${name}`
                  })
            }
      } catch ({ name, message }) {
            next({ name, message })
      }
})


module.exports = router;
