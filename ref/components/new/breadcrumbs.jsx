import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function Breadcrumbs({ onBack }) {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  const visiblePathnames = pathnames.slice(0, 2);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>Back</span>
      </button>

      {visiblePathnames.length > 0 && (
        <>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <nav className="flex items-center space-x-2 text-sm">
            {visiblePathnames.map((name, index) => {
              const isLast = index === visiblePathnames.length - 1;
              const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;

              return (
                <div key={name} className="flex items-center">
                  {index === 0 ? (
                    <Link className="text-muted-foreground hover:text-foreground capitalize">
                      {name.replace(/-/g, " ")}
                    </Link>
                  ) : (
                    <span className="font-medium text-foreground capitalize"></span>
                  )}
                </div>
              );
            })}
          </nav>
        </>
      )}
    </div>
  );
}
