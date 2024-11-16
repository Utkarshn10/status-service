import { useState, useEffect } from "react";
import { serviceApi } from "@/lib/supabase/services";

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const organizationId = "your-org-id"; // Get this from your auth context

  useEffect(() => {
    const loadServices = async () => {
      try {
        const data = await serviceApi.list(organizationId);
        setServices(data);
      } catch (error) {
        console.error("Failed to load services:", error);
      }
    };

    loadServices();
  }, [organizationId]);

  const handleStatusUpdate = async (serviceId, newStatus) => {
    try {
      const updatedService = await serviceApi.updateStatus(
        serviceId,
        newStatus
      );
      setServices(
        services.map((service) =>
          service.id === serviceId ? updatedService : service
        )
      );
    } catch (error) {
      console.error("Failed to update service status:", error);
    }
  };

  return (
    <div>
      <h1>Services</h1>
      {services.map((service) => (
        <div key={service.id}>
          <h3>{service.name}</h3>
          <p>Status: {service.current_status}</p>
          <select
            value={service.current_status}
            onChange={(e) => handleStatusUpdate(service.id, e.target.value)}
          >
            <option value="operational">Operational</option>
            <option value="degraded">Degraded</option>
            <option value="partial_outage">Partial Outage</option>
            <option value="major_outage">Major Outage</option>
          </select>
        </div>
      ))}
    </div>
  );
}
