import { supabase } from "../../config/db.js";

const TABLE = "menu_reviews";

export const findAll = async (menuItemId, userId) => {
  let query = supabase.from(TABLE).select();
  if (menuItemId) {
    query = query.eq("menu_item_id", Number(menuItemId));
  }
  if (userId) {
    query = query.eq("user_id", Number(userId));
  }
  return await query;
};

export const findById = async (id) => {
  return await supabase.from(TABLE).select().eq("id", id).single();
};

export const create = async (payload) => {
  return await supabase.from(TABLE).insert(payload).select();
};

export const update = async (id, payload) => {
  return await supabase.from(TABLE).update(payload).eq("id", Number(id)).select();
};

export const remove = async (id) => {
  return await supabase.from(TABLE).delete().eq("id", Number(id));
};
