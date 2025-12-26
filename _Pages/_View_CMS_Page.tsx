import { IonContent, IonPage, IonRefresher, IonRefresherContent } from '@ionic/react';
import { useParams } from 'react-router';
import HeaderSwitcher from "../_SwitcherComps/HeaderSwitcher";
import { FOOTER_STYLE } from '../../../config';
import FooterSwitchComp from '../_SwitcherComps/FooterSwitcher';
import ViewSwitcher, { ChildConfig } from '../_SwitcherComps/ViewSwitcher';
interface Props {
  dataSource: string;
  headingTitle?: string;
  subHeadingTitle?: string;
  styleNo?: number;
  /** Optional custom view component */
  ViewComponent?: React.ComponentType<{ item: any }>;
  /** The child data source for related items (Legacy) */
  childDataSource?: string;
  /** The heading for the related items section (Legacy) */
  childSectionTitle?: string;
  /** The API path pattern for fetching related child items (Legacy) */
  childApiPattern?: string;
  /** Multiple child data sources for related items */
  childrenConfigs?: ChildConfig[];
}

const CommonViewPage: React.FC<Props> = ({
  dataSource,
  headingTitle,
  styleNo,
  ViewComponent,
  childDataSource,
  childSectionTitle,
  childApiPattern,
  childrenConfigs
}) => {
  const { id } = useParams<{ id: string }>();

  // Auto-generate title from dataSource if not provided
  const displayTitle = headingTitle || dataSource.charAt(0).toUpperCase() + dataSource.slice(1);

  return (
    <IonPage>
      <HeaderSwitcher headingField={displayTitle} />
      <IonContent fullscreen>

        <div className='min-h-screen bg-white mt-[100px]'>
          <ViewSwitcher
            dataSource={dataSource}
            idField={id || ''}
            styleNo={styleNo}
            ViewComponent={ViewComponent}
            childDataSource={childDataSource}
            childSectionTitle={childSectionTitle}
            childApiPattern={childApiPattern}
            childrenConfigs={childrenConfigs}
          />
        </div>
        <FooterSwitchComp styleNo={FOOTER_STYLE} />
      </IonContent>
    </IonPage>
  );
};

export default CommonViewPage;
