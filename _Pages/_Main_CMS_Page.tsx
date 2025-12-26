
import { IonContent, IonPage } from '@ionic/react';
import HeaderSwitcher from "../_SwitcherComps/HeaderSwitcher";
import { FOOTER_STYLE, PAGE_STYLE } from '../../../config';
import FooterSwitchComp from '../_SwitcherComps/FooterSwitcher';
import MainCMS from '../PageComps/MainCMS';


interface Props {
  dataSource: string;
  headingTitle?: string;
  subHeadingTitle?: string;
  styleNo?: number;
}

const Page: React.FC<Props> = ({ dataSource, headingTitle, subHeadingTitle }) => {
  const displayTitle = headingTitle || dataSource.charAt(0).toUpperCase() + dataSource.slice(1);

  return (
    <IonPage>
      <HeaderSwitcher styleNo={8} headingField={displayTitle} />
      <IonContent fullscreen>
        <div className='min-h-screen p-5 bg-white'>
          <MainCMS
            dataSource={dataSource}
            headingTitle={headingTitle}
            subHeadingTitle={subHeadingTitle}
            styleNo={PAGE_STYLE}
          />
        </div>
        <FooterSwitchComp styleNo={FOOTER_STYLE} />
      </IonContent>
    </IonPage>
  );
};

export default Page;