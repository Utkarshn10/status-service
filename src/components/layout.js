import React, { useEffect, useState } from "react";
import useAuthStore from "@/lib/auth/auth-context";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

const Layout = ({ children }) => {
  const signOut = useAuthStore((state) => state.signOut);
  const loginStatus = useAuthStore((state) => state.loginStatus);
  const fetchUser = useAuthStore((state) => state.fetchUser);
  const [user, setUser] = useState(null);
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    const getData = async () => {
      const user = await fetchUser();
      const status = await loginStatus();
      setUser(user);
      console.log("user 1= ", status, " ", user);
    };
    getData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} onSignOut={handleSignOut} />

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Layout;
