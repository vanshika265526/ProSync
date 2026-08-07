const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
<<<<<<< HEAD
const { defaultAvatar } = require('../utils/userProfile');
const events = require('../services/eventService');

// The only two roles that exist in the product:
//   Admin        -> the person who created the project
//   Collaborator -> everyone who joined via the invite link / was invited
const ADMIN = 'Admin';
const COLLABORATOR = 'Collaborator';

// Legacy documents may still contain Owner / Member / Contributor / Viewer.
// Collapse everything down to the two supported roles at read AND write time,
// so old projects render correctly without a migration script.
const normalizeTeam = (project) => {
    if (!project) return project;
    const plain = typeof project.toObject === 'function' ? project.toObject() : project;
    const ownerId = plain.user ? plain.user.toString() : null;

    plain.team = (plain.team || []).map((member) => {
        const isCreator =
            (ownerId && member.id && member.id.toString() === ownerId) ||
            member.role === ADMIN ||
            member.role === 'Owner';
        return { ...member, role: isCreator ? ADMIN : COLLABORATOR };
    });

    return plain;
};

// @desc    Get all projects for user (Admin or Collaborator)
// @route   GET /api/projects
// @access  Private
const getProjects = asyncHandler(async (req, res) => {
    // Shared projects: where user is explicitly the creator OR in the team array
=======

// @desc    Get all projects for user (Owner or Team Member)
// @route   GET /api/projects
// @access  Private
const getProjects = asyncHandler(async (req, res) => {
    // Shared projects: where user is explicitly the owner OR in the team array
>>>>>>> 79dc160d18ec2038869e85b879f4b077f7e367b1
    const projects = await Project.find({
        $or: [
            { user: req.user._id },
            { 'team.email': req.user.email }
        ]
    });
<<<<<<< HEAD
    res.status(200).json(projects.map(normalizeTeam));
=======
    res.status(200).json(projects);
>>>>>>> 79dc160d18ec2038869e85b879f4b077f7e367b1
});

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
const createProject = asyncHandler(async (req, res) => {
    const { name, type, status, team = [] } = req.body;

    if (!name) {
        res.status(400);
        throw new Error('Please add a project name');
    }

<<<<<<< HEAD
    const creatorId = req.user._id.toString();
    const creatorAvatar = req.user.avatar || defaultAvatar(req.user.name);

    // Anyone the creator pre-listed is a Collaborator, never an Admin.
    const sanitizedTeam = team
        .filter(member => member && member.email && member.email !== req.user.email)
        .map(member => ({
            id: member.id && member.id !== 'me' ? String(member.id) : '',
            name: member.name || String(member.email).split('@')[0],
            email: member.email,
            role: COLLABORATOR,
            avatar: member.avatar || defaultAvatar(member.name || member.email),
        }));

    // The creator is always the Admin, and always first in the list.
    sanitizedTeam.unshift({
        id: creatorId,
        name: req.user.name,
        email: req.user.email,
        role: ADMIN,
        avatar: creatorAvatar,
    });
=======
    // Ensure the creator is in the team as Admin if not already there
    const creatorInTeam = team.find(member => member.email === req.user.email);
    if (!creatorInTeam) {
        team.push({
            id: req.user._id.toString(),
            name: req.user.name,
            email: req.user.email,
            role: 'Admin',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(req.user.name)}&background=random`
        });
    }
>>>>>>> 79dc160d18ec2038869e85b879f4b077f7e367b1

    const project = await Project.create({
        user: req.user._id,
        name,
        type,
        status,
<<<<<<< HEAD
        team: sanitizedTeam,
=======
        team,
>>>>>>> 79dc160d18ec2038869e85b879f4b077f7e367b1
    });

    // Mark onboarding as complete for the user
    await User.findByIdAndUpdate(req.user._id, { onboardingComplete: true });

    console.log(`[Project] Created: ${project.name} (_id: ${project._id})`);
<<<<<<< HEAD

    await events.recordEvent({
        project,
        actor: req.user,
        action: 'project_created',
        description: `Project "${project.name}" created`,
        entityType: 'project',
        entityId: project._id,
        entityTitle: project.name,
        notify: {
            type: 'project_created',
            title: 'Project Created',
            message: `Project "${project.name}" created`,
            detail: `${sanitizedTeam.length} member${sanitizedTeam.length > 1 ? 's' : ''}`,
            severity: 'success',
            entityType: 'project',
            entityId: project._id,
        },
    });

    res.status(201).json(normalizeTeam(project));
=======
    res.status(201).json(project);
>>>>>>> 79dc160d18ec2038869e85b879f4b077f7e367b1
});

// @desc    Join project via ID
// @route   POST /api/projects/join
// @access  Private
const joinProject = asyncHandler(async (req, res) => {
    const { projectId } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

<<<<<<< HEAD
    const isCreator = project.user.toString() === req.user._id.toString();
    const avatar = req.user.avatar || defaultAvatar(req.user.name);

    // Check if user is already in the team (possibly as a pre-invited placeholder)
    const existingMemberIndex = project.team.findIndex(member => member.email === req.user.email);

    // Distinguishes "filled in a placeholder" from "genuinely new teammate",
    // so we don't announce the same person joining twice.
    const wasAlreadyOnBoard = existingMemberIndex !== -1 && !!project.team[existingMemberIndex].id;

    if (existingMemberIndex !== -1) {
        // Fill the placeholder in with the real account data
        project.team[existingMemberIndex].id = req.user._id.toString();
        project.team[existingMemberIndex].name = req.user.name;
        project.team[existingMemberIndex].avatar = avatar;
        project.team[existingMemberIndex].role = isCreator ? ADMIN : COLLABORATOR;
    } else {
        // Someone joining through the invite link is always a Collaborator
=======
    // Check if user is already in the team (as a placeholder)
    const existingMemberIndex = project.team.findIndex(member => member.email === req.user.email);

    if (existingMemberIndex !== -1) {
        // Update placeholder member with real user ID and data
        project.team[existingMemberIndex].id = req.user._id.toString();
        project.team[existingMemberIndex].name = req.user.name;
        project.team[existingMemberIndex].avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(req.user.name)}&background=random`;
        // Keep their existing role (Admin/Contributor) if it was pre-assigned
    } else {
        // Add user to team as Member if not found
>>>>>>> 79dc160d18ec2038869e85b879f4b077f7e367b1
        project.team.push({
            id: req.user._id.toString(),
            name: req.user.name,
            email: req.user.email,
<<<<<<< HEAD
            role: isCreator ? ADMIN : COLLABORATOR,
            avatar,
=======
            role: 'Member',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(req.user.name)}&background=random`
>>>>>>> 79dc160d18ec2038869e85b879f4b077f7e367b1
        });
    }

    await project.save();

    // Mark onboarding as complete
    await User.findByIdAndUpdate(req.user._id, { onboardingComplete: true });

<<<<<<< HEAD
    if (!wasAlreadyOnBoard && !isCreator) {
        await events.recordEvent({
            project,
            actor: req.user,
            action: 'member_joined',
            description: `${req.user.name} joined ${project.name}`,
            entityType: 'member',
            entityId: req.user._id,
            entityTitle: req.user.name,
            notify: {
                type: 'member_joined',
                title: 'Member Joined',
                message: `${req.user.name} joined ${project.name}`,
                detail: req.user.email,
                severity: 'success',
                entityType: 'member',
                entityId: req.user._id,
            },
        });
    }

    res.status(200).json(normalizeTeam(project));
=======
    res.status(200).json(project);
>>>>>>> 79dc160d18ec2038869e85b879f4b077f7e367b1
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

<<<<<<< HEAD
    const isCreator = project.user.toString() === req.user._id.toString();
    const userInTeam = project.team.find(member => member.email === req.user.email);
    const isAdmin = isCreator || userInTeam?.role === ADMIN || userInTeam?.role === 'Owner';
=======
    // Check if user is Admin in the team or the owner
    const userInTeam = project.team.find(member => member.email === req.user.email);
    const isAdmin = project.user.toString() === req.user._id.toString() || userInTeam?.role === 'Admin';
>>>>>>> 79dc160d18ec2038869e85b879f4b077f7e367b1

    if (!isAdmin) {
        res.status(403);
        throw new Error('Only Admins can update project details');
    }

<<<<<<< HEAD
    // Never let the request body reassign ownership or hand out roles.
    const { user, _id, ...updates } = req.body;

    if (Array.isArray(updates.team)) {
        const creatorId = project.user.toString();
        updates.team = updates.team.map(member => {
            const isProjectCreator =
                (member.id && member.id.toString() === creatorId) ||
                (member.email && member.email === req.user.email && isCreator);
            return {
                id: member.id && member.id !== 'me' ? String(member.id) : '',
                name: member.name,
                email: member.email,
                role: isProjectCreator ? ADMIN : COLLABORATOR,
                avatar: member.avatar || defaultAvatar(member.name || member.email),
            };
        });

        // The creator can never be removed from their own project.
        if (!updates.team.some(m => m.id === creatorId)) {
            const original = project.team.find(m => m.id === creatorId);
            if (original) updates.team.unshift({ ...original.toObject(), role: ADMIN });
        }
    }

    // Snapshot the roster before the write so we can name who left.
    const teamBefore = (project.team || []).map(m => ({ email: m.email, name: m.name }));

    const updatedProject = await Project.findByIdAndUpdate(req.params.id, updates, {
        new: true,
    });

    try {
        await recordProjectChanges({ before: project, after: updatedProject, updates, teamBefore, actor: req.user });
    } catch (error) {
        console.error('[Projects] event recording failed:', error.message);
    }

    res.status(200).json(normalizeTeam(updatedProject));
});

/**
 * Translate a project diff into timeline entries.
 * Roster changes get named entries; scalar fields collapse into one line.
 */
const recordProjectChanges = async ({ before, after, updates, teamBefore, actor }) => {
    const common = {
        project: after,
        actor,
        entityType: 'project',
        entityId: after._id,
        entityTitle: after.name,
    };

    if (Array.isArray(updates.team)) {
        const afterEmails = new Set((after.team || []).map(m => m.email));
        const beforeEmails = new Set(teamBefore.map(m => m.email));

        for (const member of after.team || []) {
            if (!beforeEmails.has(member.email)) {
                await events.recordEvent({
                    ...common,
                    action: 'member_invited',
                    description: `${member.name || member.email} was invited to ${after.name}`,
                    entityType: 'member',
                    entityTitle: member.name || member.email,
                    category: 'member',
                });
            }
        }

        for (const member of teamBefore) {
            if (!afterEmails.has(member.email)) {
                await events.recordEvent({
                    ...common,
                    action: 'member_removed',
                    description: `${member.name || member.email} was removed from ${after.name}`,
                    entityType: 'member',
                    entityTitle: member.name || member.email,
                    category: 'member',
                });
            }
        }
    }

    if (updates.status && updates.status !== before.status) {
        const archived = String(updates.status).toLowerCase() === 'archived';
        await events.recordEvent({
            ...common,
            action: archived ? 'project_archived' : 'project_updated',
            description: archived
                ? `Project "${after.name}" archived`
                : `Project status changed from ${before.status} to ${after.status}`,
            field: 'status',
            oldValue: before.status,
            newValue: after.status,
        });
    }

    const scalar = ['name', 'type'].filter(k => updates[k] !== undefined && updates[k] !== before[k]);
    if (scalar.length) {
        await events.recordEvent({
            ...common,
            action: 'project_updated',
            description: `Updated ${scalar.join(', ')} on ${after.name}`,
            field: scalar.join(','),
            oldValue: scalar.map(k => before[k]).join(', '),
            newValue: scalar.map(k => after[k]).join(', '),
        });
    }
};

=======
    const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    });
    res.status(200).json(updatedProject);
});

>>>>>>> 79dc160d18ec2038869e85b879f4b077f7e367b1
// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

<<<<<<< HEAD
    // Only the Admin who created it can delete the project
    if (project.user.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Only the project Admin can delete the project');
=======
    // Only the primary owner (the one who created it) can delete the project
    if (project.user.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Only the project owner can delete the project');
>>>>>>> 79dc160d18ec2038869e85b879f4b077f7e367b1
    }

    // Delete associated tasks
    await Task.deleteMany({ projectId: project._id });
    await project.deleteOne();
    res.status(200).json({ id: req.params.id });
});

module.exports = {
    getProjects,
    createProject,
    joinProject,
    updateProject,
    deleteProject,
};
