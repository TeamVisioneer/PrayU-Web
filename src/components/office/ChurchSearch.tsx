import React, { useState, useEffect } from "react";
import { Church } from "@/data/mockOfficeData";
import { searchChurches } from "@/apis/churchApiService";

interface ChurchSearchProps {
  onSelectChurch: (church: Church) => void;
  useExternalApi?: boolean;
  selectedChurchId?: string | null;
}

const ChurchSearch: React.FC<ChurchSearchProps> = ({
  onSelectChurch,
  useExternalApi = true,
  selectedChurchId = null,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Church[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      setIsSearching(true);
      // Set a timeout to avoid too many API calls while typing
      const timer = setTimeout(async () => {
        try {
          const results = await searchChurches(searchQuery);
          setSearchResults(results);
        } catch (error) {
          console.error("Error searching churches:", error);
        } finally {
          setIsSearching(false);
        }
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, useExternalApi]);

  return (
    <div className="w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-500"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 20"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
            />
          </svg>
        </div>
        <input
          type="search"
          className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500"
          placeholder="교회 이름 또는 주소 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isSearching && (
        <div className="mt-4 flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      )}

      {!isSearching && searchResults.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">검색 결과</h3>
          <div className="space-y-2">
            {searchResults.map((church) => (
              <div
                key={church.id}
                className={`p-3 bg-white rounded-lg border ${
                  selectedChurchId === church.id
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-gray-200"
                } hover:bg-gray-50 cursor-pointer`}
                onClick={() => onSelectChurch(church)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{church.name}</h4>
                    <p className="text-sm text-gray-600">{church.address}</p>
                    <div className="flex items-center mt-1">
                      <p className="text-xs text-gray-500">
                        목사: {church.pastor}
                      </p>
                      {church.externalData?.denomination && (
                        <>
                          <span className="mx-2 text-gray-300">•</span>
                          <p className="text-xs text-gray-500">
                            {church.externalData.denomination}
                          </p>
                        </>
                      )}
                      {church.externalData?.phone && (
                        <>
                          <span className="mx-2 text-gray-300">•</span>
                          <p className="text-xs text-gray-500">
                            {church.externalData.phone}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  {selectedChurchId === church.id && (
                    <div className="text-blue-600 flex-shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isSearching && searchQuery && searchResults.length === 0 && (
        <div className="mt-4 text-center text-gray-500">
          검색 결과가 없습니다.
        </div>
      )}
    </div>
  );
};

export default ChurchSearch;
