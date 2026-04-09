import {
  AlertTriangle,
  AudioWaveform,
  BarChart3,
  Blocks,
  Command,
  Frame,
  GalleryVerticalEnd,
  LayoutDashboard,
  Package,
  Settings,
  Settings2,
  ShoppingBag,
  UploadCloud,
  Wallet,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import Cookies from "js-cookie";
import { NavMainReport } from "./nav-main-report";
import { useState, useMemo } from "react";

const NAVIGATION_CONFIG = {
  COMMON: {
    DASHBOARD: {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: false,
    },

    DEPOSIT: {
      title: "Deposit",
      url: "/deposit",
      icon: Wallet,
      isActive: false,
    },
    PENALTY: {
      title: "Penalty",
      url: "/penalty",
      icon: AlertTriangle,
      isActive: false,
    },
  },

  MODULES: {
    MASTER: {
      title: "Master",
      url: "#",
      isActive: false,
      icon: Settings,
      items: [
        {
          title: "Driver",
          url: "/driver",
        },
        {
          title: "Vehicle",
          url: "/vehicle",
        },
        {
          title: "Driver QR",
          url: "/qr-drivers",
        },
      ],
    },

    UPLOAD: {
      title: "File Upload",
      url: "#",
      isActive: false,
      icon: UploadCloud,
      items: [
        {
          title: "Trip",
          url: "/trip",
        },
        {
          title: "Driver Activity",
          url: "/activity-driver",
        },
        {
          title: "Driver Auto Position",
          url: "/position-auto-driver",
        },
        {
          title: "Driver Performance",
          url: "/list-driver-performance",
        },
        {
          title: "Payment",
          url: "/payment",
        },
        {
          title: "Daily Cash",
          url: "/daily-cash",
        },
      ],
    },
  },

  REPORTS: {
    REPORT: {
      title: "Report",
      url: "#",
      isActive: false,
      icon: BarChart3,
      items: [
        {
          title: "Performance New",
          url: "/performance-new",
        },
      ],
    },
    SETTINGS: {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
      isActive: false,
    },
  },
};

const USER_ROLE_PERMISSIONS = {
  1: {
    navMain: ["DASHBOARD", "MASTER", "UPLOAD", "DEPOSIT", "PENALTY", "REPORT"],
    navMainReport: ["REPORT", "SETTINGS"],
  },

  2: {
    navMain: ["DASHBOARD", "MASTER", "UPLOAD", "DEPOSIT", "PENALTY", "REPORT"],
    navMainReport: ["REPORT", "SETTINGS"],
  },
};

const LIMITED_MASTER_SETTINGS = {
  title: "Master Settings",
  url: "#",
  isActive: false,
  icon: Settings2,
  items: [
    {
      title: "Chapters",
      url: "/master/chapter",
    },
  ],
};

const useNavigationData = (userType) => {
  return useMemo(() => {
    const permissions =
      USER_ROLE_PERMISSIONS[userType] || USER_ROLE_PERMISSIONS[1];

    const buildNavItems = (permissionKeys, config, customItems = {}) => {
      return permissionKeys
        .map((key) => {
          if (key === "MASTER_SETTINGS_LIMITED") {
            return LIMITED_MASTER_SETTINGS;
          }
          return config[key];
        })
        .filter(Boolean);
    };

    const navMain = buildNavItems(
      permissions.navMain,
      { ...NAVIGATION_CONFIG.COMMON, ...NAVIGATION_CONFIG.MODULES },
      { MASTER_SETTINGS_LIMITED: LIMITED_MASTER_SETTINGS },
    );

    const navMainReport = buildNavItems(
      permissions.navMainReport,
      NAVIGATION_CONFIG.REPORTS,
    );

    return { navMain, navMainReport };
  }, [userType]);
};

const TEAMS_CONFIG = [
  {
    name: "FLEET CRM",
    logo: GalleryVerticalEnd,
    plan: "",
  },
  {
    name: "Acme Corp.",
    logo: AudioWaveform,
    plan: "Startup",
  },
  {
    name: "Evil Corp.",
    logo: Command,
    plan: "Free",
  },
];

export function AppSidebar({ ...props }) {
  const nameL = Cookies.get("name");
  const emailL = Cookies.get("email");
  const userType = Cookies.get("user_type_id") || "1";
  const [openItem, setOpenItem] = useState(null);

  const { navMain, navMainReport } = useNavigationData(userType);

  const initialData = {
    user: {
      name: nameL || "User",
      email: emailL || "user@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    teams: TEAMS_CONFIG,
    navMain,
    navMainReport,
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={initialData.teams} />
      </SidebarHeader>
      <SidebarContent className="sidebar-content">
        <NavMain
          items={initialData.navMain}
          openItem={openItem}
          setOpenItem={setOpenItem}
        />
        <NavMainReport
          items={initialData.navMainReport}
          openItem={openItem}
          setOpenItem={setOpenItem}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={initialData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export { NAVIGATION_CONFIG, USER_ROLE_PERMISSIONS };
