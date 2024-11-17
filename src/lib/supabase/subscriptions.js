import { supabase } from "./client";

export const subscribeToUpdates = (teamId, callbacks) => {
  const channel = supabase.channel(`org-${teamId}`);

  // Subscribe to service status changes
  channel.on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "services",
      filter: `team_id=eq.${teamId}`,
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
      filter: `team_id=eq.${teamId}`,
    },
    callbacks.onNewIncident
  );
  channel.on("status", (status) => {
    console.log("Subscription status:", status);
  });

  // Subscribe to incident updates
  channel.on(
    "postgres_changes",
    {
      event: "*", // Listen for all changes (INSERT, UPDATE, DELETE)
      schema: "public",
      table: "incident_updates",
    },
    // callbacks.onIncidentUpdate
    (payload) => {
      console.log("Received payload:", payload);
    }
  );

  // Subscribe to maintenance updates
  channel.on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "maintenance",
      filter: `team_id=eq.${teamId}`,
    },
    callbacks.onMaintenanceUpdate
  );

  channel.subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
