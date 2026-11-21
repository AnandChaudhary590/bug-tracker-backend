
const express = require('express');
const router = express.Router();

const {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
    addProjectMember
} = require('../controllers/projectController');

const { protect } = require('../middleware/authMiddleware');
const authorizeProjectRoles = require('../middleware/projectRoleMiddleware');

// All routes require login
router.use(protect);

// Create Project
router.post('/', createProject);

// Get All Projects
router.get('/', getProjects);

// Get Single Project
router.get('/:id', getProjectById);

// Update Project - Only Admin (Owner) and Manager
router.put('/:id', authorizeProjectRoles('admin', 'manager'), updateProject);

// Add Project Member - Only Admin (Owner) and Manager
router.post('/:id/members', authorizeProjectRoles('admin', 'manager'), addProjectMember);

// Delete Project - Only Admin (Owner)
router.delete('/:id', authorizeProjectRoles('admin'), deleteProject);

module.exports = router;
