import { supabase } from "./client";

export const authApi = {
  async signUp(email, password) {
    const { user, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return user;
  },

  async signIn(email, password) {
    const { user, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return user;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getUser() {
    const user = supabase.auth.user();
    return user;
  },
};
