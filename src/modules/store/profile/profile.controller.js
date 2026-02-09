const { asyncHandler } = require("../../../utils/asyncHandler");
const { storeProfileService } = require("./profile.service");

const getProfile = asyncHandler(async (req, res) => {
  const result = await storeProfileService.getProfile(req.user.id);
  res.json({ success: true, data: result });
});

const updateProfile = asyncHandler(async (req, res) => {
  const result = await storeProfileService.updateProfile(req.user.id, req.body);
  res.json({ success: true, data: result });
});

module.exports = { storeProfileController: { getProfile, updateProfile } };
