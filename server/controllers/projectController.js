const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Get all projects for user (Owner or Team Member)
// @route   GET /api/projects
// @access  Private
const getProjects = asyncHandler(async (req, res) => {
    // Shared projects: where user is explicitly the owner OR in the team array
    const projects = await Project.find({
        $or: [
            { user: req.user._id },
            { 'team.email': req.user.email }
        ]
    });
    res.status(200).json(projects);
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

    const project = await Project.create({
        user: req.user._id,
        name,
        type,
        status,
        team,
    });

    // Mark onboarding as complete for the user
    await User.findByIdAndUpdate(req.user._id, { onboardingComplete: true });

    console.log(`[Project] Created: ${project.name} (_id: ${project._id})`);
    res.status(201).json(project);
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
        project.team.push({
            id: req.user._id.toString(),
            name: req.user.name,
            email: req.user.email,
            role: 'Member',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(req.user.name)}&background=random`
        });
    }

    await project.save();

    // Mark onboarding as complete
    await User.findByIdAndUpdate(req.user._id, { onboardingComplete: true });

    res.status(200).json(project);
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

    // Check if user is Admin in the team or the owner
    const userInTeam = project.team.find(member => member.email === req.user.email);
    const isAdmin = project.user.toString() === req.user._id.toString() || userInTeam?.role === 'Admin';

    if (!isAdmin) {
        res.status(403);
        throw new Error('Only Admins can update project details');
    }

    const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    });
    res.status(200).json(updatedProject);
});

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    // Only the primary owner (the one who created it) can delete the project
    if (project.user.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Only the project owner can delete the project');
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
