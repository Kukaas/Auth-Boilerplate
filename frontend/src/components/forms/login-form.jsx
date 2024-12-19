// Third-party libraries
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import PropTypes from "prop-types";

// Components and UI elements
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";

// Utilities
import { cn } from "@/lib/utils";

// Hooks
import { useForm } from "react-hook-form";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export function LoginForm({ className }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLogin = async (values) => {
    try {
      setLoading(true);
      const { email, password } = values;

      if (!email || !password) {
        toast.error("All fields are required.");
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        values
      );

      if (response.status === 200) {
        toast.success("Logged in successfully.");
        setLoading(false);
        navigate("/dashboard");
      }
    } catch (error) {
      setLoading(false);
      console.error(error);
      toast.error("Invalid email or password.");
    }
  };

  return (
    <Form {...form}>
      <form
        className={cn("flex flex-col gap-6", className)}
        onSubmit={form.handleSubmit(handleLogin)}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-balance text-sm text-muted-foreground">
            Enter your email below to login to your account
          </p>
        </div>
        <div className="grid gap-6">
          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="m@example.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <a
                      href="#"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </div>
        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <p
            className="underline underline-offset-4 cursor-pointer"
            onClick={() => navigate("/sign-up")}
          >
            Sign up
          </p>
        </div>
      </form>
    </Form>
  );
}

LoginForm.propTypes = {
  className: PropTypes.string,
};
