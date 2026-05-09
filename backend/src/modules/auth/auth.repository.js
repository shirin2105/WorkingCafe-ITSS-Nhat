import { supabase } from '../../config/db.js';

export const findByEmail = async (email) => {
    return await supabase
        .from('accounts')
        .select()
        .eq('email', email)
        .single();
};

export const findByUsername = async (username) => {
    return await supabase
        .from('accounts')
        .select()
        .eq('username', username)
        .single();
};

export const createAccount = async (payload) => {
    return await supabase
        .from('accounts')
        .insert(payload)
        .select()
        .single();
};

export const createCafe = async (payload) => {
    return await supabase
        .from('cafes')
        .insert(payload)
        .select()
        .single();
};

export const deleteAccountById = async (id) => {
    return await supabase
        .from('accounts')
        .delete()
        .eq('id', Number(id));
};
