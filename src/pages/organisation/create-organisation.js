import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { organizationApi } from "@/lib/supabase/organisations";
import { Button } from "@/components/ui/button";

export default function CreateOrganization() {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
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
      console.log("orgData = ", orgData);
      if (orgData?.id) router.push(`${orgData?.id}/dashboard/team`); // Redirect to dashboard after creation
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  useEffect(() => {
    const getData = async () => {
      const user = await fetchUser();
      setUser(user);
    };
    getData();
  }, []);
  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Create Organization</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Organization Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isSubmitting}
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4  text-white rounded-md cus:outline-none focus:ring-2 {
            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? "Creating..." : "Create Organization"}
        </Button>
      </form>
    </div>
  );
}
