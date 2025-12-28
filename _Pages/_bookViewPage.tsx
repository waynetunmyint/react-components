import { IonContent, IonPage } from '@ionic/react';
import { useParams } from 'react-router';
import { useState, useEffect } from 'react';
import HeaderSwitcher from "../_SwitcherComps/HeaderSwitcher";
import { BASE_URL, FOOTER_STYLE, PAGE_ID } from '../../../config';
import FooterSwitchComp from '../_SwitcherComps/FooterSwitcher';
import BookViewOne from '../BookComps/BookViewOne';

interface Props {
  dataSource: string;
  title?: string;
}

const BookViewPage: React.FC<Props> = ({ dataSource, title }) => {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState(null);

  // Auto-generate title from dataSource if not provided
  const displayTitle = title || dataSource.charAt(0).toUpperCase() + dataSource.slice(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/${dataSource}/api/byPageId/view/${PAGE_ID}/${id}`);
        const data = await response.json();
        setItem(data);
      } catch (error) {
        console.error('Error fetching book data:', error);
      }
    };

    if (id) {
      fetchData();
    }
  }, [dataSource, id]);

  return (
    <IonPage>
      <HeaderSwitcher headingField={displayTitle} />
      <IonContent fullscreen>
        <div className='min-h-screen p-5 bg-white'>
          <BookViewOne item={item} />
        </div>
        <FooterSwitchComp styleNo={FOOTER_STYLE} />
      </IonContent>
    </IonPage>
  );
};

export default BookViewPage;
