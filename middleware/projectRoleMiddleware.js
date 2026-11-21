
const Project = require('../models/Project');
const Ticket = require('../models/Ticket');

const authorizeProjectRoles = (...allowedRoles) => {
    return async (req, res, next) => {
        try {
            let projectId =
                req.params.projectId ||
                req.body.projectId ||
                req.body.project;

            // For routes containing an ID, check whether it is a Project or Ticket
            if (!projectId && req.params.id) {
                const project = await Project.findById(req.params.id);

                if (project) {
                    projectId = project._id;
                } else {
                    const ticket = await Ticket.findById(req.params.id);

                    if (!ticket) {
                        return res.status(404).json({
                            success: false,
                            message: 'Project or ticket not found'
                        });
                    }

                    projectId = ticket.project;
                }
            }

            if (!projectId) {
                return res.status(400).json({
                    success: false,
                    message: 'Project ID is required'
                });
            }

            const project = await Project.findById(projectId);

            if (!project) {
                return res.status(404).json({
                    success: false,
                    message: 'Project not found'
                });
            }

            // Project owner is always Admin
            if (project.owner.toString() === req.user._id.toString()) {
                req.project = project;
                req.projectRole = 'admin';
                return next();
            }

            const isMember = project.members.some(
                member => member.toString() === req.user._id.toString()
            );

            if (!isMember) {
                return res.status(403).json({
                    success: false,
                    message: 'You are not a member of this project'
                });
            }

            const memberRole = project.memberRoles.find(
                item => item.user.toString() === req.user._id.toString()
            );

            const role = memberRole ? memberRole.role : 'developer';

            if (!allowedRoles.includes(role)) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have permission to perform this action'
                });
            }

            req.project = project;
            req.projectRole = role;

            next();
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Authorization failed',
                error: error.message
            });
        }
    };
};

module.exports = authorizeProjectRoles;
