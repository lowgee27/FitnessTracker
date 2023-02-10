const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;
const { getAllActivities,
      createActivity,
      updateActivity

} = require("../db");

// GET /api/activities/:activityId/routines

// GET /api/activities

router.get('/', async (req, res, next) => {

      try {
            const routine = await getAllActivities();

            res.send(routine);

      } catch ({ name, message }) {
            next({ name, message })
      }
});

// POST /api/activities

router.post('/', async (req, res, next) => {

      //Get parameters from the client 
      const { name, description } = req.body;

      //Get all existing activities to perform name check
      const originalActivities = await getAllActivities();

      try {
            //Loop through all activities
            for (let i = 0; i < originalActivities.length; ++i) {

                  //Assign each existing existing activity to "activity"
                  const activity = originalActivities[i];

                  //Check to see if user is logged in and new activity name does match existing name
                  if (req.headers.authorization && name === activity.name) {

                        //If user not logged and name already exists send errror
                        res.status(401)
                        res.send({
                              error: 'GetMeError', name: '401', message: `An activity with name ${name} already exists`
                        });
                  }
            }

            //If user logged in and name does not already exist create new activity
            const newActivity = await createActivity({ name, description })
            res.send(newActivity);

      } catch ({ name, message }) {
            next({ name, message })
      }
});

// PATCH /api/activities/:activityId

router.patch('/:activityId', async (req, res, next) => {
      const { activityId } = req.params;
      //Get parameters from the client 
      const { name, description } = req.body;
      const id = activityId;
      //Get all existing activities to perform name check
      const originalActivities = await getAllActivities();
console.log(originalActivities);
      try {
            //if (req.headers.authorization) {
                  //Loop through all activities
                  for (let i = 0; i < originalActivities.length; ++i) {

                        //Assign each existing existing activity to "activity"
                        const activity = originalActivities[i];
                        // if (id === activity.id && name !== activity.name) {
                              console.log(activity);
                        //}
                        if (req.headers.authorization && id !== activity.id) {
                              res.status(401)
                              res.send({
                                    error: 'GetMeError', name: '401', message: `Activity ${id} not found`
                              });
                        
                        }
                        else if (req.headers.authorization && name === activity.name) {
                        
                              res.status(401)
                              res.send({
                                    error: 'GetMeError', name: '401', message: `An activity with name ${name} already exists`
                              });
                        }

                  }
                  const updatedActivity = await createActivity({ id, name, description })
                  res.send(updatedActivity);
      
                  //       } else {
                  //        if (id === activity.id && name === activity.name) {
                  //             res.status(401)
                  //             res.send({
                  //                   error: 'GetMeError', name: '401', message: `An activity with name ${name} already exists`
                  //             });
                  //       } else {
                  //       if (req.headers.authorization && id !== activity.id) {
                  //             res.status(401)
                  //             res.send({
                  //                   error: 'GetMeError', name: '401', message: `Activity ${id} not found`
                  //             });
                  //       }
                  // }


            //}

      


      } catch ({ name, message }) {
            next({ name, message })
      }
});

module.exports = router;
