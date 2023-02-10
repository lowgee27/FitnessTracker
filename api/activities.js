const express = require('express');
const router = express.Router();
const { getAllActivities,
      createActivity,
      updateActivity,
      getPublicRoutinesByActivity,
      getActivityById,
      getActivityByName

} = require("../db");

// GET /api/activities/:activityId/routines

router.get('/:activityId/routines', async (req, res, next) => {
      const { activityId } = req.params;
      const id = activityId;

      //Get the activity by id to see if it exists
      const originalActivity = await getActivityById(id);

      try {
            //If the acitivty exists get all public routines where it is used
            if (originalActivity) {

                  const routines = await getPublicRoutinesByActivity({ id });
                  res.send(routines);
            }

            //If the acitivity does not exist send error
            if (!originalActivity) {

                  res.status(401)
                  res.send({
                        error: 'GetMeError', name: '401', message: `Activity ${id} not found`
                  });

            }
      } catch ({ name, message }) {
            next({ name, message })
      }
});

// GET /api/activities

router.get('/', async (req, res, next) => {

      try {
            const activities = await getAllActivities();

            res.send(activities);

      } catch ({ name, message }) {
            next({ name, message })
      }
});

// POST /api/activities

router.post('/', async (req, res, next) => {

      //Get parameters from the client 
      const { name, description } = req.body;

      //Get the acitvity by name to see if it exists
      const checkName = await getActivityByName(name);

      try {
            //Check to see if user is logged in and new activity name does not exist
            if (req.headers.authorization && !checkName) {
                  //If user logged in and name does not already exist create new activity
                  const newActivity = await createActivity({ name, description })
                  res.send(newActivity);
            }

            //If name already exists send errror
            if (checkName) {
                  res.status(401)
                  res.send({
                        error: 'GetMeError', name: '401', message: `An activity with name ${name} already exists`
                  });
            }
      } catch ({ name, message }) {
            next({ name, message })
      }
});

// PATCH /api/activities/:activityId

router.patch('/:activityId', async (req, res, next) => {

      //Get parameters from the route
      const { activityId } = req.params;
      //Get parameters from the client 
      const { name, description } = req.body;
      const id = activityId;

      //Get the activity by id to see if it exists
      const originalActivity = await getActivityById(id);

      //Get the acitvity by name to see if it exists
      const checkName = await getActivityByName(name);

      try {
            //If the user is logged in, the acitivity exists, and the name does not exist
            //update the activity
            if (req.headers.authorization && originalActivity && !checkName) {
                  const updatedActivity = await updateActivity({ id, name, description })
                  res.send(updatedActivity);
            }

            //If the activity does not exist send error
            if (!originalActivity) {
                  res.status(401)
                  res.send({
                        error: 'GetMeError', name: '401', message: `Activity ${id} not found`
                  });
            }

            //If the name already exists in an acivity send error
            if (checkName) {
                  res.status(402)
                  res.send({
                        error: 'GetMeError', name: '401', message: `An activity with name ${name} already exists`
                  });
            }
      } catch ({ name, message }) {
            next({ name, message })
      }
});

module.exports = router;
