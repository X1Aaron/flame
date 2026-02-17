const { Sequelize } = require('sequelize');
const { join } = require('path');
const { Umzug, SequelizeStorage } = require('umzug');

// Utils
const backupDB = require('./utils/backupDb');
const Logger = require('../utils/Logger');
const logger = new Logger();

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './data/db.sqlite',
  logging: false,
});

const umzug = new Umzug({
  migrations: {
    glob: join(__dirname, './migrations/*.js'),
    resolve: ({ name, path, context }) => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const migration = require(path);
      return {
        name,
        up: async () => migration.up(context, Sequelize),
        down: async () => migration.down(context, Sequelize),
      };
    },
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

const connectDB = async () => {
  try {
    backupDB();

    await sequelize.authenticate();

    // execute all pending migrations
    const pendingMigrations = await umzug.pending();

    if (pendingMigrations.length > 0) {
      logger.log(`Executing ${pendingMigrations.length} pending migration(s)`);
      await umzug.up();
    }

    logger.log('Connected to database');
  } catch (error) {
    logger.log(`Unable to connect to the database: ${error.message}`, 'ERROR');
    process.exit(1);
  }
};

module.exports = {
  connectDB,
  sequelize,
};
