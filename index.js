import {
  getHtml,
  getTableContent,
  writeTableFile,
  getMatchesContent,
  getMatchesContent2,
  writeMatchesFile,
  getScorer
} from "./lib/scraper";
import fs from "fs";

async function go() {
  const url =
    "https://nachrichten.at/sport/fussball/unterhaus/2019_2020/1_klasse/1nw/kopfing";

  const table = await getTableContent(await getHtml(url));

  await writeTableFile(table);

  const matches = await getMatchesContent2();

  await writeMatchesFile(matches);

  console.log("scrape complete\n");
}

go();
