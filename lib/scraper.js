import axios from "axios";
import cheerio from "cheerio";
import fs from "fs";
import puppeteer from "puppeteer";

export const URL =
  "https://www.nachrichten.at/sport/fussball/unterhaus/2023_2024/1_klasse/1nw/";
async function getHtml(url) {
  const { data: html } = await axios.get(url);

  return html;
}

async function getTableContent(html) {
  const $ = await cheerio.load(html);

  const tableHTML = $("#unterhaus_tabelle").find(
    ".container__row"
  );

  let table = [];

  tableHTML.each(function (i) {
    table[i] = {
      position: null,
      name: null,
      matchCount: null,
      guv: null,
      goals: null,
      score: null,
    };

    $(this).children().each(function (j) {
      switch (j) {
        case 0:
          table[i].position = $(this).text();
          break;
        case 1:
          table[i].name = $(this).text();
          break;
        case 2:
          table[i].matchCount = $(this).text();
          break;
        case 3:
          table[i].guv = $(this).text();
          break;
        case 4:
          table[i].goals = $(this).text();
          break;
        case 5:
          table[i].score = $(this).text();
          break;
        default:
          break;
      }
    });
  });

  console.log("got table\n");
  return table;
}

async function writeTableFile(table) {
  try {
    const dir = "./tmp";
    let path = `${dir}/table`;

    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir);
      } catch (error) {
        console.error(error);
      }
    }

    if (!fs.existsSync(path)) {
      try {
        fs.mkdirSync(path);
      } catch (error) {
        console.error(error);
      }
    }

    var stream = fs.createWriteStream(`${path}/table.txt`);
    stream.once("open", function (fd) {
      stream.write("title: Table");
      stream.write("\n\n");
      stream.write("----");
      stream.write("\n\n");
      stream.write("rows:\n");
      table.forEach((row) => {
        stream.write("-\n");
        stream.write(`  position: ${row.position}\n`);
        stream.write(`  name: ${row.name}\n`);
        stream.write(`  matchcount: ${row.matchCount}\n`);
        stream.write(`  guv: ${row.guv}\n`);
        stream.write(`  goals: ${row.goals}\n`);
        stream.write(`  score: ${row.score}\n`);
      });

      stream.end();
    });
  } catch (err) {
    console.log(err);
  }

  console.log("table file written\n");
}


// ----------------- Matches -----------------
async function writeMatchesFile(matches) {
  const dir = "./tmp";
  let path = `${dir}/matches`;
  
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir);
    } catch (error) {
      console.error(error);
    }
  }

  if (!fs.existsSync(path)) {
    try {
      fs.mkdirSync(path);
    } catch (error) {
      console.error(error);
    }
  }

  var stream = await fs.createWriteStream(`${path}/matches.txt`);
  stream.once("open", function (fd) {
    stream.write("title: Matches");
    stream.write("\n\n");
    stream.write("----");
    stream.write("\n\n");
    stream.write("matches:\n");
    matches.forEach((row, i) => {
      stream.write("-\n");
      stream.write(`  home: ${row.home}\n`);
      stream.write(`  guest: ${row.guest}\n`);
      stream.write(`  score: ${row.infos.score}\n`);
      stream.write(`  date: ${row.infos.date}\n`);
      stream.write(`  location: ${row.infos.location}\n`);
      stream.write(`  scorer: ${row.infos.scorer}\n`);
    });
    stream.end();
  });

  console.log("matches file written\n");
}

async function getMatchesContent(html) {
  const $ = await cheerio.load(html);

  const results = $("#unterhaus_spiele").find(".container__row");

  const matches = [];

  results.each(function (i, el) {
    const home = $(this).find(".container__col--4.m-0.supplement.text-white").first().text().trim();
    const guest = $(this).find(".container__col--4.m-0.supplement.text-end.text-white").text().trim();
    let centerCol = $(this).find(".container__col--4.m-0").children();
    const rawScorer = $(this).find(".supplement.supplement--small.text-center.text-lightgrey.mt-8.w-100").text().trim();
    const scorerWithoutTabs = rawScorer.replace(/\n|\t/g, "").trim();
    const scorer = scorerWithoutTabs.replace(/[\s\S]*?(Torschützen)/, "$1");
    const infos = {
      date: centerCol.first().text().trim(),
      score: centerCol.first().next().text().trim(),
      location: centerCol.first().next().next().text().trim(),
      scorer: scorer,
    };

    matches[i] = {
      home,
      guest,
      infos,
      guest,
    };
  });

  console.log("got matches\n");

  return matches;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export {
  sleep,
  getHtml,
  getTableContent,
  getMatchesContent,
  writeTableFile,
  writeMatchesFile,
};
