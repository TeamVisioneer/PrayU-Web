import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import termsDataDefault from "./240909.json";
import { analyticsTrack } from "@/analytics/analytics";

// Define types for our terms data
interface TermsMetadata {
  title: string;
  effectiveDate: string;
  lastUpdated: string;
  platform: string;
}

interface TermsIntroduction {
  description: string;
}

interface TermsSection {
  id: string;
  title: string;
  clauses: (string | string[])[];
}

interface TermsClosing {
  miscellaneous: string[];
  dates: {
    publicationDate: string;
    effectiveDate: string;
  };
}

interface TermsData {
  metadata: TermsMetadata;
  introduction: TermsIntroduction;
  sections: TermsSection[];
  closing: TermsClosing;
}

const Term: React.FC = () => {
  const { version } = useParams<{ version?: string }>();
  const [data, setData] = useState<TermsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTerms = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // If no version specified or using the default version, use the import
        if (!version || version === "240909") {
          setData(termsDataDefault as unknown as TermsData);
          setIsLoading(false);
          return;
        }

        // Otherwise, dynamically import the version-specific file
        try {
          // Dynamic import using the version parameter
          const termsModule = await import(
            /* @vite-ignore */ `./${version}.json`
          );
          setData(termsModule.default as unknown as TermsData);
        } catch (importError) {
          console.error("Failed to load terms version:", importError);
          setError(`약관 버전 ${version}을 찾을 수 없습니다.`);
        }
      } catch (error) {
        console.error("Error loading terms data:", error);
        setError("약관을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    loadTerms();
  }, [version]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-700">
            {error || "이용약관을 불러올 수 없습니다."}
          </h2>
          <p className="mt-2 text-gray-500">잠시 후 다시 시도해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          {data.metadata.title}
        </h1>
        <p className="mt-4 text-gray-700">{data.introduction.description}</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-8 p-6">
        {data.sections.map((section) => (
          <div key={section.id} className="mb-10" id={section.id}>
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">
              {section.title}
            </h2>
            <div className="space-y-4">
              {section.clauses.map((clause, idx) => {
                if (typeof clause === "string") {
                  return (
                    <p key={idx} className="text-gray-700 leading-relaxed">
                      {clause}
                    </p>
                  );
                } else {
                  // Handle array of sub-clauses
                  return (
                    <ul
                      key={idx}
                      className="list-disc pl-6 text-gray-700 space-y-2"
                    >
                      {clause.map((subClause, subIdx) => (
                        <li key={subIdx} className="leading-relaxed">
                          {subClause}
                        </li>
                      ))}
                    </ul>
                  );
                }
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">
          부칙
        </h2>
        <ul className="space-y-3 text-gray-700">
          {data.closing.miscellaneous.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-6 text-sm text-gray-600">
          <p>공고일자: {data.closing.dates.publicationDate}</p>
          <p>시행일자: {data.closing.dates.effectiveDate}</p>
        </div>
      </div>

      <div className="text-center text-sm text-gray-500 mt-12">
        <p>
          본 이용약관에 대해 궁금한 점이 있으시면 PrayU 고객센터로 문의해주세요.
        </p>
        <button
          onClick={() => {
            analyticsTrack("클릭_문의", {});
            window.open(
              import.meta.env.VITE_PRAY_KAKAO_CHANNEL_CHAT_URL,
              "_blank"
            );
          }}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-150"
        >
          고객센터 문의하기
        </button>
      </div>
    </div>
  );
};

export default Term;
