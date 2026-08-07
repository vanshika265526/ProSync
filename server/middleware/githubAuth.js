const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');

/**
 * Loads the project named by :projectId (param or body) and asserts the caller
 * belongs to it. Runs after `protect`, so req.user is already populated.
 *
 * Sets:
 *   req.project        the Project document
 *   req.isProjectAdmin true when the caller created the project
 */
const projectMember = asyncHandler(async (req, res, next) => {
    const projectId = req.params.projectId || req.body.projectId;

    if (!projectId) {
        res.status(400);
        throw new Error('A project id is required');
    }

    const project = await Project.findById(projectId);
    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    const isCreator = project.user.toString() === req.user._id.toString();
    const inTeam = (project.team || []).some(m => m.email === req.user.email);

    if (!isCreator && !inTeam) {
        res.status(403);
        throw new Error('You do not have access to this project');
    }

    req.project = project;
    req.isProjectAdmin = isCreator;
    next();
});

/** Mutating repo-level actions (connect / disconnect) are Admin-only. */
const projectAdmin = asyncHandler(async (req, res, next) => {
    if (!req.isProjectAdmin) {
        res.status(403);
        throw new Error('Only the project Admin can change the GitHub connection');
    }
    next();
});

/** Rejects the request early when the project has no repository attached. */
const requireConnectedRepo = asyncHandler(async (req, res, next) => {
    if (!req.project?.github?.connected) {
        res.status(400);
        throw new Error('No GitHub repository is connected to this project');
    }
    next();
});

module.exports = { projectMember, projectAdmin, requireConnectedRepo };
