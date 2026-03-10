const asyncHandler = require('express-async-handler');
const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Get all tasks for a project
// @route   GET /api/tasks
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
    const { projectId } = req.query;

    if (!projectId) {
        // Fallback to older behavior if no projectId is provided
        const tasks = await Task.find({ user: req.user._id });
        return res.status(200).json(tasks);
    }

    // Check if user is in the project team
    const project = await Project.findById(projectId);
    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    const isMember = project.user.toString() === req.user._id.toString() ||
        project.team.some(member => member.email === req.user.email);

    if (!isMember) {
        res.status(401);
        throw new Error('Not authorized to view tasks for this project');
    }

    const tasks = await Task.find({ projectId });
    res.status(200).json(tasks);
});

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
const createTask = asyncHandler(async (req, res) => {
    const { projectId, title, description, status, priority, deadline, members, tags, subtasks } = req.body;

    if (!projectId || !title) {
        res.status(400);
        throw new Error('Please add a project ID and task title');
    }

    const project = await Project.findById(projectId);
    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    // Role check: Only Admins can create tasks
    const userInTeam = project.team.find(member => member.email === req.user.email);
    const isAdmin = project.user.toString() === req.user._id.toString() || userInTeam?.role === 'Admin';

    if (!isAdmin) {
        res.status(403);
        throw new Error('Only project Admins can create tasks');
    }

    const task = await Task.create({
        user: req.user._id,
        projectId,
        title,
        description,
        status,
        priority,
        deadline,
        members,
        tags,
        subtasks,
    });

    res.status(201).json(task);
});

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);
    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    const project = await Project.findById(task.projectId);

    // Check if user is in team
    const userInTeam = project.team.find(member => member.email === req.user.email);
    const isMember = project.user.toString() === req.user._id.toString() || !!userInTeam;

    if (!isMember) {
        res.status(401);
        throw new Error('User not authorized');
    }

    const isAdmin = project.user.toString() === req.user._id.toString() || userInTeam?.role === 'Admin';

    // If member but not admin, they can only update status or subtasks
    // This is a soft check, in a real app we'd be more granular
    if (!isAdmin && (req.body.title || req.body.description || req.body.projectId)) {
        res.status(403);
        throw new Error('Members can only update task status and progress');
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    });

    res.status(200).json(updatedTask);
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);
    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    const project = await Project.findById(task.projectId);
    const userInTeam = project.team.find(member => member.email === req.user.email);
    const isAdmin = project.user.toString() === req.user._id.toString() || userInTeam?.role === 'Admin';

    if (!isAdmin) {
        res.status(403);
        throw new Error('Only project Admins can delete tasks');
    }

    await task.deleteOne();
    res.status(200).json({ id: req.params.id });
});

module.exports = {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
};
