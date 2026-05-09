import { supabase } from "../../config/db.js";

const TABLE = "cafe_features";

export const findAll = async (cafeId, featureId) => {
  let query = supabase.from(TABLE).select();
  if (cafeId) {
    query = query.eq("cafe_id", Number(cafeId));
  }
  if (featureId) {
    query = query.eq("feature_id", Number(featureId));
  }
  return await query;
};

export const create = async (payload) => {
  return await supabase.from(TABLE).insert(payload).select();
};

export const remove = async (cafeId, featureId) => {
  return await supabase
    .from(TABLE)
    .delete()
    .eq("cafe_id", Number(cafeId))
    .eq("feature_id", Number(featureId));
};
