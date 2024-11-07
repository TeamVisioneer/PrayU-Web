import { supabase } from "./../../supabase/client";
import { Bible } from "../../supabase/types/tables";

export const getBible = async (
  longLabel: string,
  chapter: number,
  paragraph: number,
): Promise<Bible | null> => {
  try {
    const { data, error } = await supabase
      .from("bible")
      .select("long_label, short_label, chapter, paragraph, sentence")
      .eq("long_label", longLabel)
      .eq("chapter", chapter)
      .eq("paragraph", paragraph)
      .single();
    if (error) {
      return null;
    }
    return data as Bible;
  } catch (error) {
    return null;
  }
};
