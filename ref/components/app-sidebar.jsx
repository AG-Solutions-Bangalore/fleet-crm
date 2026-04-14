import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import makcLogo from "../assets/fevicon.png";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  AudioWaveform,
  Blocks,
  Building2,
  Command,
  Bell,
  Users,
  LayoutDashboard,
  LayoutGrid,
  Settings2,
  FileText,
  AlertCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { NavMainReport } from "./nav-main-report";

const NAVIGATION_CONFIG = {
  COMMON: {
    DASHBOARD: {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: false,
    },
    SERVICELIST: {
      title: "Service",
      url: "/service-list",
      icon: LayoutGrid,
      isActive: false,
    },

    MEMBERLIST: {
      title: "Clients",
      url: "/client-list",
      icon: Users,
      isActive: false,
    },
    SERVICEREQUEST: {
      title: "Service Request",
      url: "/service-request",
      icon: Building2,
      isActive: false,
    },
    COMPLAINT: {
      title: "Complaint",
      url: "/complaint-list",
      icon: AlertCircle,
      isActive: false,
    },
    NOTIFICATION: {
      title: "Notification",
      url: "/notification-list",
      icon: Bell,
      isActive: false,
    },
  },

  REPORTS: {
    REPORT_MENU: {
      title: "Reports",
      url: "#",
      icon: FileText,
      isActive: false,
      items: [
        {
          title: "Client Report",
          url: "/client-report",
        },
        {
          title: "Service Request",
          url: "/service-request-report",
        },
      ],
    },
    SETTINGS: {
      title: "Settings",
      url: "/settings",
      icon: Blocks,
      isActive: false,
    },
  },
};

const USER_ROLE_PERMISSIONS = {
  1: {
    navMain: [
      "DASHBOARD",
      "SERVICELIST",
      "MEMBERLIST",
      "SERVICEREQUEST",
      "COMPLAINT",
      "NOTIFICATION",
      // "SETTINGS",
    ],
    navMainReport: ["REPORT_MENU"],
  },

  2: {
    navMain: [
      "DASHBOARD",
      "SERVICELIST",
      "MEMBERLIST",
      "SERVICEREQUEST",
      "COMPLAINT",
      "NOTIFICATION",
    ],
    navMainReport: ["REPORT_MENU"],
  },

  3: {
    navMain: [
      "DASHBOARD",
      "SERVICELIST",
      "MEMBERLIST",
      "SERVICEREQUEST",
      "COMPLAINT",
      "NOTIFICATION",
    ],
    navMainReport: ["REPORT_MENU"],
  },

  4: {
    navMain: [
      "DASHBOARD",
      "SERVICELIST",
      "MEMBERLIST",
      "SERVICEREQUEST",
      "COMPLAINT",
      "NOTIFICATION",
    ],
    navMainReport: ["REPORT_MENU"],
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
      // { ...NAVIGATION_CONFIG.COMMON, ...NAVIGATION_CONFIG.MODULES },
      { ...NAVIGATION_CONFIG.COMMON },
      // { MASTER_SETTINGS_LIMITED: LIMITED_MASTER_SETTINGS }
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
    name: "MAKc",
    logo: makcLogo,
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
  const [openItem, setOpenItem] = useState(null);
  const user = useSelector((state) => state.auth.user);
  const { navMain, navMainReport } = useNavigationData(user?.user_type);
  const initialData = {
    user: {
      name: user?.name || "User",
      email: user?.email || "user@example.com",
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
