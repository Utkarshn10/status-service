import { useState, useEffect } from "react";
import { serviceApi } from "@/lib/supabase/services";
import { incidentApi } from "@/lib/supabase/incidents";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { organizationApi } from "@/lib/supabase/organisations";
import { teamApi } from "@/lib/supabase/teams";
import useAuthStore from "@/lib/auth/auth-context";

// Main component for managing services
export default function ServicesPage() {
  const router = useRouter();
  const { organizationId, teamId } = router.query;
  const [services, setServices] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [isMemberOfTeam, setIsMemberOfTeam] = useState(false);
  const fetchUser = useAuthStore((state) => state.fetchUser);

  // Form data for creating and updating services
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    currentStatus: "operational",
  });

  // Form data for creating incidents
  const [incidentFormData, setIncidentFormData] = useState({
    title: "",
    description: "",
    status: "investigating",
    affectedServices: [],
  });

  // Effect to load services and check team membership
  useEffect(() => {
    const teamid = localStorage.getItem("teamId") || null;
    if (!teamid) localStorage.setItem("teamId", teamId);
    const loadServices = async () => {
      try {
        const user = await fetchUser();

        // Early return if essential data is missing
        if (!organizationId || !teamId || !user?.id || !user?.email) {
          console.log("Missing required data:", {
            organizationId,
            teamId,
            userId: user?.id,
            userEmail: user?.email,
          });
          return;
        }

        console.log("Checking membership:", {
          userEmail: user.email,
          userId: user.id,
          teamId,
          organizationId,
        });

        // Check team membership and organization ownership in parallel
        const [teamMembership, isOrgCreator] = await Promise.all([
          teamApi.isMemberOfTeam(teamId, user.email),
          organizationApi.checkIfUserCreatedOrganization(
            organizationId,
            user.id,
            "from - services"
          ),
        ]);

        const isMember = teamMembership || isOrgCreator;

        setIsMemberOfTeam(isMember);

        if (isMember) {
          const data = await serviceApi.list(organizationId, teamId);
          setServices(data);
        } else {
          console.log(
            "User is not a member of the team or organization creator"
          );
        }
      } catch (error) {
        console.error("Failed to load services:", error);
        // Optionally show an error toast/notification here
      }
    };

    loadServices();
  }, [organizationId, teamId, fetchUser]);

  // Status icons for services
  const statusIcons = {
    operational: <CheckCircle className="h-5 w-5 text-green-500" />,
    degraded: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
    partial_outage: <AlertCircle className="h-5 w-5 text-orange-500" />,
    major_outage: <XCircle className="h-5 w-5 text-red-500" />,
  };

  // Incident status options
  const incidentStatusOptions = [
    { value: "investigating", label: "Investigating" },
    { value: "identified", label: "Identified" },
    { value: "monitoring", label: "Monitoring" },
    { value: "resolved", label: "Resolved" },
  ];

  // Function to handle service status update
  const handleStatusUpdate = async (serviceId, newStatus) => {
    try {
      const updatedService = await serviceApi.updateStatus(
        serviceId,
        newStatus
      );
      setServices(
        services?.map((service) =>
          service.id === serviceId ? updatedService : service
        )
      );
    } catch (error) {
      console.error("Failed to update service status:", error);
    }
  };

  // Function to handle service creation
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const newService = await serviceApi.create({
        organizationId,
        teamId,
        ...formData,
      });
      setServices([...services, newService]);
      setShowCreateForm(false);
      setFormData({
        name: "",
        description: "",
        currentStatus: "operational",
      });
    } catch (error) {
      console.error("Failed to create service:", error);
    }
  };

  // Function to handle service edit
  const handleEdit = (service) => {
    setFormData({
      id: service.id,
      name: service.name,
      description: service.description,
      currentStatus: service.current_status,
    });
    setShowEditForm(true);
  };

  // Function to handle service update
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updatedService = await serviceApi.update(formData.id, {
        name: formData.name,
        description: formData.description,
        currentStatus: formData.currentStatus,
      });
      setServices(
        services?.map((service) =>
          service.id === formData.id ? updatedService : service
        )
      );
      setShowEditForm(false);
      setFormData({
        name: "",
        description: "",
        currentStatus: "operational",
      });
    } catch (error) {
      console.error("Failed to update service:", error);
    }
  };

  // Function to handle incident creation
  const handleIncidentCreate = async (e) => {
    e.preventDefault();
    try {
      const newIncident = await incidentApi.create({
        organizationId,
        teamId,
        ...incidentFormData,
        affectedServices: [selectedService.id],
      });

      // Update the services state to include the new incident
      setServices(
        services.map((service) => {
          if (service.id === selectedService.id) {
            return {
              ...service,
              incidents: [...(service.incidents || []), newIncident],
            };
          }
          return service;
        })
      );

      setShowIncidentForm(false);
      setIncidentFormData({
        title: "",
        description: "",
        status: "investigating",
        affectedServices: [],
      });
      setSelectedService(null);
    } catch (error) {
      console.error("Failed to create incident:", error);
    }
  };

  // Function to handle incident status update
  const handleIncidentStatusUpdate = async (
    incidentId,
    title,
    serviceId,
    newStatus
  ) => {
    try {
      const update = await incidentApi.addUpdate({
        incidentId,
        status: newStatus,
        teamId: teamId,
        message: `Status of ${title} updated to ${newStatus}`,
      });

      // Update the services state to reflect the new incident status
      setServices(
        services.map((service) => {
          if (service.id === serviceId) {
            return {
              ...service,
              incidents: service.incidents.map((incident) => {
                if (incident.id === incidentId) {
                  return { ...incident, status: newStatus };
                }
                return incident;
              }),
            };
          }
          return service;
        })
      );
    } catch (error) {
      console.error("Failed to update incident status:", error);
    }
  };

  // Render the component
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Services</h1>
        <Button onClick={() => setShowCreateForm(true)}>Add New Service</Button>
      </div>

      {(showCreateForm || showEditForm) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {showEditForm ? "Edit Service" : "Create New Service"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={showEditForm ? handleUpdate : handleCreate}
              className="space-y-4"
            >
              <div>
                <label className="block mb-1 font-medium">Name</label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Status</label>
                <Select
                  value={formData.currentStatus}
                  onValueChange={(value) =>
                    setFormData({ ...formData, currentStatus: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operational">Operational</SelectItem>
                    <SelectItem value="degraded">Degraded</SelectItem>
                    <SelectItem value="partial_outage">
                      Partial Outage
                    </SelectItem>
                    <SelectItem value="major_outage">Major Outage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {showEditForm ? "Update" : "Create"} Service
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setShowEditForm(false);
                    setFormData({
                      name: "",
                      description: "",
                      currentStatus: "operational",
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {showIncidentForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Incident</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleIncidentCreate} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Title</label>
                <Input
                  type="text"
                  value={incidentFormData.title}
                  onChange={(e) =>
                    setIncidentFormData({
                      ...incidentFormData,
                      title: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Description</label>
                <Textarea
                  value={incidentFormData.description}
                  onChange={(e) =>
                    setIncidentFormData({
                      ...incidentFormData,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Initial Status</label>
                <Select
                  value={incidentFormData.status}
                  onValueChange={(value) =>
                    setIncidentFormData({ ...incidentFormData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {incidentStatusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Create Incident</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowIncidentForm(false);
                    setSelectedService(null);
                    setIncidentFormData({
                      title: "",
                      description: "",
                      status: "investigating",
                      affectedServices: [],
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {isMemberOfTeam ? (
          services?.map((service) => (
            <Card key={service.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">{service.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    {statusIcons[service.current_status]}
                    <span className="capitalize">
                      {service.current_status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {service.description}
                </p>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-2">
                    <Select
                      value={service.current_status}
                      onValueChange={(value) =>
                        handleStatusUpdate(service.id, value)
                      }
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Update status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="operational">Operational</SelectItem>
                        <SelectItem value="degraded">Degraded</SelectItem>
                        <SelectItem value="partial_outage">
                          Partial Outage
                        </SelectItem>
                        <SelectItem value="major_outage">
                          Major Outage
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() => {
                        setSelectedService(service);
                        setShowIncidentForm(true);
                      }}
                      variant="secondary"
                    >
                      Create Incident
                    </Button>
                  </div>
                  <Button onClick={() => handleEdit(service)} variant="outline">
                    Edit Service
                  </Button>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Incidents</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {service?.incidents?.length > 0 ? (
                        service?.incidents?.map((incident) => (
                          <TableRow key={incident.id}>
                            <TableCell>{incident.title}</TableCell>
                            <TableCell className="capitalize">
                              {incident.status}
                            </TableCell>
                            <TableCell>
                              {new Date(incident.created_at).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Select
                                value={incident.status}
                                onValueChange={(value) =>
                                  handleIncidentStatusUpdate(
                                    incident.id,
                                    incident.title,
                                    service.id,
                                    value
                                  )
                                }
                              >
                                <SelectTrigger className="w-[140px]">
                                  <SelectValue placeholder="Update status" />
                                </SelectTrigger>
                                <SelectContent>
                                  {incidentStatusOptions.map((option) => (
                                    <SelectItem
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center">
                            No incidents added
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center text-2xl font-bold">
            You are not a member of this team
          </div>
        )}
      </div>
    </div>
  );
}
