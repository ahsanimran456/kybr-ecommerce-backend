const { usersService } = require("./users.service");

const getMe = async (req, res) => {
  const data = await usersService.getMe();
  res.json(data);
};

const updateMe = async (req, res) => {
  const data = await usersService.updateMe(req.body);
  res.json(data);
};

module.exports = { getMe, updateMe };
