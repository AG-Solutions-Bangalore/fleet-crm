import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useTheme } from "@/lib/theme-context";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const user = useSelector((state) => state.auth.user);
  const { trigger, loading: isSubmitting } = useApiMutation();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    currentPassword: "",
    newPassword: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    const missingFields = [];
    if (!formData.name) missingFields.push("Name");
    if (!formData.currentPassword) missingFields.push("Current Password");
    if (!formData.newPassword) missingFields.push("New Password");

    if (missingFields.length > 0) {
      toast.error(`Please fill in: ${missingFields.join(", ")}`);
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }

    try {
      const formDataObj = {
        username: formData.name,
        old_password: formData.currentPassword,
        new_password: formData.newPassword,
      };

      const res = await trigger({
        url: CHANGE_PASSWORD_API.create,
        method: "post",
        data: formDataObj,
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res?.code === 200) {
        toast.success(res?.msg || "Password updated successfully");

        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
        }));
      } else {
        toast.error(res?.msg || "Failed to update password");
      }
    } catch (error) {
      toast.error(error?.response?.data?.msg || "Something went wrong");
    }
  };

  return (
    <div className="p-2  mx-auto ">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Settings
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Appearance
          </h3>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Theme Color
            </p>
            <div className="flex gap-3 flex-wrap">
              {["default", "yellow", "green", "purple", "teal", "gray"].map(
                (color) => {
                  const colorsMap = {
                    default: "bg-blue-600",
                    yellow: "bg-yellow-500",
                    green: "bg-green-600",
                    purple: "bg-purple-600",
                    teal: "bg-teal-600",
                    gray: "bg-gray-600",
                  };
                  const isActive = theme === color;
                  return (
                    <button
                      key={color}
                      onClick={() => setTheme(color)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200
                                            ${colorsMap[color]} 
                                            ${
                                              isActive
                                                ? "shadow-lg ring-2 ring-offset-2 ring-blue-400 scale-110"
                                                : "opacity-80 hover:opacity-100 hover:scale-105"
                                            }`}
                      title={`Set ${color} theme`}
                    >
                      {isActive && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </button>
                  );
                }
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
              Current theme:{" "}
              <span className="font-medium capitalize">{theme}</span>
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Account
          </h3>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div>
              <div>
                <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 flex  flex-row items-center  justify-between ">
                  <span>Change Password</span>

                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Must be at least 6 characters long
                  </span>
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    {/* <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Current Password
                                        </Label> */}
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      placeholder="Enter current password"
                      type="password"
                      maxLength={16}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    {/* <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            New Password
                                        </Label> */}
                    <Input
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      placeholder="Enter new password (min 6 characters)"
                      type="password"
                      maxLength={16}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={
                  isSubmitting ||
                  !formData.currentPassword ||
                  !formData.newPassword
                }
                className="w-full mt-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Logged in as
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {user?.name || "User"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Account Type
            </p>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
              {user?.role || "User"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
