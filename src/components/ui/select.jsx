import * as React from "react"
import {
  CaretSortIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@radix-ui/react-icons"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Search, X } from "lucide-react"

import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}>
    {children}
    <SelectPrimitive.Icon asChild>
      <CaretSortIcon className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}>
    <ChevronUpIcon />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}>
    <ChevronDownIcon />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

const getNodeText = (node) => {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getNodeText).join(" ");
  if (React.isValidElement(node)) {
    let text = "";
    if (node.props) {
      if (node.props.children) {
        text += " " + getNodeText(node.props.children);
      }
      if (node.props.value != null) {
        text += " " + String(node.props.value);
      }
      if (node.props["data-search"] != null) {
        text += " " + String(node.props["data-search"]);
      }
    }
    return text.trim();
  }
  return "";
};

const filterChildren = (children, query) => {
  if (!query || !query.trim()) return children;
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);

  const filterNode = (node) => {
    if (!React.isValidElement(node)) return node;

    // Check if it's a SelectItem or element with value prop
    if (node.type?.displayName === "SelectItem" || node.props?.value !== undefined) {
      const text = getNodeText(node).toLowerCase();
      const matches = words.every((word) => text.includes(word));
      return matches ? node : null;
    }

    // Check if it has nested children (e.g. SelectGroup)
    if (node.props?.children) {
      const filtered = React.Children.map(node.props.children, filterNode);
      const validChildren = React.Children.toArray(filtered).filter(Boolean);
      if (validChildren.length > 0) {
        return React.cloneElement(node, { children: filtered });
      }
      return null;
    }

    const text = getNodeText(node).toLowerCase();
    const matches = words.every((word) => text.includes(word));
    return matches ? node : null;
  };

  return React.Children.map(children, filterNode);
};

const SelectContent = React.forwardRef(
  (
    {
      className,
      children,
      position = "popper",
      searchable = true,
      searchPlaceholder = "Search...",
      ...props
    },
    ref
  ) => {
    const [search, setSearch] = React.useState("");
    const searchInputRef = React.useRef(null);

    React.useEffect(() => {
      if (searchable) {
        const timer = setTimeout(() => {
          if (searchInputRef.current) {
            searchInputRef.current.focus();
          }
        }, 50);
        return () => clearTimeout(timer);
      }
    }, [searchable]);

    const filteredChildren = React.useMemo(() => {
      if (!searchable) return children;
      return filterChildren(children, search);
    }, [children, search, searchable]);

    const hasVisibleItems =
      !searchable ||
      !search.trim() ||
      React.Children.toArray(filteredChildren).filter(Boolean).length > 0;

    return (
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          ref={ref}
          className={cn(
            "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            position === "popper" &&
              "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
            className
          )}
          position={position}
          {...props}
        >
          {searchable && (
            <div
              className="sticky top-0 z-20 flex items-center border-b bg-popover px-2.5 py-1.5 shadow-sm"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <Search className="mr-2 h-3.5 w-3.5 shrink-0 opacity-50 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="flex h-7 w-full rounded-md bg-transparent text-xs outline-none placeholder:text-muted-foreground"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  e.stopPropagation();
                }}
              />
              {search ? (
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearch("");
                    searchInputRef.current?.focus();
                  }}
                  className="ml-1 rounded-sm p-0.5 opacity-70 hover:opacity-100 focus:outline-none"
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              ) : null}
            </div>
          )}
          <SelectScrollUpButton />
          <SelectPrimitive.Viewport
            className={cn(
              "p-1 max-h-64 overflow-y-auto",
              position === "popper" &&
                "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
            )}
          >
            {hasVisibleItems ? (
              filteredChildren
            ) : (
              <div className="py-6 text-center text-xs text-muted-foreground select-none">
                No results found
              </div>
            )}
          </SelectPrimitive.Viewport>
          <SelectScrollDownButton />
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    );
  }
);
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props} />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}>
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <CheckIcon className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props} />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
