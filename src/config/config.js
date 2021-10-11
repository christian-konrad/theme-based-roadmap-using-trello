const dotenv = require('dotenv');
const path = require('path');
const Joi = require('@hapi/joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),    
    TRELLO_API_KEY: Joi.string().description('Trello API key'),
    TRELLO_OAUTH_TOKEN: Joi.string().description('Trello OAuth token'),
    TRELLO_ROADMAP_BOARD_ID: Joi.string().description('Trello roadmap board id'),
    VISION: Joi.string().description('Your vision statement'),
    PILLARS: Joi.string().description('Your values and strategic pillars'),
    ROADMAP_STYLE: Joi.string().description('Style of the roadmap (either standalone or embedded)'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  trello: {
    apiKey: envVars.TRELLO_API_KEY,
    oAuthToken: envVars.TRELLO_OAUTH_TOKEN,
    roadmapBoardId: envVars.TRELLO_ROADMAP_BOARD_ID,
  },
  roadmap: {
    vision: envVars.VISION,
    pillars: envVars.PILLARS,
    style: envVars.ROADMAP_STYLE,
  }
};
