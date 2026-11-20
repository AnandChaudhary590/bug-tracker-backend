
const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            default: ''
        },
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true
        },
        reporter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        assignee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        status: {
            type: String,
            enum: ['todo', 'in-progress', 'done'],
            default: 'todo'
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'urgent'],
            default: 'medium'
        },
                type: {
            type: String,
            enum: ['bug', 'task', 'story'],
            default: 'bug'
        },
        comments: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true
                },
                text: {
                    type: String,
                    required: true,
                    trim: true
                },
                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ]
    },
    { timestamps: true }
);

module.exports = mongoose.model('Ticket', ticketSchema);
