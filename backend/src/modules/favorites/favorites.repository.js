import { supabase } from "../../config/db.js";

const TABLE = "favorites";

export const findAll = async (userId, cafeId) => {
  let query = supabase.from(TABLE).select();
  if (userId) {
    query = query.eq("user_id", Number(userId));
  }
  if (cafeId) {
    query = query.eq("cafe_id", Number(cafeId));
  }
  return await query;
};

export const create = async (payload) => {
  return await supabase.from(TABLE).insert(payload).select();
};

export const remove = async (userId, cafeId) => {
  return await supabase
    .from(TABLE)
    .delete()
    .eq("user_id", Number(userId))
    .eq("cafe_id", Number(cafeId));
};
