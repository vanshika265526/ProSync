const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/notificationController');

router.use(protect);

router.route('/')
    .get(ctrl.getNotifications)
    .post(ctrl.createNotification)
    .delete(ctrl.clearNotifications);

router.get('/count', ctrl.getUnreadCount);

// PATCH is the documented verb; PUT is accepted so the existing GitHub
// client code keeps working without a change.
router.patch('/read', ctrl.markRead);
router.put('/read', ctrl.markRead);

router.delete('/:id', ctrl.deleteNotification);

module.exports = router;
