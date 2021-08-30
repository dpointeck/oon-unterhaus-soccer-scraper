import {
  getHtml,
  getTableContent,
  writeTableFile,
  getMatchesContent,
  getMatchesContent2,
  writeMatchesFile,
  getScorer,
  sleep
} from "./lib/scraper";
import fs from "fs";

async function go() {
  const url =
    "https://nachrichten.at/sport/fussball/unterhaus/2020_2021/1_klasse/1nw/kopfing";

  const table = await getTableContent(await getHtml(url));

  await writeTableFile(table);

  const matches = await getMatchesContent2();

  await writeMatchesFile(matches);

  console.log("scrape complete\n");

  await sleep(2000);

  process.exit()
}

go();
