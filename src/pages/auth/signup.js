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
import useAuthStore from "@/lib/auth/auth-context";
import { useRouter } from "next/router";

const SignUp = () => {
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const router = useRouter();
  const signUp = useAuthStore((state) => state.signUp);

  const onSubmit = async (data) => {
    try {
      await signUp(data.email, data.password);
      alert("Signed up successfully!");
      router.push("dashboard/services");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <Form {...form}>
      <div className="flex items-center justify-center">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold text-center text-gray-900">
            Create an Account
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
              Register
            </Button>
          </form>
        </div>
      </div>
    </Form>
  );
};

export default SignUp;
