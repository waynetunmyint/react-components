import {
  IonContent,
  IonPage,
  IonRefresher,
  IonRefresherContent,
} from "@ionic/react";
import HeaderSwitcher from "../_SwitcherComps/HeaderSwitcher";
import BlockSwitcherComp from "../_SwitcherComps/BlockSwitcher";
import FooterSwitchComp from "../_SwitcherComps/FooterSwitcher";
import { usePageData } from "../PageComps/usePageData";
import { FOOTER_STYLE } from "../../../config";


export default function HomePage() {

  const { sortedItems, loading } = usePageData();

  const toDataSource = (block: string) => {
    if (!block) return "";
    return block.charAt(0).toLowerCase() + block.slice(1);
  };

  return (
    <IonPage>

      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={() => window.location.reload()}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
        <HeaderSwitcher headingField="Home" />
        <div className="mt-100 bg-[var(--bg-100)]">
          {loading ? (
            <div className="space-y-4 p-4">
              <div className="w-full h-64 bg-gray-100 rounded-xl animate-pulse" />
              <div className="w-full h-40 bg-gray-100 rounded-xl animate-pulse" />
              <div className="w-full h-40 bg-gray-100 rounded-xl animate-pulse" />
            </div>
          ) : (
            sortedItems.map((item: any) => (
              <BlockSwitcherComp
                key={item.id}
                dataSource={toDataSource(item.Block)}
                headingTitle={item.HeadingTitle}
                subHeadingTitle={item.SubHeadingTitle}
                styleNo={Number(item.StyleValue)}
                displayType={"cms"}
              />
            ))
          )}
        </div>

        <FooterSwitchComp styleNo={FOOTER_STYLE} />
      </IonContent>
    </IonPage>
  );
}
