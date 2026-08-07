const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');

/**
 * Generic "is the caller on this project?" guard.
 *
 * Same contract as githubAuth.projectMember, but tolerant about where the id
 * lives — history/activity hang off `/api/projects/:id/...` while the GitHub
 * routes use `:projectId`. Kept separate so the GitHub middleware stays
 * untouched.
 *
 * Sets req.project and req.isProjectAdmin.
 */
const projectAccess = asyncHandler(async (req, res, next) => {
    const projectId =
        req.params.projectId || req.params.id || req.query.projectId || req.body?.projectId;

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
    const inTeam = (project.team || []).some((m) => m.email === req.user.email);

    if (!isCreator && !inTeam) {
        res.status(403);
        throw new Error('You do not have access to this project');
    }

    req.project = project;
    req.isProjectAdmin = isCreator;
    next();
});

module.exports = { projectAccess };
