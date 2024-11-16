import { supabase } from "./client";

export const subscribeToUpdates = (organizationId, callbacks) => {
  const channel = supabase.channel(`org-${organizationId}`);

  // Subscribe to service status changes
  channel.on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "services",
      filter: `organization_id=eq.${organizationId}`,
    },
    callbacks.onServiceUpdate
  );

  // Subscribe to new incidents
  channel.on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "incidents",
      filter: `organization_id=eq.${organizationId}`,
    },
    callbacks.onNewIncident
  );

  // Subscribe to incident updates
  channel.on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "incident_updates",
    },
    callbacks.onIncidentUpdate
  );

  channel.subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
