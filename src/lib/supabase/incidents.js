import { supabase } from "./client";

export const incidentApi = {
  async list(organizationId, status = null) {
    let query = supabase
      .from("incidents")
      .select(
        `
          *,
          incident_services(service_id),
          incident_updates(*)
        `
      )
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async create({
    organizationId,
    title,
    description,
    status,
    impact,
    affectedServices,
  }) {
    const { data: incident, error: incidentError } = await supabase
      .from("incidents")
      .insert([
        {
          organization_id: organizationId,
          title,
          description,
          status,
          impact,
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

  async addUpdate({ incidentId, message, status }) {
    const { data: update, error: updateError } = await supabase
      .from("incident_updates")
      .insert([
        {
          incident_id: incidentId,
          message,
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
