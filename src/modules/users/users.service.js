const { supabase } = require("../../config/supabase");

const getMe = async () => {
  return {
    user: null,
    message: "Attach auth middleware to resolve user profile",
  };
};

const updateMe = async (payload) => {
  return {
    updated: false,
    payload,
    message: "Attach auth middleware to update user profile",
  };
};

module.exports = { usersService: { getMe, updateMe } };
