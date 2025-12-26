import React, { useState } from "react";
import DisplayBlockOne from "./Display_Block_One";
import DisplayBlockTwo from "./Display_Block_Two";
import DisplayBlockThree from "./Display_Block_Three";
import DisplayBlockFour from "./Display_Block_Four";
import DisplayBlockFive from "./Display_Block_Five";


interface Props {
  dataSource: string;
  initialView?: 0 | 1 | 2 | 3 | 4 | 5;
  headingTitle?: string | null;
  subHeadingTitle?: string | null;
  className?: string;
}

export default function GridSwitcherComp({
  dataSource,
  initialView = 0,
  headingTitle,
  subHeadingTitle,
  className,
}: Props) {
  const [view, setView] = useState<number>(initialView);

  const commonProps = { dataSource, headingTitle, subHeadingTitle };

  return (
    <div className={className ?? ""}>


      <div>
        {view === 1 && <DisplayBlockOne {...commonProps} />}
        {view === 2 && <DisplayBlockTwo {...commonProps} />}
        {view === 3 && <DisplayBlockThree {...commonProps} />}
        {view === 4 && <DisplayBlockFour {...commonProps} />}
        {view === 5 && <DisplayBlockFive {...commonProps} />} 
      </div>
    </div>
  );
}
