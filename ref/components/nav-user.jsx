import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { default as appLogout, default as useAppLogout } from "@/utils/logout";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Activity, Download, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import Logout from "./auth/log-out";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Lock } from "lucide-react";
import ChangePasswordDialog from "./auth/change-password-dialog";

export function NavUser({ user }) {
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] =
    useState(false);

  const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);

  const handleLogout = useAppLogout();

  const initialsChar = user.name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();

  const showUpdateBadge = useSelector(
    (state) => state.version?.showUpdateDialog,
  );
  const [openDialog, setOpenDialog] = useState(false);
  const [showDot, setShowDot] = useState(false);
  const verCon = useSelector((state) => state.version.version);
  const localVersion = useSelector((state) => state.auth?.version);
  const updateMutation = useMutation({
    mutationFn: async () => Promise.resolve(),
    onSuccess: () => {
      toast.success("Update completed successfully");
      appLogout();
      window.location.reload();
    },
    onError: (error) => {
      console.error("Update failed:", error);
      toast.error("Update failed. Please try again.");
    },
  });
  useEffect(() => {
    if (verCon && localVersion) {
      if (verCon !== localVersion) {
        setShowDot(true);
        const dotTimer = setTimeout(() => {
          setShowDot(false);
          setOpenDialog(true);
        }, 5000);
        return () => clearTimeout(dotTimer);
      }
    }
  }, [localVersion, verCon]);

  const handleUpdate = () => updateMutation.mutate();
  // -------------------------- upgrade end ---------------------

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          {!showUpdateBadge ? (
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg bg-[var(--team-color)] text-black">
                  {initialsChar}
                </AvatarFallback>
              </Avatar>

              {sidebarOpen && (
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              )}

              <div className="ml-auto flex items-center gap-2">
                <abbr title="Change Password">
                  <Lock
                    onClick={() => setChangePasswordDialogOpen(true)}
                    className="size-4 hover:text-blue-600 hover:scale-125 transition-transform cursor-pointer"
                  />
                </abbr>
                <abbr title="Logout">
                  <LogOut
                    onClick={() => setLogoutDialogOpen(true)}
                    className="size-4 hover:text-red-600 hover:scale-125 transition-transform cursor-pointer"
                  />
                </abbr>
              </div>
            </SidebarMenuButton>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "relative transition-all duration-300 p-2 rounded-lg cursor-pointer hover:shadow-md",
                sidebarOpen
                  ? "bg-gradient-to-r from-purple-500 to-pink-500"
                  : "bg-gradient-to-r from-purple-500 to-pink-500 w-10 h-10 flex items-center justify-center",
              )}
              onClick={() => setOpenDialog(true)}
            >
              {sidebarOpen ? (
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Download className="w-3 h-3 text-white" />
                      <span className="text-xs font-medium text-white">
                        New Update Available
                      </span>
                      {showDot && (
                        <Badge
                          variant="secondary"
                          className="w-1.5 h-1.5 p-0 bg-white animate-pulse"
                        />
                      )}
                    </div>
                  </div>
                  <div className="text-[12px] text-white/80 mt-0.5">
                    v{localVersion} → v{verCon}
                  </div>
                </div>
              ) : (
                <Activity className="w-4 h-4 text-white animate-pulse" />
              )}
            </motion.div>
          )}
        </SidebarMenuItem>
      </SidebarMenu>

      <Logout
        open={logoutDialogOpen}
        setOpen={setLogoutDialogOpen}
        onConfirm={handleLogout}
      />
      <ChangePasswordDialog
        open={changePasswordDialogOpen}
        onOpenChange={setChangePasswordDialogOpen}
      />
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent
          className="sm:max-w-xs p-4 gap-4"
          aria-describedby={undefined}
        >
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Download className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 text-left">
                <DialogTitle className="text-sm font-semibold">
                  Update Available
                </DialogTitle>
                <p className="text-xs text-muted-foreground">
                  Version v{verCon}
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="text-sm text-muted-foreground">
            A new version is ready to install. Update now to get the latest
            features and improvements.
          </div>

          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              className={cn(
                "flex-1",
                updateMutation.isPending && "opacity-50 cursor-not-allowed",
              )}
              onClick={handleUpdate}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Updating..." : "Update Now"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setOpenDialog(false)}
            >
              Later
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
