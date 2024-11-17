import { create } from "zustand";
import { supabase } from "../supabase/client";

const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  organizationId: null,
  teamId: null,
  signUp: async (email, password) => {
    const { user, error } = await supabase.auth.signUp({ email, password });
    if (error) throw new Error(error.message);
    set({ user });
  },
  signIn: async (email, password) => {
    const { user, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw new Error(error.message);
    set({ user });
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, organizationId: null, teamId: null });
  },
  fetchUser: async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    return user;
  },
  loginStatus: async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    return user != null ? true : false;
  },
  setOrganizationId: (id) => set({ organizationId: id }),
  setTeamId: (id) => set({ teamId: id }),
}));

export default useAuthStore;
