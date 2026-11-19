
const Ticket = require('../models/Ticket');
const Project = require('../models/Project');
const User = require('../models/User');

// Create Ticket
const createTicket = async (req, res) => {
    try {
        const {
            title,
            description,
            projectId,
            assignee,
            priority,
            type
        } = req.body;

        if (!title || !projectId) {
            return res.status(400).json({
                success: false,
                message: 'Title and projectId are required'
            });
        }

        const project = await Project.findOne({
            _id: projectId,
            members: req.user._id
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found or access denied'
            });
        }

        let assignedUser = null;

        if (assignee) {
            assignedUser = await User.findById(assignee);

            if (!assignedUser || !project.members.some(
                member => member.toString() === assignee
            )) {
                return res.status(400).json({
                    success: false,
                    message: 'Assignee must be a project member'
                });
            }
        }

        const ticket = await Ticket.create({
            title,
            description,
            project: projectId,
            reporter: req.user._id,
            assignee: assignedUser ? assignedUser._id : null,
            priority,
            type
        });

        return res.status(201).json({
            success: true,
            message: 'Ticket created successfully',
            ticket
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get All Tickets of a Project
const getProjectTickets = async (req, res) => {
    try {
        const project = await Project.findOne({
            _id: req.params.projectId,
            members: req.user._id
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found or access denied'
            });
        }

        const tickets = await Ticket.find({
            project: project._id
        })
            .populate('reporter', 'name email')
            .populate('assignee', 'name email')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: tickets.length,
            tickets
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Get Kanban Board
const getKanbanBoard = async (req, res) => {
    try {
        const project = await Project.findOne({
            _id: req.params.projectId,
            members: req.user._id
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found or access denied'
            });
        }

        const tickets = await Ticket.find({
            project: project._id
        })
            .populate('reporter', 'name email')
            .populate('assignee', 'name email')
            .sort({ createdAt: -1 });

        const board = {
            todo: tickets.filter(ticket => ticket.status === 'todo'),
            inProgress: tickets.filter(ticket => ticket.status === 'in-progress'),
            done: tickets.filter(ticket => ticket.status === 'done')
        };

        return res.status(200).json({
            success: true,
            board
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


const updateTicketStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const allowedStatuses = ['todo', 'in-progress', 'done'];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ticket status'
            });
        }

        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        const project = await Project.findOne({
            _id: ticket.project,
            members: req.user._id
        });

        if (!project) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        ticket.status = status;
        await ticket.save();

        return res.status(200).json({
            success: true,
            message: 'Ticket status updated successfully',
            ticket
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Update Ticket
const updateTicket = async (req, res) => {
    try {
        const { title, description, status, priority, type, assignee } = req.body;

        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        const project = await Project.findOne({
            _id: ticket.project,
            members: req.user._id
        });

        if (!project) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        if (title !== undefined) ticket.title = title;
        if (description !== undefined) ticket.description = description;

        if (status !== undefined) {
            if (!['todo', 'in-progress', 'done'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid ticket status'
                });
            }
            ticket.status = status;
        }

        if (priority !== undefined) {
            if (!['low', 'medium', 'high', 'urgent'].includes(priority)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid ticket priority'
                });
            }
            ticket.priority = priority;
        }

        if (type !== undefined) {
            if (!['bug', 'task', 'story'].includes(type)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid ticket type'
                });
            }
            ticket.type = type;
        }

        if (assignee !== undefined) {
            if (assignee === null) {
                ticket.assignee = null;
            } else {
                const user = await User.findById(assignee);

                if (!user || !project.members.some(
                    member => member.toString() === assignee
                )) {
                    return res.status(400).json({
                        success: false,
                        message: 'Assignee must be a project member'
                    });
                }

                ticket.assignee = user._id;
            }
        }

        await ticket.save();

        return res.status(200).json({
            success: true,
            message: 'Ticket updated successfully',
            ticket
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


const deleteTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        const project = await Project.findOne({
            _id: ticket.project,
            members: req.user._id
        });

        if (!project) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        await ticket.deleteOne();

        return res.status(200).json({
            success: true,
            message: 'Ticket deleted successfully'
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



module.exports = {
    createTicket,
    getProjectTickets,
    updateTicket,
    deleteTicket,
    getKanbanBoard,
    updateTicketStatus
};
