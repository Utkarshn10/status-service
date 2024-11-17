import { useState, useEffect } from "react";
import { teamApi } from "@/lib/supabase/teams";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";

export default function TeamMembersPage() {
  const [team, setTeam] = useState(null);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { organizationId, teamId } = router.query;

  useEffect(() => {
    const teamid = localStorage.getItem("teamId") || null;
    if (!teamid) localStorage.setItem("teamId", teamId);
    const loadTeam = async () => {
      try {
        const teams = await teamApi.list(organizationId);
        const currentTeam = teams.find((t) => t.id === teamId);
        setTeam(currentTeam);
        setError("");
      } catch (error) {
        console.error("Failed to load team:", error);
        setError("Failed to load team. Please try again later.");
      }
    };

    if (organizationId && teamId) {
      loadTeam();
    }
  }, [organizationId, teamId]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const newMember = await teamApi.addMember({
        teamId,
        email: newMemberEmail,
        role: "member",
      });

      setTeam({
        ...team,
        team_members: [...team.team_members, newMember],
      });

      setNewMemberEmail("");
      setShowAddMemberForm(false);
      setError("");
    } catch (error) {
      console.error("Failed to add team member:", error);
      setError("Failed to add team member. Please try again.");
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await teamApi.removeMember(memberId);
      setTeam({
        ...team,
        team_members: team.team_members.filter(
          (member) => member.id !== memberId
        ),
      });
      setError("");
    } catch (error) {
      console.error("Failed to remove team member:", error);
      setError("Failed to remove team member. Please try again.");
    }
  };

  if (!team) return <div>Loading...</div>;

  return (
    <div className="p-4 md:p-6">
      {error && (
        <div className="mb-4 p-3 md:p-4 bg-red-100 border border-red-400 text-red-700 rounded text-sm md:text-base">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-xl md:text-2xl font-bold">
          {team.name} - Team Members
        </h1>
        <Button
          onClick={() => setShowAddMemberForm(true)}
          className="w-full md:w-auto"
        >
          Add New Member
        </Button>
      </div>

      {showAddMemberForm && (
        <form
          onSubmit={handleAddMember}
          className="mb-6 md:mb-8 p-3 md:p-4 border rounded"
        >
          <h3 className="text-base md:text-lg font-semibold mb-4">
            Add New Member
          </h3>
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <input
              type="email"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              placeholder="Member Email"
              className="border rounded p-2 w-full"
              required
            />
            <div className="flex gap-2 w-full md:w-auto">
              <Button type="submit" className="flex-1 md:flex-none">
                Add
              </Button>
              <Button
                type="button"
                onClick={() => setShowAddMemberForm(false)}
                variant="outline"
                className="flex-1 md:flex-none"
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {team.team_members?.map((member) => (
          <div
            key={member.id}
            className="p-3 md:p-4 border rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0"
          >
            <div className="w-full md:w-auto">
              <p className="font-medium break-all">{member.user_email}</p>
            </div>
            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
              <Button
                onClick={() => handleRemoveMember(member.id)}
                variant="destructive"
                className="w-full md:w-auto"
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
