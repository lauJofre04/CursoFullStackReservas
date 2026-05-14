export const LeccionSkeleton = () => {
  return (
    <div className="animate-pulse space-y-6">
      <div className="bg-gray-200 dark:bg-gray-700 rounded-3xl h-80 w-full shadow-inner"></div>
      <div className="space-y-3">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-2/3"></div>
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-5/6"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-11/12"></div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-3xl"></div>
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-3xl"></div>
      </div>
      <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-3xl"></div>
    </div>
  );
};
