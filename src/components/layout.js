import React, { useEffect, useState } from "react";
import useAuthStore from "@/lib/auth/auth-context";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useRouter } from "next/router";
import { organizationApi } from "@/lib/supabase/organisations";

const Layout = ({ children }) => {
  const signOut = useAuthStore((state) => state.signOut);
  const loginStatus = useAuthStore((state) => state.loginStatus);
  const fetchUser = useAuthStore((state) => state.fetchUser);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [organizationId, setOrganizationId] = useState(null);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    const storedOrganizationId = localStorage.getItem("organizationId");
    if (storedOrganizationId) {
      setOrganizationId(storedOrganizationId);
    }
  }, []);

  useEffect(() => {
    const getData = async () => {
      const user = await fetchUser();
      const status = await loginStatus();
      setUser(user);
      // if user has created the organisation then they are admin
      const userCreatedOrganisation =
        await organizationApi.checkIfUserCreatedOrganization(
          organizationId,
          user?.id
        );
      setIsAdmin(userCreatedOrganisation);

      if (!user && !status && !isPublicRoute(router.pathname)) {
        router.push("/");
      }
    };
    getData();
  }, [router.pathname, organizationId]);

  const isPublicRoute = (path) => {
    const publicRoutes = ["/", "/auth/login", "/auth/signup", "/status"];
    return publicRoutes.includes(path);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        user={user}
        onSignOut={handleSignOut}
        router={router}
        isAdmin={isAdmin}
      />

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
