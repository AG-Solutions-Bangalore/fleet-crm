import React from "react";
import { Button } from "@/components/ui/button";

const ApiErrorPage = ({ message = "Something went wrong.", onRetry }) => {
  return (
    <div className="flex items-center justify-center min-h-[60vh] w-full p-4">
      <div className="text-center">
        <div className="text-red-600 font-semibold mb-4">{message}</div>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm">
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
};

export default ApiErrorPage;
