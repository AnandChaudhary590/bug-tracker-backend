
const express = require('express');
const router = express.Router();

const {
    createTicket,
    getProjectTickets,
    updateTicket,
    deleteTicket,
    getKanbanBoard,
    updateTicketStatus,
    addComment,
    getComments
} = require('../controllers/ticketController');

const { protect } = require('../middleware/authMiddleware');
const authorizeProjectRoles = require('../middleware/projectRoleMiddleware');

router.use(protect);

// Create Ticket
router.post(
    '/',
    authorizeProjectRoles('admin', 'manager', 'developer'),
    createTicket
);

// Get Project Tickets
router.get('/project/:projectId', getProjectTickets);

// Get Kanban Board
router.get('/board/:projectId', getKanbanBoard);

// Update Ticket
router.put(
    '/:id',
    authorizeProjectRoles('admin', 'manager', 'developer'),
    updateTicket
);

// Delete Ticket
router.delete(
    '/:id',
    authorizeProjectRoles('admin', 'manager'),
    deleteTicket
);

// Update Ticket Status
router.patch(
    '/:id/status',
    authorizeProjectRoles('admin', 'manager', 'developer'),
    updateTicketStatus
);

// Add Comment
router.post('/:id/comments', addComment);

// Get Comments
router.get('/:id/comments', getComments);

module.exports = router;
