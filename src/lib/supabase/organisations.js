import { supabase } from "./client";

export const organizationApi = {
  async list({ user_id }) {
    const { data, error } = await supabase
      .from("organizations")
      .select()
      .eq("created_by", user_id);

    if (error) throw error;
    return data;
  },

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

  async getUserOrganizationAndTeamId(email) {
    // First, get the team_id from team_members based on the user email
    const { data: teamMember, error: teamMemberError } = await supabase
      .from("team_members")
      .select("team_id")
      .eq("user_email", email);

    if (teamMemberError) throw teamMemberError;

    // If no team_member found, return null
    if (teamMember.length == 0) return { teamId: null, organizationId: null };

    // Then, get the organization_id from teams based on the team_id
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("organization_id")
      .eq("id", teamMember[0].team_id);

    if (teamError) throw teamError;
    return {
      teamId: teamMember[0].team_id,
      organizationId: team[0].organization_id,
    };
  },

  async checkIfUserCreatedOrganization(organization_id, user_id, from = "") {
    const { data, error } = await supabase
      .from("organizations")
      .select("created_by")
      .eq("id", organization_id)
      .eq("created_by", user_id);
    if (error) throw error;
    return data?.length > 0 ? true : false;
  },
};
