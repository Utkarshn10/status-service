import { supabase } from "./client";

export const serviceApi = {
  async list(organizationId, teamId) {
    const { data: services, error: servicesError } = await supabase
      .from("services")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("team_id", teamId);

    if (servicesError) throw servicesError;

    const incidentServiceIds = services.map((service) => service.id);

    const { data: incidentServices, error: incidentServicesError } =
      await supabase
        .from("incident_services")
        .select("incident_id, service_id")
        .in("service_id", incidentServiceIds);

    if (incidentServicesError) throw incidentServicesError;

    const incidentIds = incidentServices.map(
      (incidentService) => incidentService.incident_id
    );

    const { data: incidents, error: incidentsError } = await supabase
      .from("incidents")
      .select("*")
      .in("id", incidentIds);

    if (incidentsError) throw incidentsError;

    services.forEach((service) => {
      service.incidents = incidents.filter((incident) =>
        incidentServices.find(
          (incidentService) =>
            incidentService.incident_id === incident.id &&
            incidentService.service_id === service.id
        )
      );
    });

    return services;
  },

  async create({ organizationId, teamId, name, description, currentStatus }) {
    const { data, error } = await supabase
      .from("services")
      .insert([
        {
          organization_id: organizationId,
          team_id: teamId,
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

  async update(id, { name, description, currentStatus }) {
    const updateData = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (currentStatus !== undefined) updateData.current_status = currentStatus;

    const { data, error } = await supabase
      .from("services")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase.from("services").delete().eq("id", id);

    if (error) throw error;
    return true;
  },

  async listAll() {
    const { data, error } = await supabase
      .from("services")
      .select("*, incidents(*)");

    if (error) throw error;
    return data;
  },
};
