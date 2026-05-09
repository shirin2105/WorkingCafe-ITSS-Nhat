import { supabase } from "../../config/db.js";

const TABLE = "notifications";

export const findAll = async (userId, isRead) => {
  let query = supabase.from(TABLE).select();
  if (userId) {
    query = query.eq("user_id", Number(userId));
  }
  if (typeof isRead !== "undefined") {
    query = query.eq("is_read", isRead === "true" || isRead === true);
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
