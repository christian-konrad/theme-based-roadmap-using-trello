const express = require('express');
const trelloRoute = require('./trello.route');

const router = express.Router();

router.use('/trello', trelloRoute);

module.exports = router;
