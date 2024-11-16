import { supabase } from "./client";

export const organizationApi = {
  async create({ name, user_id }) {
    // First check if organization with this name exists
    const { data: existingOrg } = await supabase
      .from("organizations")
      .select()
      .eq("name", name)
      .single();

    if (existingOrg) {
      throw new Error("An organization with this name already exists");
    }

    const { data, error } = await supabase
      .from("organizations")
      .insert([{ name: name, created_by: user_id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from("organizations")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
