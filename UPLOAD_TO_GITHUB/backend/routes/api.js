const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const eventController = require('../controllers/eventController');
const registrationController = require('../controllers/registrationController');
const feedbackController = require('../controllers/feedbackController');
const clubController = require('../controllers/clubController');
const announcementController = require('../controllers/announcementController');
const dbmsController = require('../controllers/dbmsController');

// User Authentication & Persona Routes
router.post('/auth/login', userController.login);
router.get('/users', userController.getAllUsers);
router.get('/users/:id', userController.getUserById);
router.post('/users', userController.addUser);
router.delete('/users/:id', userController.deleteUser);

// Events Routes
router.get('/events', eventController.getAllEvents);
router.get('/events/upcoming', eventController.getUpcomingApprovedEvents);
router.post('/events/propose', eventController.proposeEvent);
router.put('/events/:id', eventController.updateEvent);
router.delete('/events/:id', eventController.deleteEvent);
router.put('/events/:id/approve', eventController.approveEvent);
router.put('/events/:id/reject', eventController.rejectEvent);

// Clubs, Memberships & Venues Routes
router.get('/clubs', clubController.getAllClubs);
router.get('/clubs/directory', clubController.getClubLeadershipDirectory);
router.post('/clubs/memberships', clubController.addMembership);
router.delete('/clubs/memberships/:id', clubController.removeMembership);
router.get('/venues', clubController.getAllVenues);

// Registrations & Attendance Routes
router.get('/registrations', registrationController.getRegistrations);
router.post('/registrations', registrationController.registerForEvent);
router.put('/registrations/:id/cancel', registrationController.cancelRegistration);
router.put('/registrations/:id/attendance', registrationController.markAttendance);

// Feedback Routes
router.get('/feedback', feedbackController.getAllFeedback);
router.get('/feedback/analytics', feedbackController.getFeedbackAnalytics);
router.post('/feedback', feedbackController.submitFeedback);
router.delete('/feedback/:id', feedbackController.deleteFeedback);

// Announcements Routes
router.get('/announcements', announcementController.getAllAnnouncements);
router.post('/announcements', announcementController.postAnnouncement);
router.delete('/announcements/:id', announcementController.deleteAnnouncement);

// DBMS 3NF Tables & Viva Demonstration Routes
router.get('/dbms/status', dbmsController.getStatus);
router.get('/dbms/tables', dbmsController.getTableCounts);
router.get('/dbms/tables/:name', dbmsController.getTableData);
router.post('/dbms/query', dbmsController.executeCustomQuery);
router.post('/dbms/reset', dbmsController.resetDatabase);

module.exports = router;
