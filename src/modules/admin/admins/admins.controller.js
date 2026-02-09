const { asyncHandler } = require("../../../utils/asyncHandler");
const { adminsService } = require("./admins.service");

const list = asyncHandler(async (req, res) => {
  const result = await adminsService.listAdmins(req.query);
  res.json({ success: true, data: result });
});

const get = asyncHandler(async (req, res) => {
  const result = await adminsService.getAdmin(req.params.id);
  res.json({ success: true, data: result });
});

const create = asyncHandler(async (req, res) => {
  const result = await adminsService.createAdmin(req.body);
  res.status(201).json({ success: true, data: result });
});

const update = asyncHandler(async (req, res) => {
  const result = await adminsService.updateAdmin(req.params.id, req.body);
  res.json({ success: true, data: result });
});

const remove = asyncHandler(async (req, res) => {
  const result = await adminsService.deleteAdmin(req.params.id, req.user.id);
  res.json({ success: true, data: result });
});

module.exports = { adminsController: { list, get, create, update, remove } };
