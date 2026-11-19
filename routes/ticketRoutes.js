
const express = require('express');
const router = express.Router();

const {
    createTicket,
    getProjectTickets,
    updateTicket,
    deleteTicket,
    getKanbanBoard,
    updateTicketStatus
} = require('../controllers/ticketController');

const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// Create Ticket
router.post('/', createTicket);

// Get Project Tickets
router.get('/project/:projectId', getProjectTickets);

router.put('/:id', updateTicket);

router.delete('/:id', deleteTicket);

router.get('/board/:projectId', getKanbanBoard);

router.patch('/:id/status', updateTicketStatus);

module.exports = router;
