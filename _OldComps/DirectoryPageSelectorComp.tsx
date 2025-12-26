import React, { useEffect, useState } from "react";
import { BASE_URL, IMAGE_URL } from "../../config";
import { UniversalGetStoredPage, UniversalGetStoredProfile } from "./UniversalStoredInformationComp";
import { SquaresExcludeIcon } from "lucide-react";

export function DirectoryPageSelectorComp() {
  const [options, setOptions] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  // const storedProfile = localStorage.getItem("StoredProfile")
  //   ? JSON.parse(localStorage.getItem("StoredProfile")!)
  //   : null;

  const storedProfile = UniversalGetStoredProfile();
  const storedPage = UniversalGetStoredPage();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/page/api/byOwnerEmail/${storedProfile?.Email}`
        );
        if (!res.ok) throw new Error("Failed to load dropdown options");
        const data = await res.json();
        setOptions(data);
      } catch (err) {
        console.error("Dropdown fetch failed for Page", err);
      }
    })();
  }, []);

  const handleSelect = (opt: any) => {
    localStorage.setItem("StoredPage", JSON.stringify(opt));
    window.location.reload();
    setModalOpen(false);
  };

  const renderListItem = (opt: any, index: number) => {
    const val = opt.id ?? opt.Id;
    const name = opt.Name ?? opt.Label ?? val;
    return (
      <div
        key={index}
        className="flex mb-1 bg-white items-center justify-between border border-gray-300 rounded-lg px-4 py-3 hover:bg-gray-100"
      >
        <div className="flex items-center space-x-4">
          <img
            src={IMAGE_URL + "/uploads/" + opt?.Thumbnail}
            alt={name}
            className="w-12 h-12 object-cover rounded-lg border border-gray-200"
          />
          <span className="text-gray-800 font-medium">{name}</span>
        </div>
        <button
          onClick={() => handleSelect(opt)}
          className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-sm font-medium shadow-sm hover:bg-blue-100 active:scale-95 transition-transform"
        >
          Choose
        </button>
      </div>
    );
  };

  return (
    <div className="w-full">
      {storedPage ? (
        <div className="flex items-center justify-between bg-white p-2 shadow">
          <div className="flex items-center space-x-4">
            <img
              src={IMAGE_URL + "/uploads/" + storedPage?.Thumbnail}
              alt={storedPage?.Name}
              className="w-12 h-12 object-cover rounded-lg border border-gray-200 cursor-pointer"
              onClick={() => setModalOpen(true)}
            />
            <div className="justify-center">
              <div
                className="text-gray-900  cursor-pointer"
                onClick={() => setModalOpen(true)}
              >
                <p className="text-xs text-blue-700">Your are posting as : </p>
                <p className="font-semibold">{storedPage?.Name} #{storedPage?.Id}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-sm font-medium shadow-sm hover:bg-blue-100 active:scale-95 transition-transform"
          >
            Change
          </button>
        </div>
      ) : options.length === 0 ? (
        <a
          href="/page/create"
          className="block w-full text-center bg-orange-500 text-white py-3 shadow"
        >
          You have no page, please create one
        </a>
      ) : (


        <div className=" p-4 max-h-screen overflow-y-auto bg-gray-500">
          <h2 className="flex items-center justify-center gap-2 text-gray-900 text-base font-medium mb-4">
            <SquaresExcludeIcon size={"20px"} className="text-red-500" />
            <span className="text-white">Please Choose a Page</span>
          </h2>
          {options.map(renderListItem)}
        </div>


      )}

      {/* Modal */}
      {/* Modal */}
      {modalOpen && (
        <div className="fixed max-w-[500px] inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50  px-4">
          <div className="bg-white w-[400px] h-[500px] max-w-full max-h-[80vh] rounded-lg shadow-lg flex flex-col ">

            {/* Header */}
            <h2 className="text-lg font-semibold text-gray-800 p-6 pb-0">
              Select Your Page
            </h2>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
              {options.length === 0 ? (
                <a
                  href="/page/create"
                  className="block w-full text-center bg-green-500 text-white py-3 rounded-lg shadow"
                >
                  Create New Page
                </a>
              ) : (
                <div className="space-y-2">
                  {options.map(renderListItem)}
                </div>
              )}
            </div>

            {/* Cancel button */}
            <div className="p-6 pt-0">
              <button
                onClick={() => setModalOpen(false)}
                className="w-full bg-gray-300 text-gray-700 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
