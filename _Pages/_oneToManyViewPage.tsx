import { IonContent, IonPage } from '@ionic/react';
import { useParams } from 'react-router';
import HeaderSwitcher from "../_SwitcherComps/HeaderSwitcher";
import { FOOTER_STYLE } from '../../../config';
import FooterSwitchComp from '../_SwitcherComps/FooterSwitcher';
import { OneToManyView } from '../ViewComps/OneToManyView';

interface Props {
    /** The parent data source (e.g., "bookAuthor", "bookCategory", "brand") */
    dataSource: string;
    /** Optional title for the header */
    title?: string;
    /** Optional custom view component - defaults to DetailViewOne */
    ViewComponent?: React.ComponentType<{ item: any }>;
    /** The child data source for related items (e.g., "book", "article") - optional */
    childDataSource?: string;
    /** The heading for the related items section */
    childSectionTitle?: string;
    /** 
     * The API path pattern for fetching related child items.
     * Use {PAGE_ID} and {ITEM_ID} as placeholders.
     * Example: "/book/api/byPageId/byBookAuthorId/{PAGE_ID}/{ITEM_ID}"
     */
    childApiPattern?: string;
}

const OneToManyViewPage: React.FC<Props> = ({
    dataSource,
    title,
    ViewComponent,
    childDataSource,
    childSectionTitle,
    childApiPattern
}) => {
    const { id } = useParams<{ id: string }>();

    // Auto-generate title from dataSource if not provided
    const displayTitle = title || dataSource.charAt(0).toUpperCase() + dataSource.slice(1);

    return (
        <IonPage>
            <HeaderSwitcher headingField={displayTitle} />
            <IonContent fullscreen>
                <OneToManyView
                    dataSource={dataSource}
                    id={id}
                    ViewComponent={ViewComponent}
                    childDataSource={childDataSource}
                    childSectionTitle={childSectionTitle}
                    childApiPattern={childApiPattern}
                />
                <FooterSwitchComp styleNo={FOOTER_STYLE} />
            </IonContent>
        </IonPage>
    );
};

export default OneToManyViewPage;
