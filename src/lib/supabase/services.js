import { supabase } from "./client";

export const serviceApi = {
  async list(organizationId) {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("organization_id", organizationId)
      .order("display_order", { ascending: true });

    if (error) throw error;
    return data;
  },

  async create({ organizationId, name, description, currentStatus }) {
    const { data, error } = await supabase
      .from("services")
      .insert([
        {
          organization_id: organizationId,
          name,
          description,
          current_status: currentStatus,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateStatus(id, status) {
    const { data, error } = await supabase
      .from("services")
      .update({
        current_status: status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
