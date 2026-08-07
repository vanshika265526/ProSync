const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const { projectMember, projectAdmin, requireConnectedRepo } = require('../middleware/githubAuth');
const ctrl = require('../controllers/githubController');

// Everything below requires a signed-in user.
router.use(protect);

// --- Notifications (not project-scoped, so they come first) ---
router.get('/notifications', ctrl.getNotifications);
router.put('/notifications/read', ctrl.readNotifications);
router.delete('/notifications/:id', ctrl.deleteNotification);
router.delete('/notifications', ctrl.clearNotifications);

// --- Repository validation (no project needed) ---
router.post('/validate', ctrl.validateRepository);

// --- Repository connection (project Admin only) ---
router.post('/:projectId/connect', projectMember, projectAdmin, ctrl.connectRepository);
router.delete('/:projectId/disconnect', projectMember, projectAdmin, ctrl.disconnectRepository);

// --- Repository reads (any project member) ---
router.get('/:projectId', projectMember, ctrl.getProjectGithub);
router.post('/:projectId/sync', projectMember, requireConnectedRepo, ctrl.syncProject);
router.get('/:projectId/activity', projectMember, requireConnectedRepo, ctrl.getActivity);
router.get('/:projectId/commits', projectMember, requireConnectedRepo, ctrl.getCommits);
router.get('/:projectId/pulls', projectMember, requireConnectedRepo, ctrl.listPullRequests);
router.get('/:projectId/issues', projectMember, requireConnectedRepo, ctrl.listIssues);

// --- Task links ---
router.post('/:projectId/tasks/:taskId/pull-request', projectMember, requireConnectedRepo, ctrl.attachPullRequest);
router.delete('/:projectId/tasks/:taskId/pull-request', projectMember, ctrl.detachPullRequest);
router.post('/:projectId/tasks/:taskId/issue', projectMember, requireConnectedRepo, ctrl.attachIssue);
router.delete('/:projectId/tasks/:taskId/issue', projectMember, ctrl.detachIssue);
router.post('/:projectId/tasks/:taskId/sync', projectMember, requireConnectedRepo, ctrl.syncSingleTask);

module.exports = router;
