const asyncHandler = require('express-async-handler');
const notificationService = require('../services/notificationService');

// @desc    Paginated + filterable notification list
// @route   GET /api/notifications?page=1&limit=20&filter=all&search=
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
    const { page, limit, filter, search } = req.query;
    const result = await notificationService.listForUser(req.user._id, {
        page, limit, filter, search,
    });
    res.status(200).json(result);
});

// @desc    Unread badge count (cheap poll target / socket fallback)
// @route   GET /api/notifications/count
// @access  Private
const getUnreadCount = asyncHandler(async (req, res) => {
    res.status(200).json({ unreadCount: await notificationService.unreadCount(req.user._id) });
});

// @desc    Create a notification addressed to the signed-in user
// @route   POST /api/notifications
// @access  Private
//
// Deliberately self-addressed only: the client may create reminders for
// itself, but must never be able to push a notification to someone else.
// Cross-user notifications are emitted server-side via eventService.
const createNotification = asyncHandler(async (req, res) => {
    const { title, message, detail, type, category, severity, priority, url, projectId } = req.body;

    if (!title) {
        res.status(400);
        throw new Error('Please add a notification title');
    }

    const [created] = await require('../services/eventService').recordNotification({
        recipients: [req.user._id],
        excludeActor: false,
        project: projectId,
        type: type || 'custom',
        category: category || 'system',
        title,
        message,
        detail,
        severity,
        priority,
        url,
    });

    res.status(201).json(created || null);
});

// @desc    Mark some or all notifications read
// @route   PATCH /api/notifications/read   (PUT kept as an alias)
// @access  Private
const markRead = asyncHandler(async (req, res) => {
    // No ids => mark everything read.
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : undefined;
    await notificationService.markRead(req.user._id, ids);
    res.status(200).json({
        success: true,
        unreadCount: await notificationService.unreadCount(req.user._id),
    });
});

// @desc    Delete one notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = asyncHandler(async (req, res) => {
    await notificationService.remove(req.user._id, req.params.id);
    res.status(200).json({
        id: req.params.id,
        unreadCount: await notificationService.unreadCount(req.user._id),
    });
});

// @desc    Delete every notification for the user
// @route   DELETE /api/notifications
// @access  Private
const clearNotifications = asyncHandler(async (req, res) => {
    await notificationService.clearAll(req.user._id);
    res.status(200).json({ success: true, unreadCount: 0 });
});

module.exports = {
    getNotifications,
    getUnreadCount,
    createNotification,
    markRead,
    deleteNotification,
    clearNotifications,
};
