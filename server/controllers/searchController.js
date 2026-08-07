const asyncHandler = require('express-async-handler');
const searchService = require('../services/searchService');

// @desc    Global search powering the command palette
// @route   GET /api/search/global?q=&limit=
// @access  Private
const globalSearch = asyncHandler(async (req, res) => {
    const { q = '', limit } = req.query;
    const results = await searchService.globalSearch(req.user, q, {
        limit: Math.min(20, Math.max(1, parseInt(limit, 10) || 8)),
    });

    const total =
        results.projects.length + results.tasks.length +
        results.notes.length + results.members.length;

    res.status(200).json({ query: q, total, ...results });
});

// @desc    The palette's persisted "Recent" list
// @route   GET /api/search/recent
// @access  Private
const getRecents = asyncHandler(async (req, res) => {
    res.status(200).json(await searchService.listRecents(req.user._id));
});

// @desc    Remember that the user picked something in the palette
// @route   POST /api/search/recent
// @access  Private
const addRecent = asyncHandler(async (req, res) => {
    const { key, label, subtitle, kind, action, projectId } = req.body;

    if (!key || !label) {
        res.status(400);
        throw new Error('A recent entry needs a key and a label');
    }

    const saved = await searchService.recordRecent(req.user._id, {
        key, label, subtitle, kind, action, projectId,
    });
    res.status(201).json(saved);
});

// @desc    Clear the recent list
// @route   DELETE /api/search/recent
// @access  Private
const clearRecents = asyncHandler(async (req, res) => {
    await searchService.clearRecents(req.user._id);
    res.status(200).json({ success: true });
});

module.exports = { globalSearch, getRecents, addRecent, clearRecents };
