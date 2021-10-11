const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const trelloService = require('../services/trello.service');

// TODO additional controller for vision and pillars
// TODO or have vision and pillars in custom trello lanes

const getRoadmapBoard = catchAsync(async (req, res) => {
  const roadmapBoard = await trelloService.getRoadmapBoard();
  if (!roadmapBoard) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Roadmap not found');
  }
  res.send(roadmapBoard);
});

module.exports = {
  getRoadmapBoard,
};
