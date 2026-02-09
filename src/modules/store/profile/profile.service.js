const { supabase } = require("../../../config/supabase");
const { HttpError } = require("../../../utils/httpError");

/**
 * User Profile - logged-in user ka apna profile
 */

const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, phone, avatar_url, role, created_at")
    .eq("id", userId)
    .single();

  if (error || !data) throw new HttpError("Profile not found", 404, "NotFound");

  return data;
};

const updateProfile = async (userId, body) => {
  const { full_name, phone, avatar_url } = body;

  const updates = {};
  if (full_name !== undefined) updates.full_name = full_name;
  if (phone !== undefined) updates.phone = phone;
  if (avatar_url !== undefined) updates.avatar_url = avatar_url;

  if (Object.keys(updates).length === 0) {
    throw new HttpError("No fields to update", 400, "BadRequest");
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select("id, email, full_name, phone, avatar_url, role, created_at")
    .single();

  if (error) throw new HttpError(error.message, 400, "BadRequest");

  return data;
};

module.exports = {
  storeProfileService: { getProfile, updateProfile },
};
