const axios = require("axios");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

exports.pathaoZoneController = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const city_id = parseInt(id);

  const response = await axios.post(
    `${process.env.PATHAO_BASE_URL}/aladdin/api/v1/issue-token`,
    {
      client_id: process.env.PATHAO_CLIENT_ID,
      client_secret: process.env.PATHAO_CLIENT_SECRET,
      username: process.env.PATHAO_EMAIL,
      password: process.env.PATHAO_PASS,
      grant_type: process.env.PATHAO_GRANT,
    },
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.data.access_token) {
    return next(new AppError("Access token not received yet", 400));
  }

  const reqZone = await axios.get(
    `${process.env.PATHAO_BASE_URL}/aladdin/api/v1/cities/${city_id}/zone-list`,
    {
      headers: {
        Authorization: `Bearer ${response.data.access_token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );

  res.status(200).json({
    status: "success",
    data: {
      ...reqZone.data.data,
    },
  });
});

exports.pathaoAreaController = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const zone_id = parseInt(id);

  const response = await axios.post(
    `${process.env.PATHAO_BASE_URL}/aladdin/api/v1/issue-token`,
    {
      client_id: process.env.PATHAO_CLIENT_ID,
      client_secret: process.env.PATHAO_CLIENT_SECRET,
      username: process.env.PATHAO_EMAIL,
      password: process.env.PATHAO_PASS,
      grant_type: process.env.PATHAO_GRANT,
    },
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.data.access_token) {
    return next(new AppError("Access token not received yet", 400));
  }

  const reqArea = await axios.get(
    `${process.env.PATHAO_BASE_URL}/aladdin/api/v1/zones/${zone_id}/area-list`,
    {
      headers: {
        Authorization: `Bearer ${response.data.access_token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );

  res.status(200).json({
    status: "success",
    data: {
      ...reqArea.data.data,
    },
  });
});
