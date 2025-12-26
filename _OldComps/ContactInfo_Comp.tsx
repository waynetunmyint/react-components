"use client";
import React, { useEffect, useState } from "react";
import AdminMenu from "../_MenuComps/AdminMenu";
import FormUpdateComp from "./Form_UpdateComp";

export default function ContactInfoUpdateComp() {
  const [data, setData] = React.useState<any>(null);

  const getData = async () => {
    const res = await fetch("/contactInfo/api/1", { cache: "no-store" });
    if (!res.ok) {
      throw new Error("Failed to fetch settings");
    }
    const data = await res.json();
    setData(data[0]);
    localStorage.setItem("StoredItem", JSON.stringify(data[0]));
  };

  useEffect(() => {
    getData();
  }, []);

  const fields = [
    { fieldName: "Thumbnail", type: "image" },
    { fieldName: "Title", type: "text" },
    { fieldName: "GoogleMapCode", type: "textarea" },
    { fieldName: "Description", type: "textarea" },

    { fieldName: "PhoneOne", type: "text" },
    { fieldName: "Email", type: "text" },
    { fieldName: "OpenTime", type: "text" },
    { fieldName: "Address", type: "textarea" },

    { fieldName: "WebsiteURL", type: "text" },
    { fieldName: "InstagramURL", type: "text" },
    { fieldName: "LinkedInURL", type: "text" },
    { fieldName: "YoutubeURL", type: "text" },
    { fieldName: "TwitterURL", type: "text" },
    { fieldName: "TikTokURL", type: "text" },
  ];

  return (
    <>
      <AdminMenu />
      <div className="p-4 sm:ml-64">
        {data && <FormUpdateComp dataSource="contactInfo" fields={fields} imageSize={""} customRedirect="/contactInfo/update" />}
      </div>
    </>
  );
}
