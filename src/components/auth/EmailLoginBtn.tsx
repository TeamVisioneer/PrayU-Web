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

const EmailLoginBtn = () => {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger
          onClick={() => analyticsTrack("클릭_이메일_로그인", {})}
          className="w-full"
        >
          <button className="w-full flex justify-between items-center gap-3 px-4 py-2 rounded-lg text-sm bg-gray-200 border-gray-200 border-2">
            <MdEmail className="w-4 h-4 text-gray-600" />
            <div className="flex-grow text-gray-600">이메일로 시작하기</div>
          </button>
        </AccordionTrigger>
        <AccordionContent>
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={[]}
            redirectTo="http://localhost:5173/auth/callback"
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default EmailLoginBtn;
