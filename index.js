import {
  getHtml,
  getTableContent,
  writeTableFile,
  getMatchesContent,
  writeMatchesFile,
  sleep,
} from "./lib/scraper";
import fs from "fs";
import { URL } from "./lib/scraper";

async function go() {
  const html = await getHtml(URL);
  const table = await getTableContent(await getHtml(URL));

  await writeTableFile(table);

  const matches = await getMatchesContent(html);
  const kopfingMatches = matches.filter((item) => {
    return ((item.home === "Kopfing") || (item.guest === "Kopfing"));
  })
  
  await writeMatchesFile(kopfingMatches);

  console.log("scrape complete\n");

  await sleep(2000);

  process.exit();
}

go();
