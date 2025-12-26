"use client";
import MenuTail from "@/app/_appComponents/MenuTail";
import React, { useEffect } from "react";
import FormUpdateComp from "@/app/_components/Form_UpdateComp";

export default function SettingUpdateComp() {
  const [data, setData] = React.useState<any>(null);

  const getData = async () => {
    const response = await fetch('/setting/api/1', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Failed to fetch settings');
    }
    const responseJson = await response.json();
    setData(responseJson[0]);
    console.log("Fetched setting data:", responseJson[0]);
    localStorage.setItem("StoredItem", JSON.stringify(responseJson[0]));
  }

  useEffect(() => {
    getData();
  }, []);

  const fields = [
    { fieldName: "SliderStyle", type: "dropdown", customSource: "styleNo" },
    { fieldName: "ArticleStyle", type: "dropdown", customSource: "styleNo" },
    { fieldName: "ClientStyle", type: "dropdown", customSource: "styleNo" },
    { fieldName: "FooterStyle", type: "dropdown", customSource: "styleNo" },
    { fieldName: "ProductStyle", type: "dropdown", customSource: "styleNo" },
    { fieldName: "ServiceStyle", type: "dropdown", customSource: "styleNo" },
    { fieldName: "TestimonialStyle", type: "dropdown", customSource: "styleNo" },
    { fieldName: "None", type: "separator" },

    { fieldName: "ArticleHeadingTitle", type: "text" },
    { fieldName: "ArticleSubHeadingTitle", type: "textarea" },
    { fieldName: "None", type: "separator" },

    { fieldName: "ServiceHeadingTitle", type: "text" },
    { fieldName: "ServiceSubHeadingTitle", type: "textarea" },
    { fieldName: "None", type: "separator" },

    { fieldName: "TestimonialHeadingTitle", type: "text" },
    { fieldName: "TestimonialSubHeadingTitle", type: "textarea" },
    { fieldName: "None", type: "separator" },

    { fieldName: "ClientHeadingTitle", type: "text" },
    { fieldName: "ClientSubHeadingTitle", type: "text" },
    { fieldName: "None", type: "separator" },

    { fieldName: "ProductHeadingTitle", type: "text"},
    { fieldName: "ProductSubHeadingTitle", type: "textarea" },
    { fieldName: "None", type: "separator" },
  ];

  return (
    <>
      <AdminMenu/>
      <div className="p-4 sm:ml-64">
        {data && <FormUpdateComp dataSource="setting" fields={fields} imageSize={""} customRedirect="/setting/update" />}
      </div>
    </>
  );
}
