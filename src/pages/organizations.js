import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { organizationApi } from "@/lib/supabase/organisations";
import { Button } from "@/components/ui/button";
import useAuthStore from "@/lib/auth/auth-context";
import Link from "next/link";

export default function CreateOrganization() {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const router = useRouter();
  const fetchUser = useAuthStore((state) => state.fetchUser);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const orgData = await organizationApi.create({
        name: name,
        user_id: user?.id,
      });
      if (orgData?.id)
        router.push(`/organization/${orgData?.id}/dashboard/teams`); // Redirect to dashboard after creation
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchOrganizations = async (userId) => {
    try {
      const data = await organizationApi.list({
        user_id: userId,
      });

      if (error) throw error;
      setOrganizations(data);
    } catch (err) {
      console.error("Failed to fetch organizations:", err);
    }
  };

  useEffect(() => {
    const getData = async () => {
      const user = await fetchUser();
      setUser(user);
      fetchOrganizations(user?.id);
    };
    getData();
  }, []);

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-xl md:text-2xl font-bold">Organization</h1>

        <Button
          onClick={() => setShowCreateForm(true)}
          className="ml-auto py-3 px-6 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Create Organization
        </Button>
      </div>
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {showCreateForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 md:mb-8 p-3 md:p-4 border rounded"
        >
          <h3 className="text-base md:text-lg font-semibold mb-4">
            Create New Organization
          </h3>
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Organization Name"
              className="border rounded p-2 w-full md:flex-grow text-sm md:text-base"
              required
              disabled={isSubmitting}
            />
            <div className="flex gap-2 w-full md:w-auto">
              <Button type="submit" className="flex-1 md:flex-initial">
                {isSubmitting ? "Creating..." : "Create Organization"}
              </Button>
            </div>
          </div>
        </form>
      )}

      <div className="mt-12">
        <div className="space-y-4 w-full">
          {organizations?.map((org) => (
            <div
              key={org.id}
              className="w-full p-4 bg-white rounded-lg hover:border-blue-600 border border-gray-200"
            >
              <Link href={`/organization/${org.id}/dashboard/teams`}>
                <p className="text-xl font-semibold text-blue-600 hover:text-blue-700">
                  {org.name}
                </p>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
