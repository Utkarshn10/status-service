import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase/client"; // Adjust the path as needed
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const Notification = {
  id: "",
  message: "",
  timestamp: "",
  type: "",
};

export default function Component() {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);
  const teamId =
    typeof window !== "undefined" ? localStorage.getItem("teamId") : null;

  useEffect(() => {
    if (!teamId) {
      console.error("Team ID is missing.");
      return;
    }

    const channel = supabase.channel(`org-${teamId}`);

    channel.on("status", (status) => {
      console.log("Realtime subscription status:", status);
      if (status === "ERROR") {
        console.error("Subscription failed.");
      }
    });

    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "incident_updates",
        filter: `team_id=eq.${teamId}`,
      },
      (payload) => {
        console.log("Incident update received:", payload);
        if (payload.new) {
          setNotifications((prev) => [
            {
              id: payload.new.id,
              message: payload.new.message,
              timestamp: new Date().toISOString(),
              type: "incident_update",
            },
            ...prev,
          ]);
        }
      }
    );

    channel.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "incidents",
        filter: `team_id=eq.${teamId}`,
      },
      (payload) => {
        console.log("New incident received:", payload);
        if (payload.new) {
          setNotifications((prev) => [
            {
              id: payload.new.id,
              message: `New incident: ${payload.new.title}`,
              timestamp: new Date().toISOString(),
              type: "new_incident",
            },
            ...prev,
          ]);
        }
      }
    );

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        console.log("Successfully subscribed to Realtime updates.");
      }
    });

    return () => {
      supabase.removeChannel(channel);
      console.log("Unsubscribed from Realtime updates.");
    };
  }, [teamId]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <div className="relative" ref={notificationRef}>
      <Button
        variant="outline"
        size="icon"
        className="relative"
        onClick={() => setShowNotifications(!showNotifications)}
        aria-label="Toggle notifications"
      >
        <Bell className="h-4 w-4" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </Button>
      {showNotifications && (
        <Card className="absolute right-0 mt-2 w-80 z-50 transform -translate-x-1/2 left-1/2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Button variant="ghost" size="sm" onClick={clearNotifications}>
              Clear all
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] w-full pr-4">
              {notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No new notifications
                </p>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0"
                  >
                    <span
                      className={`flex h-2 w-2 translate-y-1 rounded-full ${
                        notification.type === "incident_update"
                          ? "bg-orange-500"
                          : "bg-red-500"
                      }`}
                    />
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {notification.message}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
