# Umzug v3 Migration Fix

## Issue
After upgrading from umzug v2.3.0 to v3.8.2, the application crashed on startup with:
```
TypeError: Umzug is not a constructor
```

## Root Cause
Umzug v3 introduced breaking changes in the API:
- v2: `const Umzug = require('umzug')`
- v3: `const { Umzug, SequelizeStorage } = require('umzug')`

The configuration API also changed significantly.

## Changes Made to `/db/index.js`

### Before (v2 API):
```javascript
const Umzug = require('umzug');

const umzug = new Umzug({
  migrations: {
    path: join(__dirname, './migrations'),
    params: [sequelize.getQueryInterface()],
  },
  storage: 'sequelize',
  storageOptions: {
    sequelize,
  },
});
```

### After (v3 API):
```javascript
const { Umzug, SequelizeStorage } = require('umzug');

const umzug = new Umzug({
  migrations: {
    glob: join(__dirname, './migrations/*.js'),
    resolve: ({ name, path, context }) => {
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
```

## Key Changes
1. **Import**: Changed from default import to destructured import
2. **Storage**: Changed from string `'sequelize'` to class instance `new SequelizeStorage({ sequelize })`
3. **Migrations path**: Changed from `path` to `glob` pattern
4. **Params**: Changed from `params` array to `context` object
5. **Resolve**: Added explicit `resolve` function to handle migration loading

## Migration API Compatibility
The `up()` and `down()` methods in migration files remain compatible - they receive the same parameters:
- `queryInterface` (now via context)
- `Sequelize` constructor

## Testing
After this fix:
- ✅ Database connection succeeds
- ✅ Migrations are detected
- ✅ Migrations execute successfully
- ✅ Server starts without errors

## Alternative Solution
If you want to avoid breaking changes, you could downgrade to umzug v2:
```json
"umzug": "^2.3.0"
```

However, this would leave the package outdated. The v3 API is modern and actively maintained.

## References
- [Umzug v3 Migration Guide](https://github.com/sequelize/umzug#upgrading-from-v2)
- [Umzug v3 Documentation](https://github.com/sequelize/umzug)

## Status
✅ **FIXED** - Application now starts successfully with umzug v3
