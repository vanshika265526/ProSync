<<<<<<< HEAD
const express = require('express');
const router = express.Router();
const {
    getNotes,
    createNote,
    updateNote,
    deleteNote,
} = require('../controllers/noteController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getNotes).post(protect, createNote);
router.route('/:id').put(protect, updateNote).delete(protect, deleteNote);

module.exports = router;
=======
const express = require('express');
const router = express.Router();
const {
    getNotes,
    createNote,
    updateNote,
    deleteNote,
} = require('../controllers/noteController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getNotes).post(protect, createNote);
router.route('/:id').put(protect, updateNote).delete(protect, deleteNote);

module.exports = router;
>>>>>>> 79dc160d18ec2038869e85b879f4b077f7e367b1
