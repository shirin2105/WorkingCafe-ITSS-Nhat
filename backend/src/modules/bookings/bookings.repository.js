import { supabase } from '../../config/db.js';

const TABLE = "bookings";

export const findAll = async () => {
    return await supabase.from(TABLE).select();
};

export const findById = async (id) => {
    return await supabase
        .from(TABLE)
        .select()
        .eq("id", id)
        .single();
};

export const create = async (payload) => {
    return await supabase.from(TABLE).insert(payload).select();
};

export const update = async (id, payload) => {
    return await supabase
        .from(TABLE)
        .update(payload)
        .eq("id", Number(id))
        .select();
};

export const remove = async (id) => {
    return await supabase
        .from(TABLE)
        .delete()
        .eq("id", Number(id));
};