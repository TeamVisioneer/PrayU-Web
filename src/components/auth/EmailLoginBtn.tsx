import { supabase } from "../../../supabase/client";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@radix-ui/react-accordion";
import { analyticsTrack } from "@/analytics/analytics";
import { MdEmail } from "react-icons/md";
import useBaseStore from "@/stores/baseStore";

const EmailLoginBtn = () => {
  const setIsOpenEmailLoginAccordian = useBaseStore(
    (state) => state.setIsOpenEmailLoginAccordian
  );
  const handleAccordionChange = (value: string) => {
    if (value === "item-1") {
      setIsOpenEmailLoginAccordian(true);
    } else {
      setIsOpenEmailLoginAccordian(false);
    }
  };

  return (
    <div className="bg-gray-200 rounded-lg justify-between ">
      <Accordion
        type="single"
        collapsible
        className="w-full"
        onValueChange={handleAccordionChange}
      >
        <AccordionItem value="item-1">
          <AccordionTrigger
            onClick={() => {
              analyticsTrack("클릭_이메일_로그인", {});
            }}
            className="flex w-full justify-between items-center gap-3 px-4 py-2 rounded-lg text-sm"
          >
            <MdEmail className="w-[18px] h-[18px] text-gray-500" />
            <div className="flex-grow text-gray-600">이메일로 시작하기</div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="p-4">
              <Auth
                supabaseClient={supabase}
                appearance={{ theme: ThemeSupa }}
                providers={[]}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default EmailLoginBtn;
