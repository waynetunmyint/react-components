import React, { useState, useEffect } from "react";
import FooterOne from "../FooterComps/FooterOne";


interface Props {
  styleNo?: number;

}

export default function FooterSwitchComp({
  styleNo,
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
  };

  const renderVariant = () => {
    switch (view) {
      case 0:
        return <></>
        break;
      case 1:
        return <FooterOne {...common} />
        break;

      default:
        return <FooterOne {...common} />
    }
  };

  // If `view` is still null, wait — show a simple skeleton placeholder.
  if (view === null) {
    return (
      <div id="page-skeleton-footer">
        <div className="animate-pulse">
          <div className="h-40 bg-page border-page rounded-md" />
        </div>
      </div>
    );
  }

  return <div>{renderVariant()}</div>;
}