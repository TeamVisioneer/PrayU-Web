import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { FaCheck } from "react-icons/fa";

import useBaseStore from "@/stores/baseStore";
import { useState } from "react";
import { useToast } from "../ui/use-toast";
import * as Sentry from "@sentry/react";

const ReportAlert: React.FC = () => {
  const { toast } = useToast();

  const isReportAlertOpen = useBaseStore((state) => state.isReportAlertOpen);
  const setIsReportAlertOpen = useBaseStore(
    (state) => state.setIsReportAlertOpen
  );
  const reportData = useBaseStore((state) => state.reportData);

  const [reportContent, setReportContent] = useState("");
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({
    advertisement: false,
    copyright: false,
    obscene: false,
    insult: false,
    personalInfo: false,
    spam: false,
    other: false,
  });

  const reportSelectList = [
    { id: "advertisement", label: "영리목적/홍보성" },
    { id: "copyright", label: "저작권침해" },
    { id: "obscene", label: "음란성/선정성" },
    { id: "insult", label: "욕설/인신공격" },
    { id: "personalInfo", label: "개인정보노출" },
    { id: "spam", label: "반복게시" },
    { id: "other", label: "기타" },
  ];

  const handleCheckboxChange = (key: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const onClickReport = async () => {
    const trueKeys = Object.keys(checkedItems).filter(
      (key) => checkedItems[key] === true
    );
    const reportCategories = reportSelectList
      .filter((item) => trueKeys.includes(item.id))
      .map((item) => item.label);
    const DISCORD_REPORT_WEBHOOK = import.meta.env.VITE_DISCORD_REPORT_WEBHOOK;
    const payload = {
      content: null,
      embeds: [
        {
          title: "카테고리",
          description: reportCategories.join(", "),
          color: null,
          fields: [
            { name: "제보 유저 ID", value: reportData.currentUserId },
            { name: "신고 유저 ID", value: reportData.targetUserId },
            { name: "신고 내용", value: reportData.content },
            // 어드민이 대상 카드를 바로 특정할 수 있도록 (운영 탭에서 ID로 삭제)
            {
              name: "기도카드 ID",
              value: reportData.prayCardId || "(없음)",
            },
            { name: "신고 사유", value: reportContent },
          ],
        },
      ],
      attachments: [],
    };

    try {
      const response = await fetch(DISCORD_REPORT_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast({ description: "🚨 신고가 완료되었습니다." });
      } else {
        Sentry.captureException(response.statusText);
      }
    } catch (error) {
      Sentry.captureException(error);
    }
  };

  return (
    <AlertDialog open={isReportAlertOpen} onOpenChange={setIsReportAlertOpen}>
      <AlertDialogContent className="w-11/12 rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-bold">
            신고하기
          </AlertDialogTitle>
          <AlertDialogDescription></AlertDialogDescription>
        </AlertDialogHeader>

        <div className="grid grid-cols-2 gap-4">
          {reportSelectList.map((item) => (
            <div className="flex items-center space-x-2" key={item.id}>
              <label className="relative flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id={item.id}
                  checked={checkedItems[item.id]}
                  onChange={() => handleCheckboxChange(item.id)}
                  className="sr-only"
                />
                <span
                  className={`w-6 h-6 flex justify-center items-center rounded-full border-2 ${
                    checkedItems[item.id]
                      ? "bg-liteRed border-none"
                      : "border-gray-300"
                  }`}
                >
                  {checkedItems[item.id] && (
                    <FaCheck className="text-white" size={14} />
                  )}
                </span>
                <label
                  htmlFor={item.id}
                  className="text-liteBlack text-base ml-2"
                >
                  {item.label}
                </label>
              </label>
            </div>
          ))}
        </div>

        <Textarea
          value={reportContent}
          onChange={(e) => setReportContent(e.target.value)}
        />

        <AlertDialogFooter className="flex flex-col items-center">
          <AlertDialogAction
            className="w-full bg-liteRed text-white py-2 rounded-md hover:bg-red-600"
            onClick={() => onClickReport()}
          >
            신고하기
          </AlertDialogAction>
          <AlertDialogCancel className="mt-2 w-full bg-gray-200 text-black py-2 rounded-md hover:bg-gray-300">
            취소
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ReportAlert;
