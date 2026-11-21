
const Project = require('../models/Project');

// CREATE PROJECT
const createProject = async (req, res) => {
    try {
        const { name, description, key } = req.body;

        if (!name || !key) {
            return res.status(400).json({
                success: false,
                message: 'Project name and key are required'
            });
        }

        const existingProject = await Project.findOne({
            owner: req.user._id,
            key: key.trim().toUpperCase()
        });

        if (existingProject) {
            return res.status(409).json({
                success: false,
                message: 'Project key already exists'
            });
        }

        const project = await Project.create({
            name,
            description,
            key: key.trim().toUpperCase(),
            owner: req.user._id,
            members: [req.user._id]
        });

        return res.status(201).json({
            success: true,
            message: 'Project created successfully',
            project
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// GET ALL PROJECTS
const getProjects = async (req, res) => {
    try {
        const projects = await Project.find({
            members: req.user._id
        })
            .populate('owner', 'name email')
            .populate('members', 'name email')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: projects.length,
            projects
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// GET SINGLE PROJECT
const getProjectById = async (req, res) => {
    try {
        const project = await Project.findOne({
            _id: req.params.id,
            members: req.user._id
        })
            .populate('owner', 'name email')
            .populate('members', 'name email');

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        return res.status(200).json({
            success: true,
            project
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// UPDATE PROJECT

const updateProject = async (req, res) => {
    try {
        const { name, description, status } = req.body;

        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Only Admin and Manager can update project
        if (!['admin', 'manager'].includes(req.projectRole)) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to update this project'
            });
        }

        if (name !== undefined) project.name = name;
        if (description !== undefined) project.description = description;

        if (status !== undefined) {
            if (!['active', 'archived'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid project status'
                });
            }

            project.status = status;
        }

        await project.save();

        return res.status(200).json({
            success: true,
            message: 'Project updated successfully',
            project
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// DELETE PROJECT
const deleteProject = async (req, res) => {
    try {
        const project = await Project.findOneAndDelete({
            _id: req.params.id,
            owner: req.user._id
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found or you are not the owner'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Project deleted successfully'
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ADD PROJECT MEMBER


const addProjectMember = async (req, res) => {
    try {
        const { email, role = 'developer' } = req.body;

        const allowedRoles = ['manager', 'developer', 'viewer'];

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Member email is required'
            });
        }

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid member role'
            });
        }

        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Only Admin and Manager can add members
        if (!['admin', 'manager'].includes(req.projectRole)) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to add members'
            });
        }

        const User = require('../models/User');

        const member = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'User not found. Please check the email.'
            });
        }

        if (project.members.some(
            id => id.toString() === member._id.toString()
        )) {
            return res.status(409).json({
                success: false,
                message: 'User is already a project member'
            });
        }

        project.members.push(member._id);

        project.memberRoles = project.memberRoles || [];

        project.memberRoles.push({
            user: member._id,
            role
        });

        await project.save();
        await project.populate('members', 'name email');

        return res.status(200).json({
            success: true,
            message: 'Member added successfully',
            project
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
    addProjectMember
};
