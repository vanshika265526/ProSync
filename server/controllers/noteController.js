const asyncHandler = require('express-async-handler');
const Note = require('../models/Note');
const Project = require('../models/Project');
const events = require('../services/eventService');

/**
 * Notes are user-scoped, but the client can tag one with the project it was
 * written against. When it does, note edits land on that project's timeline;
 * when it doesn't, nothing is recorded and the note behaves exactly as before.
 */
const recordNoteEvent = async ({ projectId, actor, action, description, note, notify }) => {
    if (!projectId) return;
    try {
        const project = await Project.findById(projectId).select('user team name');
        if (!project) return;

        await events.recordEvent({
            project,
            actor,
            action,
            description,
            category: 'note',
            entityType: 'note',
            entityId: note?._id,
            entityTitle: note?.title,
            notify: notify
                ? {
                    type: action,
                    category: 'note',
                    title: 'Note Updated',
                    message: description,
                    detail: project.name,
                    severity: 'info',
                    entityType: 'note',
                    entityId: note?._id,
                }
                : null,
        });
    } catch (error) {
        console.error('[Notes] event recording failed:', error.message);
    }
};

// @desc    Get all notes
// @route   GET /api/notes
// @access  Private
const getNotes = asyncHandler(async (req, res) => {
    const notes = await Note.find({ user: req.user._id });
    res.status(200).json(notes);
});

// @desc    Create a note
// @route   POST /api/notes
// @access  Private
const createNote = asyncHandler(async (req, res) => {
    const { title, content, projectId } = req.body;

    if (!title || !content) {
        res.status(400);
        throw new Error('Please add a title and content');
    }

    const note = await Note.create({
        user: req.user._id,
        title,
        content,
        projectId: projectId || undefined,
    });

    await recordNoteEvent({
        projectId: note.projectId,
        actor: req.user,
        action: 'note_created',
        description: `Note "${note.title}" created`,
        note,
    });

    res.status(201).json(note);
});

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private
const updateNote = asyncHandler(async (req, res) => {
    const note = await Note.findById(req.params.id);

    if (!note) {
        res.status(404);
        throw new Error('Note not found');
    }

    // Check for user
    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }

    // Make sure the logged in user matches the note user
    if (note.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('User not authorized');
    }

    const updatedNote = await Note.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    });

    await recordNoteEvent({
        projectId: updatedNote.projectId,
        actor: req.user,
        action: 'note_updated',
        description: `Note "${updatedNote.title}" updated`,
        note: updatedNote,
        notify: true,
    });

    res.status(200).json(updatedNote);
});

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = asyncHandler(async (req, res) => {
    const note = await Note.findById(req.params.id);

    if (!note) {
        res.status(404);
        throw new Error('Note not found');
    }

    // Check for user
    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }

    // Make sure the logged in user matches the note user
    if (note.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('User not authorized');
    }

    const { projectId, title } = note;
    await note.deleteOne();

    await recordNoteEvent({
        projectId,
        actor: req.user,
        action: 'note_deleted',
        description: `Note "${title}" deleted`,
        note: { _id: req.params.id, title },
    });

    res.status(200).json({ id: req.params.id });
});

module.exports = {
    getNotes,
    createNote,
    updateNote,
    deleteNote,
};
