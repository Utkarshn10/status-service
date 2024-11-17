import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Notifications from "@/components/notifications";

const Navbar = ({ user, onSignOut, router, isAdmin }) => {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold">
              Status Service
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user != null ? (
              <>
                {router.asPath.includes("/organization/") && (
                  <>
                    {isAdmin && (
                      <Link
                        href={`${
                          router.asPath.split("/dashboard")[0]
                        }/dashboard/teams`}
                      >
                        <Button variant="ghost">Teams</Button>
                      </Link>
                    )}
                    {router.asPath.includes("/team/") && (
                      <Link
                        href={`/organization/${
                          router.asPath
                            .split("/organization/")[1]
                            .split("/dashboard")[0]
                        }/dashboard/team/${
                          router.asPath.split("/team/")[1].split("/")[0]
                        }/services`}
                      >
                        <Button variant="ghost">Services</Button>
                      </Link>
                    )}
                  </>
                )}
                <Notifications />
                <Button onClick={onSignOut} variant="outline">
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
