const { supabase } = require("../../config/supabase");

const getCart = async () => {
  return {
    items: [],
    message: "Attach auth middleware to load user cart",
  };
};

const addItem = async (payload) => {
  return {
    added: false,
    payload,
    message: "Attach auth middleware to add item",
  };
};

const removeItem = async (id) => {
  return {
    removed: false,
    id,
    message: "Attach auth middleware to remove item",
  };
};

module.exports = { cartService: { getCart, addItem, removeItem } };
