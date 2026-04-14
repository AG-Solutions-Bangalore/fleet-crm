const PaginationShimmer = () => {
  return (
    <div className="flex items-center justify-between py-1 animate-pulse">
      <div className="h-4 w-52 bg-gray-200 rounded" />

      <div className="flex items-center space-x-2">
        <div className="h-8 w-8 bg-gray-200 rounded" />

        <div className="flex items-center space-x-1">
          <div className="h-8 w-8 bg-gray-200 rounded" />
          <div className="h-8 w-8 bg-gray-200 rounded" />
          <div className="text-gray-400 text-sm px-2 select-none">...</div>
          <div className="h-8 w-8 bg-gray-200 rounded" />
        </div>

        <div className="flex items-center space-x-2 text-sm">
          <div className="h-4 w-10 bg-gray-200 rounded" />
          <div className="h-8 w-16 bg-gray-200 rounded" />
          <div className="h-4 w-12 bg-gray-200 rounded" />
        </div>

        <div className="h-8 w-8 bg-gray-200 rounded" />
      </div>
    </div>
  );
};
export default PaginationShimmer;
