const asyncHandler = require('express-async-handler');
const History = require('../models/History');
const Activity = require('../models/Activity');

/**
 * Read endpoints for the Project History Timeline (Feature 3) and the Live
 * Activity Feed (Feature 4). Both are cursor-friendly: they page with
 * skip/limit and always return `hasMore` so the client's infinite scroll
 * never has to guess.
 *
 * `req.project` is populated by the projectAccess middleware, so access
 * control is already done by the time we get here.
 */

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parsePaging = (query) => ({
    page: Math.max(1, parseInt(query.page, 10) || 1),
    limit: Math.min(100, Math.max(1, parseInt(query.limit, 10) || 25)),
});

/** Shared filter builder: `filter` is a category, `search` is free text. */
const buildQuery = (projectId, query, searchFields) => {
    const mongoQuery = { project: projectId };

    const filter = query.filter;
    if (filter && filter !== 'all') {
        // Accept a comma list so the UI can OR several chips together.
        const categories = String(filter).split(',').map((c) => c.trim()).filter(Boolean);
        if (categories.length === 1) mongoQuery.category = categories[0];
        else if (categories.length > 1) mongoQuery.category = { $in: categories };
    }

    const search = (query.search || '').trim();
    if (search) {
        const rx = new RegExp(escapeRegex(search), 'i');
        mongoQuery.$or = searchFields.map((field) => ({ [field]: rx }));
    }

    // Optional time window, used by the timeline's "Last month" jump.
    if (query.since) {
        const since = new Date(query.since);
        if (!Number.isNaN(since.getTime())) mongoQuery.createdAt = { $gte: since };
    }

    return mongoQuery;
};

// @desc    Project history timeline
// @route   GET /api/projects/:id/history?page=&limit=&filter=&search=
// @access  Private (project members)
const getProjectHistory = asyncHandler(async (req, res) => {
    const { page, limit } = parsePaging(req.query);
    const query = buildQuery(req.project._id, req.query, [
        'description', 'entityTitle', 'actorName', 'action',
    ]);

    const [items, total] = await Promise.all([
        History.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
        History.countDocuments(query),
    ]);

    res.status(200).json({ items, page, limit, total, hasMore: page * limit < total });
});

// @desc    Live activity feed for a project
// @route   GET /api/projects/:id/activity?page=&limit=&filter=&search=
// @access  Private (project members)
const getProjectActivity = asyncHandler(async (req, res) => {
    const { page, limit } = parsePaging(req.query);
    const query = buildQuery(req.project._id, req.query, [
        'description', 'actorName', 'action',
    ]);

    const [items, total] = await Promise.all([
        Activity.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
        Activity.countDocuments(query),
    ]);

    res.status(200).json({ items, page, limit, total, hasMore: page * limit < total });
});

// @desc    Counts per category, for the filter chips' badges
// @route   GET /api/projects/:id/history/stats
// @access  Private (project members)
const getHistoryStats = asyncHandler(async (req, res) => {
    const rows = await History.aggregate([
        { $match: { project: req.project._id } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const byCategory = rows.reduce((acc, r) => ({ ...acc, [r._id || 'system']: r.count }), {});
    const total = rows.reduce((sum, r) => sum + r.count, 0);

    res.status(200).json({ total, byCategory });
});

module.exports = { getProjectHistory, getProjectActivity, getHistoryStats };
