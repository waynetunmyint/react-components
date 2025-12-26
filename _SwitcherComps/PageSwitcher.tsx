import React, { useState, useEffect } from "react";



interface Props {
  dataSource: string;
  styleNo?: number;
  headingTitle?: string | null;
  subHeadingTitle?: string | null;
}

export default function PageSwitcherComp({
  dataSource,
  styleNo,
  headingTitle,
  subHeadingTitle,
}: Props) {
  // Keep `view` null until a valid `styleNo` arrives so caller
  // can asynchronously provide it (e.g. loaded from DB/settings).
  const [view, setView] = useState<number | null>(
    styleNo !== undefined && styleNo !== null ? Number(styleNo) : null
  );
  useEffect(() => {
    if (styleNo !== undefined && styleNo !== null) {
      setView(Number(styleNo));
    }
  }, [styleNo]);
  const common = {
    dataSource,
    headingTitle: headingTitle ?? undefined,
    subHeadingTitle: subHeadingTitle ?? undefined
  };

  const renderVariant = () => {
    switch (view) {
      default: return <></>;
    }
  };

  // If `view` is still null, wait — show a simple skeleton placeholder.
  if (view === null) {
    return (
      <div>
        <div className="animate-pulse">
          <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded-md" />
        </div>
      </div>
    );
  }

  return <div>{renderVariant()}</div>;
}
