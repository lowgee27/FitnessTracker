const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;
const { getAllPublicRoutines,
      createRoutine,
      updateRoutine,
      getRoutineById
} = require("../db");

// GET /api/routines

router.get('/', async (req, res, next) => {

      try {
            const routine = await getAllPublicRoutines();

            res.send(routine);

      } catch ({ name, message }) {
            next({ name, message })
      }
});

// POST /api/routines

router.post('/', async (req, res, next) => {

      //Get parameters from the client EXCEPT creatorId
      const { isPublic, name, goal } = req.body;
      try {

            //Check to see if user logged in by decoding token in header
            if (req.headers.authorization) {
                  const usertoken = req.headers.authorization;
                  const token = usertoken.split(' ');
                  const decoded = jwt.verify(token[1], JWT_SECRET);

                  //Set creatorId to the user id extracted from header
                  const creatorId = decoded.id;
                  const routine = await createRoutine({ creatorId, isPublic, name, goal })

                  res.send(routine);

            } else {

                  //If user not logged in send errror
                  res.status(401)
                  res.send({
                        error: 'GetMeError', name: '401', message: 'You must be logged in to perform this action'
                  });
            }

      } catch ({ name, message }) {
            next({ name, message })
      }
});

// PATCH /api/routines/:routineId

router.patch('/:routineId', async (req, res, next) => {
      const { routineId } = req.params;
      const { isPublic, name, goal } = req.body;
     
      const id = routineId;
      
      try {
            //If user not logged in send error
            if (!req.headers.authorization) {
                  res.status(401)
                  res.send({
                        error: 'GetMeError', name: '401', message: 'You must be logged in to perform this action'
                  });
            } 
            //Find creatorId of the routine that is getting modified
            const originalRoutine = await getRoutineById(id);
            const creatorId = originalRoutine.creatorId;

            //Decode the token to see if logged in user is the routine creator
            const usertoken = req.headers.authorization;
            const token = usertoken.split(' ');
            const decoded = jwt.verify(token[1], JWT_SECRET);

            //If the token id matches the creatorId, allow the routine to update
            if (decoded.id === creatorId) {
                  const updatedRoutine = await updateRoutine({ id, isPublic, name, goal });
                  res.send(updatedRoutine);
            } else {

                  //If user is not the routine creator send errror
                  res.status(403)
                  res.send({
                        error: 'GetMeError', name: '403', message: 'User ' + decoded.username +' is not allowed to update ' + originalRoutine.name,
                  });
            }
      } catch ({ error, message, name }) {
            next({ error, message, name  });
      }
});

// DELETE /api/routines/:routineId

// POST /api/routines/:routineId/activities

module.exports = router;
