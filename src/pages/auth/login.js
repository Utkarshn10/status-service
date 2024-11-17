import React from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/router";
import useAuthStore from "@/lib/auth/auth-context";
import { organizationApi } from "@/lib/supabase/organisations";

const Login = () => {
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signIn = useAuthStore((state) => state.signIn);
  const fetchUser = useAuthStore((state) => state.fetchUser);
  const router = useRouter();
  const setOrganizationId = useAuthStore((state) => state.setOrganizationId);
  const setTeamId = useAuthStore((state) => state.setTeamId);

  const onSubmit = async (data) => {
    try {
      await signIn(data.email, data.password);
      const user = await fetchUser();
      console.log("user 1= ", user);
      const { organizationId, teamId } =
        await organizationApi.getUserOrganizationAndTeamId(user?.email);
      setOrganizationId(organizationId);
      setTeamId(teamId);
      localStorage.setItem("teamId", teamId);
      console.log("ids = ", organizationId);
      alert("Logged in successfully!");
      if (organizationId && teamId)
        router.push(
          `/organization/${organizationId}/dashboard/team/${teamId}/services`
        );
      else router.push("/organizations");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <Form {...form}>
      <div className="flex items-center justify-center">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold text-center text-gray-900">
            Login to Your Account
          </h2>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </div>
      </div>
    </Form>
  );
};

export default Login;
