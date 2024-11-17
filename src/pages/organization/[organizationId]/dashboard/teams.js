import { useState, useEffect } from "react";
import { teamApi } from "@/lib/supabase/teams";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import Link from "next/link";

export default function TeamPage() {
  const [teams, setTeams] = useState([]);
  const [showNewTeamForm, setShowNewTeamForm] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { organizationId } = router.query;

  // Effect to load teams data when the component mounts or organizationId changes
  useEffect(() => {
    const loadTeams = async () => {
      try {
        const data = await teamApi.list(organizationId);
        const orgId = localStorage.getItem("organizationId") || null;
        if (!orgId) localStorage.setItem("organizationId", organizationId);
        setTeams(data);
        setError(null);
      } catch (error) {
        console.error("Failed to load teams:", error);
        setError("Failed to load teams. Please try again later.");
      }
    };

    loadTeams();
  }, [organizationId]);

  // Function to handle the creation of a new team
  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      const newTeam = await teamApi.create({
        name: newTeamName,
        organizationId,
      });
      setTeams([...teams, newTeam]);
      setNewTeamName("");
      setShowNewTeamForm(false);
      setError(null);
    } catch (error) {
      console.error("Failed to create team:", error);
      setError("Failed to create team. Please try again.");
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-xl md:text-2xl font-bold">Teams</h1>
        <Button
          onClick={() => setShowNewTeamForm(true)}
          className="w-full md:w-auto"
        >
          Create New Team
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 md:p-4 bg-red-100 border border-red-400 text-red-700 rounded text-sm md:text-base">
          {error}
        </div>
      )}

      {showNewTeamForm && (
        <form
          onSubmit={handleCreateTeam}
          className="mb-6 md:mb-8 p-3 md:p-4 border rounded"
        >
          <h3 className="text-base md:text-lg font-semibold mb-4">
            Create New Team
          </h3>
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <input
              type="text"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="Team Name"
              className="border rounded p-2 w-full md:flex-grow text-sm md:text-base"
              required
            />
            <div className="flex gap-2 w-full md:w-auto">
              <Button type="submit" className="flex-1 md:flex-initial">
                Create
              </Button>
              <Button
                type="button"
                onClick={() => setShowNewTeamForm(false)}
                variant="outline"
                className="flex-1 md:flex-initial"
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      )}

      <div className="grid gap-4 md:gap-6">
        {teams?.map((team) => (
          <Link
            href={`/organization/${organizationId}/dashboard/team/${team?.id}/members`}
            key={team.id}
            className="block p-4 md:p-6 border rounded-lg hover:border-blue-500 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-gray-900">
                  {team.name}
                </h2>
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  {team.team_members?.length || 0} members
                </p>
              </div>
              <div className="text-blue-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 md:h-6 md:w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
