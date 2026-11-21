
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            default: ''
        },

        key: {
            type: String,
            required: true,
            uppercase: true,
            trim: true
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],

        memberRoles: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true
                },

                role: {
                    type: String,
                    enum: ['manager', 'developer', 'viewer'],
                    default: 'developer'
                }
            }
        ],

        status: {
            type: String,
            enum: ['active', 'archived'],
            default: 'active'
        }
    },
    {
        timestamps: true
    }
);

projectSchema.index({ owner: 1, key: 1 }, { unique: true });

module.exports = mongoose.model('Project', projectSchema);
