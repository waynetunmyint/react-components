"use client";
import React, { useEffect, useState } from "react";
import { formatNumber } from "../HelperComps/TextCaseComp";
import { BASE_URL, IMAGE_URL } from "@/config";
import LoadingComp from "../HelperComps/LoadingComp";
import { Printer } from "lucide-react";

interface Props {
    billId: string;
    type: "invoice" | "receipt";
}

export default function PageBillPrint({ billId, type }: Props) {
    const [bill, setBill] = useState<any>(null);
    const [page, setPage] = useState<any>(null);
    const [developer, setDeveloper] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Bill
                const billRes = await fetch(`${BASE_URL}/pageBill/api/${billId}`);
                const billData = await billRes.json();
                const billItem = Array.isArray(billData) ? billData[0] : billData;
                setBill(billItem);

                // Fetch Developer (ID 1)
                try {
                    const devRes = await fetch(`${BASE_URL}/page/api/1`);
                    if (devRes.ok) {
                        const devData = await devRes.json();
                        setDeveloper(Array.isArray(devData) ? devData[0] : devData);
                    }
                } catch (e) {
                    console.error("Failed to fetch developer details", e);
                }

                // Fetch Page if PageId exists
                if (billItem?.PageId) {
                    try {
                        const pageRes = await fetch(`${BASE_URL}/page/api/${billItem.PageId}`);
                        if (pageRes.ok) {
                            const pageData = await pageRes.json();
                            setPage(Array.isArray(pageData) ? pageData[0] : pageData);
                        }
                    } catch (e) {
                        console.error("Failed to fetch page details", e);
                    }
                }
            } catch (error) {
                console.error("Error fetching data", error);
            } finally {
                setLoading(false);
            }
        };
        if (billId) fetchData();
    }, [billId]);

    useEffect(() => {
        if (!loading && bill) {
            setTimeout(() => {
                window.print();
            }, 800);
        }
    }, [loading, bill]);

    if (loading) {
        return <LoadingComp
            title="Preparing Invoice"
            subtitle="Fetching data and generating your document..."
            steps={['Fetching', 'Generating', 'Ready']}
            currentStep={1}
            color="amber"
            icon={<Printer size={28} className="text-amber-500" />}
        />;
    }

    if (!bill) return <div className="p-10 text-center text-red-500">Bill not found</div>;

    const isInvoice = type === "invoice";
    const colorClass = isInvoice ? "text-amber-600" : "text-emerald-600";
    const bgBadge = isInvoice ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200";
    const borderColor = isInvoice ? "border-amber-100" : "border-emerald-100";

    const year = new Date().getFullYear();
    const effectiveYear = new Date(bill.CreatedAt).getFullYear() + 1; // Example: 2026? Or just current year.

    return (
        <div className="bg-white min-h-screen flex flex-col relative font-sans text-[#1f2937] print:p-0 print:m-0 print:h-[297mm] print:w-[210mm]">
            <style>{`
                @media print {
                    @page {
                        margin: 0;
                        size: A4;
                    }
                    body {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
             `}</style>
            {/* Header Section with Geometric Shapes */}
            <div className="relative h-48 overflow-hidden print:h-40">
                {/* Teal Background */}
                <div className="absolute inset-0 bg-[#146ebd] z-0"></div>

                {/* Yellow Diagonal Slice */}
                <div
                    className="absolute bottom-0 left-0 right-0 h-20 bg-[#ffca05] z-10 origin-bottom-left"
                    style={{
                        clipPath: 'polygon(0 100%, 100% 100%, 100% 0)',
                        transform: 'translateY(1px)' // Fix sub-pixel gaps
                    }}
                />

                {/* Content */}
                <div className="relative z-20 p-8 flex items-start print:p-6">
                    {/* Logo Area */}
                    <div className="text-white">
                        <div className="flex items-center gap-4 mb-2">
                            {/* Dynamic Logo */}
                            {developer?.ContactInfoThumbnail ? (
                                <img
                                    src={`${IMAGE_URL}/uploads/${developer.ContactInfoThumbnail}`}
                                    alt="Logo"
                                    className="w-16 h-16 object-contain"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-full border-2 border-white flex items-center justify-center">
                                    <div className="w-3 h-3 bg-white rounded-full mx-1"></div>
                                    <div className="w-4 h-4 bg-white rounded-full mx-0.5 -mt-4"></div>
                                    <div className="w-3 h-3 bg-white rounded-full mx-1"></div>
                                </div>
                            )}
                            <div>
                                <h1 className="text-5xl font-bold tracking-tight">MWS</h1>
                                <p className="text-sm tracking-[0.2em] font-light">DIGITAL AGENCY</p>
                            </div>
                        </div>
                        <p className="text-xs opacity-80 mt-1 ml-2">Since 2008</p>
                    </div>
                </div>
            </div>

            {/* Watermark for Receipt */}
            {!isInvoice && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                    <h1 className="text-[150px] font-black text-emerald-600/20 -rotate-45 uppercase select-none border-8 border-emerald-600/20 px-8 py-2 rounded-xl">
                        PAID
                    </h1>
                </div>
            )}

            <div className="p-12 md:p-16 max-w-5xl mx-auto relative z-10 print:p-8">
                <div className="flex justify-between items-end mb-16 print:mb-8">
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider mb-2">BILLING TO</h3>
                        <div className="text-lg font-bold">{page?.Title || "Client Name"}</div>
                        <div className="text-sm text-gray-600 max-w-xs">{page?.Address}</div>
                    </div>
                    <div className="text-right">
                        <h1 className="text-5xl font-bold text-[#1f2937] mb-2 print:text-4xl">
                            {isInvoice ? "INVOICE" : "RECEIPT"}
                        </h1>
                        <div>
                            <span className="text-sm font-bold uppercase tracking-wider mr-2">EFFECTIVE DATE</span>
                            <span className="text-sm">
                                {bill.EffectivePeriod && bill.EffectivePeriod}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="mb-12">
                    <div className="grid grid-cols-12 bg-[#003b5c] text-white font-bold text-center py-2 text-sm">
                        <div className="col-span-6 text-left pl-4">Item Description</div>
                        <div className="col-span-2 text-right">Price</div>
                        <div className="col-span-2">Qty</div>
                        <div className="col-span-2 text-right pr-4">SubTotal</div>
                    </div>

                    {/* Dynamic Items */}
                    {(() => {
                        let items: any[] = [];
                        try {
                            if (typeof bill.ItemList === 'string') {
                                items = JSON.parse(bill.ItemList);
                            } else if (Array.isArray(bill.ItemList)) {
                                items = bill.ItemList;
                            }
                        } catch (e) {
                            items = [];
                        }

                        const exchangeRate = Number(bill.ExchangeRate) || 1;

                        if (items && items.length > 0) {
                            return items.map((item: any, idx: number) => (
                                <div key={idx} className={`grid grid-cols-12 border-b border-gray-200 py-3 text-center items-center text-sm ${idx % 2 === 0 ? 'bg-gray-100/50' : 'bg-white'}`}>
                                    <div className="col-span-6 text-left pl-4 font-medium">{item.Title}</div>
                                    <div className="col-span-2 text-right">${formatNumber(item.Price)}</div>
                                    <div className="col-span-2">{item.Qty}</div>
                                    <div className="col-span-2 text-right pr-4 font-bold text-gray-700">
                                        {formatNumber(Number(item.Price) * Number(item.Qty) * exchangeRate)}
                                    </div>
                                </div>
                            ));
                        } else {
                            // Fallback to main Title/Amount if no items
                            return (
                                <div className="grid grid-cols-12 bg-gray-100/50 border-b border-gray-200 py-3 text-center items-center text-sm">
                                    <div className="col-span-6 text-left pl-4 font-medium">{bill.Title}</div>
                                    <div className="col-span-2 text-right">${formatNumber(bill.Amount || 0)}</div>
                                    <div className="col-span-2">1</div>
                                    <div className="col-span-2 text-right pr-4 font-bold text-gray-700">
                                        {formatNumber((Number(bill.Amount) || 0) * exchangeRate)}
                                    </div>
                                </div>
                            );
                        }
                    })()}

                    {/* Description as extra row if empty items or just always show if exists? 
                        User kept Description field, so let's show it below items if it exists as a note or row */
                    }
                    {bill.Description && (
                        <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-200 py-3 text-center items-center text-sm text-gray-600">
                            <div className="col-span-6 text-left pl-4 italic">{bill.Description}</div>
                            <div className="col-span-6"></div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-12 gap-8 mb-12">
                    <div className="col-span-7">
                        {/* Note Box */}
                        <div className="bg-gray-100 p-4 rounded text-sm text-gray-600 leading-relaxed">
                            <p className="mb-2">Choose Only One Package</p>
                            <p className="text-xs">
                                Note: This is an auto-generated invoice.
                            </p>
                        </div>

                        <div className="mt-8">
                            <h4 className="font-bold text-[#146ebd] mb-1">Payment Info</h4>
                            <div className="text-sm">
                                <p className="font-bold text-[#146ebd]">Wai Lin Tun</p>
                                <p className="text-[#146ebd]">KPay - 095053325</p>
                            </div>
                        </div>

                        <div className="mt-8">
                            <h4 className="font-bold uppercase mb-2 text-sm">TERMS AND CONDITION</h4>
                            <ul className="list-disc ml-4 text-xs text-gray-600">
                                <li>NO REFUNDABLE</li>
                            </ul>
                        </div>
                    </div>

                    <div className="col-span-5">
                        <div className="space-y-2">
                            {/* Calculate Total dynamically */}
                            {/* Calculate Total dynamically */}
                            {(() => {
                                const exchangeRate = Number(bill.ExchangeRate) || 1;
                                let total = (Number(bill.Amount) || 0) * exchangeRate;

                                let items: any[] = [];
                                try {
                                    if (typeof bill.ItemList === 'string') items = JSON.parse(bill.ItemList);
                                    else if (Array.isArray(bill.ItemList)) items = bill.ItemList;
                                    if (items.length > 0) {
                                        // Calculate total based on items and exchange rate
                                        total = items.reduce((acc, item) => acc + (Number(item.Price) * Number(item.Qty) * exchangeRate), 0);
                                    }
                                } catch (e) { }

                                // If IsPackage is true (1 or "1"), we do not calculate total/subtotal
                                const isPackage = bill.IsPackage == 1 || bill.IsPackage === "1";
                                const totalDisplay = isPackage ? "-" : `${formatNumber(total)}`;

                                return (
                                    <>
                                        <div className="flex justify-between bg-gray-100 py-2 px-4 rounded text-sm">
                                            <span>Sub Total</span>
                                            <span>{totalDisplay}</span>
                                        </div>
                                        <div className="flex justify-between bg-gray-100 py-2 px-4 rounded text-sm">
                                            <span>Tax</span>
                                            <span>0</span>
                                        </div>
                                        <div className="flex justify-between bg-gray-100 py-2 px-4 rounded text-sm">
                                            <span>Exchange Rate</span>
                                            <span>{bill.ExchangeRate ? formatNumber(bill.ExchangeRate) : "-"}</span>
                                        </div>
                                        <div className="flex justify-between bg-[#003b5c] text-white py-3 px-4 rounded text-lg font-bold mt-4">
                                            <span>Total</span>
                                            <span>{totalDisplay}</span>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-[#005f73] text-white p-12 mt-auto print:p-8">
                <div className="max-w-5xl mx-auto grid grid-cols-3 gap-8">
                    <div>
                        <h4 className="font-bold mb-4">Office Address</h4>
                        <p className="text-sm opacity-80 whitespace-pre-line leading-relaxed">
                            {developer?.ContactInfoAddress || "BUILDING 2, ROOM 302\nKYI DAW HOUSING\nYANGON"}
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">Hotline</h4>
                        <div className="flex items-center gap-2 text-sm opacity-80 mb-2">
                            <span>📞</span> {developer?.ContactInfoPhoneOne || "+959254062180"}
                        </div>
                        <div className="flex items-center gap-2 text-sm opacity-80">
                            <span>✉️</span> {developer?.ContactInfoEmail || "hello@mwscompany.com"}
                        </div>
                    </div>
                    <div className="text-right flex flex-col items-end justify-center">
                        <h2 className="text-4xl font-bold">MWS</h2>
                        <p className="text-xs tracking-[0.2em] font-light mt-1">YOUR DIGITAL PARTNER</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
