import React, { useState, useEffect } from "react";
import { CommonViewOne } from "../ViewComps/Common_ViewOne";
import { BrandViewOne } from "../ViewComps/Brand_ViewOne";
import { BASE_URL, PAGE_ID } from "../../../config";
import { BrandViewTwo } from "../ViewComps/Brand_ViewTwo";
import { ContactViewOne } from "../ViewComps/Contact_ViewOne";
import { ContactViewTwo } from "../ViewComps/Contact_ViewTwo";

interface Props { 
    dataSource?: string;
    styleNo?: number | 1;
    customAPI: string | null;
    idField?: string |null;
}

export default function ViewSwitcher({ dataSource, styleNo, customAPI, idField }: Props) {
    const [view, setView] = useState<number | null>(
        styleNo !== undefined && styleNo !== null ? Number(styleNo) : null
    );
    const [item, setItem] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (styleNo !== undefined && styleNo !== null) {
            setView(Number(styleNo));
        }
    }, [styleNo]);

    useEffect(() => {
        const fetchData = async () => {
            if (!dataSource && !customAPI) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                let url = null;
                if (customAPI) {
                    url = `${BASE_URL}${customAPI}`;
                } else {
                    url = `${BASE_URL}/${dataSource}/api/byPageId/view/${PAGE_ID}/${idField}`;
                }

                const response = await fetch(url);
                if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
                
                const responseJson = await response.json();
                console.log("Fetched data:", responseJson, url, idField);
                
                // Handle both array and single object responses
                const data = Array.isArray(responseJson) ? responseJson[0] : responseJson;
                setItem(data);
            } catch (error) {
                console.error("Error fetching data:", error);
                setItem(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [dataSource, customAPI, idField]);

    const common = {
        customAPI,
        dataSource,
        idField
    };

    const renderVariant = () => {
        const displayStyle = (dataSource ?? "") + (styleNo?.toString() ?? "");
        switch (displayStyle) {
            case "brand1": return <BrandViewOne item={item} {...common} />;
            case "brand2": return <BrandViewTwo item={item} {...common} />;
            case "contactInfo1": return <ContactViewOne item={item} {...common} />;
            case "contactInfo2": return <ContactViewTwo item={item} {...common} />;
            default: return <CommonViewOne item={item} {...common} />;
        }
    };

    if (view === null || loading) {
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