export const ChatSkeleton = () => {
  const skeletons = Array.from({ length: 20 }, (_, i) => i);

  return (
    <div className="p-4">
      {skeletons.map((_, index) => {
        const isMine = index % 2 === 0;
        return (
          <div
            key={index}
            className={`flex mb-3 ${isMine ? "justify-end" : "justify-start"}`}
          >
            {!isMine && (
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
            )}
            <div
              className={`ml-2 p-3 rounded-2xl max-w-[70%] ${
                isMine ? "bg-blue-100" : "bg-gray-100"
              }`}
            >
              <div className="h-3 w-20 bg-gray-300 rounded mb-2 animate-pulse" />
              <div className="h-4 w-40 bg-gray-300 rounded mb-1 animate-pulse" />
              <div className="h-4 w-24 bg-gray-300 rounded animate-pulse" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
