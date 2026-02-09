const { asyncHandler } = require("../../../utils/asyncHandler");
const { dashboardService } = require("./dashboard.service");

const getStats = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getStats();
  res.json({ success: true, data: stats });
});

module.exports = { dashboardController: { getStats } };
