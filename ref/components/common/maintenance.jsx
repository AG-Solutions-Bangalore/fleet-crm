import React from "react";

const Maintenance = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center p-6 max-w-lg bg-white rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-gray-800">
          🚧 Under Maintenance 🚧
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          We are currently working on improvements. You will receive an update
          soon!
        </p>
        <p className="mt-2 text-gray-500">Thank you for your patience. 🙏</p>
      </div>
    </div>
  );
};

export default Maintenance;
