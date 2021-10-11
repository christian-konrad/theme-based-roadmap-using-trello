const express = require('express');
const trelloController = require('../../controllers/trello.controller');

const router = express.Router();

router.route('/roadmap-board').get(trelloController.getRoadmapBoard);

module.exports = router;
