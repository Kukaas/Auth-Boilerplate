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
});

export default function ForgotPasswordForm({ className }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
    },
  });

  const handleForgotPassword = async (values) => {
    const generateRandomToken = (length) => {
      let result = "";
      while (result.length < length) {
        result += Math.random().toString(36).substring(2); // Concatenate random strings
      }
      return result.substring(0, length); // Truncate to the desired length
    };

    const generatedToken = generateRandomToken(50);
    try {
      setLoading(true);
      const { email } = values;

      if (!email) {
        toast.error("Email is required.");
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        values
      );

      if (response.status === 200) {
        setLoading(false);
        localStorage.setItem("email", email);
        toast.success("An OTP has been sent to your email.");
        navigate(`/verify-otp/${generatedToken}`);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setLoading(false);
        toast.error("Email not found", {
          description: "Please try another email.",
        });
      } else {
        setLoading(false);
        toast.error("Failed to send reset link.");
      }
    }
  };
  return (
    <Form {...form}>
      <form
        className={cn("flex flex-col gap-6", className)}
        onSubmit={form.handleSubmit(handleForgotPassword)}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Forgot your password?</h1>
          <p className="text-balance text-sm text-muted-foreground">
            Enter your email address and we will send you a link to reset your
            password.
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
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Send reset link"}
          </Button>
        </div>
        <div className="text-center text-sm">
          Remember your password?{" "}
          <p
            className="underline underline-offset-4 cursor-pointer"
            onClick={() => navigate("/sign-in")}
          >
            Sign in
          </p>
        </div>
      </form>
    </Form>
  );
}

ForgotPasswordForm.propTypes = {
  className: PropTypes.string,
};
