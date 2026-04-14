import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronRight,
  Home,
  ShoppingBag,
  X
} from "lucide-react";
import * as React from "react";
import { Link, useLocation } from "react-router-dom";

export function AppBottombar() {
  const location = useLocation();
  const [activeDropdown, setActiveDropdown] = React.useState(null);
 
    

  const navItems = [
    {
      title: "Home",
      url: "/home",
      icon: Home,
    },
   
    {
      title: "Day Book",
      url: "/day-book", 
      icon: ShoppingBag,
    },

   
     {
      title: "Ledger",
      url: "#",
      icon: ShoppingBag,
      items: [
        {
          title: "Ledger Report",
          url: "/ledger",
        },
        {
          title: "Change Ledger Name",
          url: "/change-ledger-name",
        },
      
      ],
    },
    {
      title: "Trial Balance",
      url: "/trial-balance",
      icon: ShoppingBag,
    },
    

   
  ];
 
  const mobileNavItems = navItems.slice(0, 6);

  const handleItemClick = (item, e) => {
    if (item.items) {
      e.preventDefault();
      setActiveDropdown(activeDropdown === item.title ? null : item.title);
    }
  };

  const isItemActive = (item) => {
    if (item.url !== "#" && location.pathname.startsWith(item.url)) {
      return true;
    }
    if (item.items) {
      return item.items.some(subItem => location.pathname.startsWith(subItem.url));
    }
    return false;
  };

  // Get the current active dropdown menu if any availabe for master and report
  const activeMenu = activeDropdown ? navItems.find(item => item.title === activeDropdown) : null;

  return (
    <>
      {/* Main bottom navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 rounded-t-lg shadow-lg z-40">
        <div className="flex justify-around items-center  h-14 px-1">
          {mobileNavItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = isItemActive(item);
            const hasDropdown = !!item.items;
            
            return (
              <Link 
                key={item.title}
                to={hasDropdown ? "#" : item.url}
                onClick={(e) => handleItemClick(item, e)}
                className={`flex flex-col items-center justify-center p-1  rounded-lg relative ${
                  isActive 
                    ? "text-blue-600" 
                    : "text-gray-500"
                }`}
              >
                <div className="relative">
                  {isActive && (
                    <motion.div
                      layoutId="bottomNavIndicator"
                      className="absolute -bottom-1 left-0 right-0 h-[2px] bg-blue-500 rounded-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  <IconComponent className="h-4 w-4" />
                </div>
                <span className="text-xs mt-1 font-medium">{item.title}</span>
                
                {hasDropdown && (
                  <span className={`absolute top-0 right-0 w-1.5 h-1.5 rounded-full ${
                    isActive ? "bg-blue-500" : "bg-gray-400"
                  }`} />
                )}
              </Link>
            );
          })}
        </div>
      </div>

   <AnimatePresence>
           {activeMenu && (
             <motion.div 
               className="fixed inset-0 bg-black/30 z-50 flex items-end justify-center"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setActiveDropdown(null)}
             >
               <motion.div 
                 className="w-full max-w-md mx-4 mb-16 bg-white rounded-xl shadow-xl overflow-hidden"
                 initial={{ y: 50, opacity: 0, scale: 0.9 }}
                 animate={{ y: 0, opacity: 1, scale: 1 }}
                 exit={{ y: 50, opacity: 0, scale: 0.9 }}
                 transition={{ type: "spring", stiffness: 400, damping: 30 }}
                 onClick={e => e.stopPropagation()}
               >
                 {/* Header */}
                 <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center">
                       <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                         {React.createElement(activeMenu.icon, { className: "h-4 w-4 text-blue-600" })}
                       </div>
                       <h3 className="font-semibold text-gray-900">
                         {activeMenu.title}
                       </h3>
                     </div>
                     <motion.button
                       onClick={() => setActiveDropdown(null)}
                       className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center"
                       whileHover={{ scale: 1.1, rotate: 90 }}
                       whileTap={{ scale: 0.9 }}
                     >
                       <X className="h-3 w-3 text-gray-600" />
                     </motion.button>
                   </div>
                 </div>
                 
                 {/* Menu items */}
                 <div className="py-1">
                   {activeMenu.items.map((subItem, index) => (
                     <motion.div
                       key={subItem.title}
                       initial={{ opacity: 0, x: -10 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ delay: index * 0.05, duration: 0.2 }}
                     >
                       <Link
                         to={subItem.url}
                         onClick={() => setActiveDropdown(null)}
                         className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all duration-200 ${
                           location.pathname.startsWith(subItem.url)
                             ? "bg-blue-50 border-l-2 border-blue-500"
                             : "hover:bg-gray-50"
                         }`}
                       >
                         <span className={`text-sm font-medium ${
                           location.pathname.startsWith(subItem.url)
                             ? "text-blue-700"
                             : "text-gray-700"
                         }`}>
                           {subItem.title}
                         </span>
                         <motion.div
                           whileHover={{ x: 3 }}
                           transition={{ duration: 0.2 }}
                         >
                           <ChevronRight className={`h-4 w-4 ${
                             location.pathname.startsWith(subItem.url)
                               ? "text-blue-500"
                               : "text-gray-400"
                           }`} />
                         </motion.div>
                       </Link>
                     </motion.div>
                   ))}
                 </div>
               </motion.div>
             </motion.div>
           )}
         </AnimatePresence>
    </>
  );
}