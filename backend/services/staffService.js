import { supabase } from "../config/supabaseClient.js";

export const getStaff = async () => {
    const { data, error } = await supabase
        .from("Restaurant")
        .select("id, name, role, contact,joiningdate")
        .order("id", { ascending: true });

    if (error) throw new Error(error.message);
    return data;
};

export const addStaff = async (staff) => {
    const { error } = await supabase.from("Restaurant").insert([staff]);
    if (error) throw new Error(error.message);
    return true;
};

export const updateStaff = async (id, staff) => {
    const { error } = await supabase.from("Restaurant").update(staff).eq("id", id);
    if (error) throw new Error(error.message);
    return true;
};

export const deleteStaff = async (id) => {
    const { error } = await supabase.from("Restaurant").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return true;
};
