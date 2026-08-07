<<<<<<< HEAD
const express = require('express');
const router = express.Router();
const {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getTasks).post(protect, createTask);
router.route('/:id').put(protect, updateTask).delete(protect, deleteTask);

module.exports = router;
=======
const express = require('express');
const router = express.Router();
const {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getTasks).post(protect, createTask);
router.route('/:id').put(protect, updateTask).delete(protect, deleteTask);

module.exports = router;
>>>>>>> 79dc160d18ec2038869e85b879f4b077f7e367b1
