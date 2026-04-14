import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApiMutation } from "@/hooks/useApiMutation";
import { CHANGE_PASSWORD_API } from "@/api";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

export default function ChangePasswordDialog({ open, onOpenChange }) {
  const user = useSelector((state) => state.auth.user);
  const { trigger, loading: isSubmitting } = useApiMutation();

  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      resetForm();
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.oldPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }

    // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/;
    // if (!passwordRegex.test(formData.newPassword)) {
    //   toast.error(
    //     "New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character.",
    //   );
    //   return;
    // }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }

    if (formData.oldPassword === formData.newPassword) {
      toast.error("New password cannot be the same as the old password.");
      return;
    }

    try {
      const res = await trigger({
        url: CHANGE_PASSWORD_API,
        method: "post",
        data: {
          username: user?.name || "User",
          old_password: formData.oldPassword,
          new_password: formData.newPassword,
        },
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(res?.code);

      if (res?.code == 200 || res?.code == 201) {
        toast.success(res?.message || "Password updated successfully");
        handleOpenChange(false);
      } else {
        toast.error(res?.message || "Failed to update password");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Something went wrong while updating password.",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Enter your old password and a new password to update your
            credentials.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 relative">
            <Label htmlFor="oldPassword">
              Old Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="oldPassword"
                name="oldPassword"
                type={showOldPassword ? "text" : "password"}
                placeholder="Enter current password"
                value={formData.oldPassword}
                onChange={handleInputChange}
                className="w-full pr-12 px-4 py-3 rounded-xl text-sm transition-all duration-200 outline-none"
                style={{
                  background: "hsl(173.4,30%,97%)",
                  border: "1.5px solid hsl(173.4,30%,88%)",
                  color: "hsl(173.4,50%,12%)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "hsl(173.4,80.4%,40%)";
                  e.target.style.boxShadow = `0 0 0 3px hsl(173.4,80.4%,40%,0.12)`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "hsl(173.4,30%,88%)";
                  e.target.style.boxShadow = "none";
                }}
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
              >
                {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="space-y-2 relative">
            <Label htmlFor="newPassword">
              New Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                name="newPassword"
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={handleInputChange}
                className="w-full pr-12 px-4 py-3 rounded-xl text-sm transition-all duration-200 outline-none"
                style={{
                  background: "hsl(173.4,30%,97%)",
                  border: "1.5px solid hsl(173.4,30%,88%)",
                  color: "hsl(173.4,50%,12%)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "hsl(173.4,80.4%,40%)";
                  e.target.style.boxShadow = `0 0 0 3px hsl(173.4,80.4%,40%,0.12)`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "hsl(173.4,30%,88%)";
                  e.target.style.boxShadow = "none";
                }}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="space-y-2 relative">
            <Label htmlFor="confirmPassword">
              Confirm New Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full pr-12 px-4 py-3 rounded-xl text-sm transition-all duration-200 outline-none"
                style={{
                  background: "hsl(173.4,30%,97%)",
                  border: "1.5px solid hsl(173.4,30%,88%)",
                  color: "hsl(173.4,50%,12%)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "hsl(173.4,80.4%,40%)";
                  e.target.style.boxShadow = `0 0 0 3px hsl(173.4,80.4%,40%,0.12)`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "hsl(173.4,30%,88%)";
                  e.target.style.boxShadow = "none";
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !formData.oldPassword ||
                !formData.newPassword ||
                !formData.confirmPassword
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
