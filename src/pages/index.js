import { useState, useEffect } from "react";
import { serviceApi } from "@/lib/supabase/services";
import { AlertCircle, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatusPage() {
  const [services, setServices] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const data = await serviceApi.listAll();
        setServices(data);
        setError(null);
      } catch (error) {
        console.error("Failed to load services:", error);
        setError("Failed to load services. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "operational":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "degraded":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "outage":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "operational":
        return "bg-green-100 text-green-800";
      case "degraded":
        return "bg-yellow-100 text-yellow-800";
      case "outage":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center text-gray-900">
        Service Status
      </h1>
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="grid gap-6 md:grid-cols-2">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <Skeleton className="h-6 w-2/3" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full mt-2" />
                </CardContent>
              </Card>
            ))
          : services.map((service) => (
              <Card
                key={service.id}
                className="overflow-hidden transition-all duration-300 hover:shadow-lg"
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between">
                    <span>{service.name}</span>
                    {getStatusIcon(service.current_status)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge
                    className={`mb-2 ${getStatusColor(service.current_status)}`}
                  >
                    {service.current_status}
                  </Badge>
                  {service.incidents && service.incidents.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">
                        Recent Incidents:
                      </h3>
                      <ul className="space-y-2">
                        {service.incidents.map((incident) => (
                          <li key={incident.id} className="text-sm">
                            <span className="font-medium">
                              {incident.title}
                            </span>
                            <Badge className="ml-2" variant="outline">
                              {incident.status}
                            </Badge>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
      </div>
    </div>
  );
}
