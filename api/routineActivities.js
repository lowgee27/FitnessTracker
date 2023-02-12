const express = require('express');
const router = express.Router();
const { canEditRoutineActivity, updateRoutineActivity, destroyRoutineActivity, getRoutineActivityById } = require('../db');

// PATCH /api/routine_activities/:routineActivityId
router.patch('/:routineActivityId', async (req, res, next) => {
    // getting all required info passed in
    const { routineActivityId } = req.params;
    const { duration, count } = req.body;
    const id = routineActivityId;

    try {
        // fetch original routine activity to be patched
        const originalRoutineActivity = await getRoutineActivityById(id);
        const routineActivityId = originalRoutineActivity.routineId;

        // authenticating user
        const jwt = require('jsonwebtoken');
        const { JWT_SECRET } = process.env;
        const userToken = req.headers.authorization;
        const token = userToken.split(' ');
        const decoded = jwt.verify(token[1], JWT_SECRET);

        const authorizedUser = await canEditRoutineActivity(routineActivityId, decoded.id);
        // response
        if (authorizedUser) {
            const updatedRoutineActivity = await updateRoutineActivity({ id, duration, count });
            res.send(updatedRoutineActivity);
        } else {
            res.status(403)
            res.send({
                error: 'error',
                name: '403',
                message: `User ${decoded.username} is not allowed to update In the evening`
            })
        }
    } catch ({ name, message }) {
        next({ name, message })
    }
})

// DELETE /api/routine_activities/:routineActivityId
router.delete('/:routineActivityId', async (req, res, next) => {

})

module.exports = router;
