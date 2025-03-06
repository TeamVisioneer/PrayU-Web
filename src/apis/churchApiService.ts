import { Church } from "@/data/mockOfficeData";
import axios from "axios";
import * as cheerio from "cheerio";

// Interface for search parameters
interface ChurchSearchParams {
  church_nm?: string;
  sido?: string;
  group_nm?: string;
  pastor_nm?: string;
}

// External church data structure from ch114.kr
interface ExternalChurchData {
  id: string;
  name: string;
  denomination: string;
  address: string;
  phone: string;
  pastor: string;
  detailUrl: string;
}

// Proxy server URL (change this to your actual proxy server)
const PROXY_URL = "http://localhost:3001/api/church-search";

/**
 * Fetches church data from ch114.kr using web scraping
 * @param params Search parameters
 * @returns Promise with array of Church objects
 */
export const searchExternalChurches = async (
  params: ChurchSearchParams,
): Promise<Church[]> => {
  try {
    // Build the URL with query parameters for the proxy
    const url = new URL(PROXY_URL);

    // Add search parameters if provided
    if (params.church_nm) {
      url.searchParams.append("church_nm", params.church_nm);
    }
    if (params.sido) url.searchParams.append("sido", params.sido);
    if (params.group_nm) url.searchParams.append("group_nm", params.group_nm);
    if (params.pastor_nm) {
      url.searchParams.append("pastor_nm", params.pastor_nm);
    }

    // Fetch the HTML through our proxy
    const response = await axios.get(url.toString());

    // Parse the HTML using cheerio
    const $ = cheerio.load(response.data);
    const churches: ExternalChurchData[] = [];

    // Extract church data from the table
    $(".tableList tbody tr").each((_, element) => {
      const columns = $(element).find("td");

      // Make sure we have enough columns
      if (columns.length < 6) return;

      // Extract detail URL and ID
      const detailLink = $(columns[5]).find("a").attr("href") || "";
      const id = detailLink.replace("/", ""); // Extract ID from URL

      const church: ExternalChurchData = {
        id,
        name: $(columns[0]).text().trim(),
        denomination: $(columns[1]).text().trim(),
        address: $(columns[2]).text().trim(),
        phone: $(columns[3]).text().trim(),
        pastor: $(columns[4]).text().trim(),
        detailUrl: `https://ch114.kr${detailLink}`,
      };

      churches.push(church);
    });

    // Convert external church data to our Church interface
    return churches.map((externalChurch) => convertToChurch(externalChurch));
  } catch (error) {
    console.error("Error fetching church data:", error);
    return [];
  }
};

/**
 * Converts external church data to our Church interface
 */
const convertToChurch = (externalChurch: ExternalChurchData): Church => {
  // Extract pastor name without title
  const pastorName = externalChurch.pastor.replace(" 목사", "");

  return {
    id: `external-${externalChurch.id}`,
    name: externalChurch.name,
    address: externalChurch.address,
    pastor: pastorName,
    memberCount: 0, // Unknown from the external data
    createdAt: new Date().toISOString().split("T")[0], // Today's date
    externalData: {
      denomination: externalChurch.denomination,
      phone: externalChurch.phone,
      detailUrl: externalChurch.detailUrl,
    },
  };
};

/**
 * Proxy function to search churches (either mock data or external)
 */
export const searchChurches = async (
  query: string,
  useExternal: boolean = false,
): Promise<Church[]> => {
  if (!query) return [];

  if (useExternal) {
    return await searchExternalChurches({ church_nm: query });
  } else {
    // Fall back to mock data if external search is disabled
    const { searchChurches } = await import("@/data/mockOfficeData");
    return searchChurches(query);
  }
};
