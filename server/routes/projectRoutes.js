const express = require('express');
const router = express.Router();
const {
    getProjects,
    createProject,
    joinProject,
    updateProject,
    deleteProject,
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const { projectAccess } = require('../middleware/projectAccess');
const timeline = require('../controllers/timelineController');

router.route('/').get(protect, getProjects).post(protect, createProject);
router.post('/join', protect, joinProject);

// Timeline + feed reads. Declared before `/:id` so the more specific paths win.
router.get('/:id/history', protect, projectAccess, timeline.getProjectHistory);
router.get('/:id/history/stats', protect, projectAccess, timeline.getHistoryStats);
router.get('/:id/activity', protect, projectAccess, timeline.getProjectActivity);

router.route('/:id').put(protect, updateProject).delete(protect, deleteProject);

module.exports = router;
