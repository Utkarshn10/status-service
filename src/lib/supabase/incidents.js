import { supabase } from "./client";

export const incidentApi = {
  async create({
    organizationId,
    teamId,
    title,
    description,
    status,
    affectedServices,
  }) {
    const { data: incident, error: incidentError } = await supabase
      .from("incidents")
      .insert([
        {
          organization_id: organizationId,
          team_id: teamId,
          title,
          description,
          status,
        },
      ])
      .select()
      .single();

    if (incidentError) throw incidentError;

    if (affectedServices?.length) {
      const serviceConnections = affectedServices.map((serviceId) => ({
        incident_id: incident.id,
        service_id: serviceId,
      }));

      const { error: servicesError } = await supabase
        .from("incident_services")
        .insert(serviceConnections);

      if (servicesError) throw servicesError;
    }

    return incident;
  },

  async addUpdate({ incidentId, teamId, message, status }) {
    const { data: update, error: updateError } = await supabase
      .from("incident_updates")
      .insert([
        {
          incident_id: incidentId,
          message,
          team_id: teamId,
          status,
        },
      ])
      .select()
      .single();

    if (updateError) throw updateError;

    // Update incident status
    const { error: incidentError } = await supabase
      .from("incidents")
      .update({
        status,
        updated_at: new Date().toISOString(),
        resolved_at: status === "resolved" ? new Date().toISOString() : null,
      })
      .eq("id", incidentId);

    if (incidentError) throw incidentError;

    return update;
  },
};
