import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import React from "react";
import { Link, useLocation } from "react-router-dom";

const itemVariants = {
  open: { opacity: 1, height: "auto", transition: { duration: 0.3 } },
  closed: { opacity: 0, height: 0, transition: { duration: 0.3 } },
};

const buttonVariants = {
  hover: { scale: 1.05 },
};

export function NavMain({ items, openItem, setOpenItem }) {
  const location = useLocation();

  const handleLinkClick = (e, hasSubItems = false, isSubItem = false) => {
    // Save scroll position
    const sidebarContent = document.querySelector(".sidebar-content");
    if (sidebarContent) {
      sessionStorage.setItem("sidebarScrollPosition", sidebarContent.scrollTop);
    }

    // 🔹 Close any open dropdown when a non-dropdown link is clicked
    if (!hasSubItems && !isSubItem) setOpenItem(null);
  };

  React.useEffect(() => {
    const sidebarContent = document.querySelector(".sidebar-content");
    const scrollPosition = sessionStorage.getItem("sidebarScrollPosition");
    if (sidebarContent && scrollPosition) {
      sidebarContent.scrollTop = parseInt(scrollPosition);
    }
  }, [location.pathname]);

  if (!items || items.length === 0) return null;

  return (
    <SidebarGroup>
      {/* <SidebarGroupLabel>Home</SidebarGroupLabel> */}
      <SidebarMenu>
        {items.map((item) => {
          const hasSubItems = item.items && item.items.length > 0;
          const isParentActive = hasSubItems
            ? item.items.some(
                (subItem) =>
                  location.pathname === subItem.url ||
                  location.pathname.startsWith(subItem.url + "/")
              )
            : location.pathname === item.url ||
              location.pathname.startsWith(item.url + "/");

          const isOpen = openItem === item.title || isParentActive;

          if (!hasSubItems) {
            return (
              <SidebarMenuItem key={item.title}>
                <Link to={item.url} onClick={(e) => handleLinkClick(e, false)}>
                  <motion.div variants={buttonVariants} whileHover="hover">
                    <SidebarMenuButton
                      tooltip={item.title}
                      className={`rounded-md transition-colors duration-200 ${
                        isParentActive
                          ? "bg-[var(--color-light)] text-[var(--color)] dark:bg-[var(--color-dark)] dark:text-[var(--color-dark-text)]"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      {item.icon && <item.icon className="w-5 h-5" />}
                      <span className="ml-2">{item.title}</span>
                    </SidebarMenuButton>
                  </motion.div>
                </Link>
              </SidebarMenuItem>
            );
          }

          return (
            <Collapsible
              key={item.title}
              asChild
              open={isOpen}
              onOpenChange={(open) => setOpenItem(open ? item.title : null)}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <motion.div variants={buttonVariants} whileHover="hover">
                    <SidebarMenuButton
                      tooltip={item.title}
                      className={`rounded-md transition-colors duration-200 ${
                        isOpen
                          ? "bg-[var(--color-light)] text-[var(--color)] dark:bg-[var(--color-dark)] dark:text-[var(--color-dark-text)]"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      {item.icon && <item.icon className="w-5 h-5" />}
                      <span className="ml-2">{item.title}</span>
                      <ChevronRight
                        className={`ml-auto transition-transform duration-200 ${
                          isOpen ? "rotate-90" : ""
                        }`}
                      />
                    </SidebarMenuButton>
                  </motion.div>
                </CollapsibleTrigger>

                <CollapsibleContent
                  as={motion.div}
                  variants={itemVariants}
                  initial="closed"
                  animate={isOpen ? "open" : "closed"}
                >
                  <SidebarMenuSub className="border-l border-[var(--color-border)] dark:border-[var(--color-border-dark)] ml-4 pl-2">
                    {item.items?.map((subItem) => {
                      const isSubItemActive = location.pathname.startsWith(
                        subItem.url
                      );
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <Link
                              to={subItem.url}
                              onClick={
                                (e) => handleLinkClick(e, false, true)
                              }
                            >
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                className={`px-3 py-2 rounded-md transition-colors duration-200 ${
                                  isSubItemActive
                                    ? "bg-[var(--color-light)] text-[var(--color)] w-full rounded-xl dark:bg-[var(--color-dark)] dark:text-[var(--color-dark-text)]"
                                    : ""
                                }`}
                              >
                                {subItem.title}
                              </motion.div>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
