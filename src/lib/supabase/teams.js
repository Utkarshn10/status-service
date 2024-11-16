import { supabase } from "./client";

export const teamApi = {
  async list(organizationId) {
    const { data, error } = await supabase
      .from("teams")
      .select(
        `
          *,
          team_members(
            id,
            role,
            user_email
          )
        `
      )
      .eq("organization_id", organizationId);

    if (error) throw error;
    return data;
  },

  async create({ name, organizationId }) {
    const { data, error } = await supabase
      .from("teams")
      .insert([
        {
          name,
          organization_id: organizationId,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(teamId, updates) {
    const { data, error } = await supabase
      .from("teams")
      .update(updates)
      .eq("id", teamId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async addMember({ teamId, email, role }) {
    const { data, error } = await supabase
      .from("team_members")
      .insert([
        {
          team_id: teamId,
          user_email: email,
          role: role,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateMemberRole(memberId, role) {
    const { data, error } = await supabase
      .from("team_members")
      .update({ role })
      .eq("id", memberId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
