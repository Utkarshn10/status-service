import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const Navbar = ({ user, onSignOut }) => {
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
            {user ? (
              <>
                <span className="text-gray-700">Welcome, {user.email}</span>
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
