import { create } from "zustand";
import { supabase } from "../supabase/client";

const useAuthStore = create((set) => ({
  user: null,
  loading: true,
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
    set({ user: null });
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
    console.log("user = ", user);
    return user != null ? true : false;
  },
}));

export default useAuthStore;
