import React from "react";

interface BibleVerseProps {
  verse: string;
  reference: string;
  bgColor?: string;
}

const BibleVerse: React.FC<BibleVerseProps> = ({
  verse,
  reference,
  bgColor = "bg-gradient-to-br from-prayCardStart via-prayCardMiddle to-white",
}) => {
  return (
    <div
      className={`w-full h-full rounded-xl overflow-hidden flex flex-col ${bgColor} p-6 shadow-sm transition-all relative`}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-full h-full text-blue-500"
        >
          <path d="M12 6.25278C10.7799 4.46222 8.96101 3.75 6.9486 3.75C3.55375 3.75 1 6.26222 1 9.59722C1 14.5305 5.59058 19.1583 11.5799 20.9972C11.8424 21.0639 12.1576 21.0639 12.4201 20.9972C18.4094 19.1583 23 14.5305 23 9.59722C23 6.26222 20.4462 3.75 17.0514 3.75C15.039 3.75 13.2201 4.46222 12 6.25278Z"></path>
        </svg>
      </div>

      <div className="absolute bottom-0 left-0 w-28 h-28 opacity-10 rotate-180">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-full h-full text-purple-500"
        >
          <path d="M12 6.25278C10.7799 4.46222 8.96101 3.75 6.9486 3.75C3.55375 3.75 1 6.26222 1 9.59722C1 14.5305 5.59058 19.1583 11.5799 20.9972C11.8424 21.0639 12.1576 21.0639 12.4201 20.9972C18.4094 19.1583 23 14.5305 23 9.59722C23 6.26222 20.4462 3.75 17.0514 3.75C15.039 3.75 13.2201 4.46222 12 6.25278Z"></path>
        </svg>
      </div>

      {/* Quote decorative elements */}
      <div className="absolute top-4 left-4 opacity-20">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-6 h-6 text-blue-800"
        >
          <path
            fillRule="evenodd"
            d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      <div className="flex-grow flex items-center justify-center py-6 z-10">
        <div className="text-center max-w-xs mx-auto">
          <p className="text-lg font-medium text-gray-800 leading-relaxed mb-6 whitespace-pre-line relative">
            <span className="absolute -top-3 -left-2 text-3xl text-blue-400 opacity-50">
              "
            </span>
            {verse}
            <span className="absolute -bottom-3 -right-2 text-3xl text-blue-400 opacity-50">
              "
            </span>
          </p>
          <p className="text-sm font-semibold text-blue-600 bg-white/50 inline-block px-3 py-1 rounded-full">
            {reference}
          </p>
        </div>
      </div>

      <div className="text-center mt-4 text-xs text-gray-500 font-medium animate-bounce">
        탭하여 기도카드 보기
      </div>
    </div>
  );
};

export default BibleVerse;
