const { supabase } = require("../../config/supabase");
const { HttpError } = require("../../utils/httpError");

const login = async (email, password) => {
  if (!email || !password) {
    throw new HttpError("Email and password are required", 400, "BadRequest");
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new HttpError(error.message, 401, "Unauthorized");
  }

  return data;
};

const register = async (email, password, metadata = {}) => {
  if (!email || !password) {
    throw new HttpError("Email and password are required", 400, "BadRequest");
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: metadata },
  });

  if (error) {
    throw new HttpError(error.message, 400, "BadRequest");
  }

  return data;
};

module.exports = { authService: { login, register } };
