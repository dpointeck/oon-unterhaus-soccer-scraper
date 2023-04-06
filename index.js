import {
  getHtml,
  getTableContent,
  writeTableFile,
  getMatchesContent,
  getMatchesContent2,
  writeMatchesFile,
  getScorer,
  sleep,
} from "./lib/scraper";
import fs from "fs";
import { URL } from "./lib/scraper";

async function go() {
  const table = await getTableContent(await getHtml(URL));

  await writeTableFile(table);

  const matches = await getMatchesContent2();

  await writeMatchesFile(matches);

  console.log("scrape complete\n");

  await sleep(2000);

  process.exit();
}

go();
