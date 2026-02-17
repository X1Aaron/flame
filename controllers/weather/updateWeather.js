const asyncWrapper = require('../../middleware/asyncWrapper');
const getExternalWeather = require('../../utils/getExternalWeather');

// @desc      Update weather
// @route     GET /api/weather/update?lat=X&long=Y&zipCode=XXXXX
// @access    Public
const updateWeather = asyncWrapper(async (req, res, next) => {
  // Accept optional lat/long/zipCode from query params for unauthenticated users
  const { lat, long, zipCode } = req.query;
  const weather = await getExternalWeather(
    lat ? parseFloat(lat) : undefined,
    long ? parseFloat(long) : undefined,
    zipCode
  );

  res.status(200).json({
    success: true,
    data: weather,
  });
});

module.exports = updateWeather;
