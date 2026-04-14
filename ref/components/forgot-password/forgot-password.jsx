import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useApiMutation } from "@/hooks/useApiMutation";
import { toast } from "sonner";
import { FORGOT_PASSWORD_API } from "@/api/index";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [username, setUserName] = useState("");
  const { trigger: forgotPassword, loading: isLoading } = useApiMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);

    try {
      const res = await forgotPassword({
        url: FORGOT_PASSWORD_API,
        method: "post",
        data: formData,
      });

      if (res?.code === 200 || res?.status === true || res?.success) {
        toast.success(
          res?.message || "Password reset link sent to your email.",
        );
        setEmail(""); // Clear input on success
      } else {
        toast.error(res?.message || "Failed to send reset link.");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    }
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className={"flex flex-col gap-6"}>
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Forgot Password</CardTitle>
              <CardDescription>
                Enter your email address to reset your password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-6">
                  <div className="grid gap-2 text-left">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Enter Username"
                      required
                    />
                  </div>
                  <div className="grid gap-2 text-left">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="m@example.com"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </Button>
                  <div className="text-center text-sm">
                    Remember your password?{" "}
                    <Link to="/" className="underline underline-offset-4">
                      Login
                    </Link>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
