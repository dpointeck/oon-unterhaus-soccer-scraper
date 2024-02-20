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

  const tableHTML = $("#unterhaus_tabelle .unterhaus-table_box").find(
    ".unterhaus-text3"
  );

  let table = [];

  tableHTML.each(function (i, e) {
    table[i] = {
      position: null,
      name: null,
      matchCount: null,
      guv: null,
      goals: null,
      score: null,
    };
    $(this)
      .children()
      .each(function (j, f) {
        switch (j) {
          case 0:
            table[i].position = $(this).text();
          case 1:
            table[i].name = $(this).text();
          case 2:
            table[i].matchCount = $(this).text();
          case 3:
            table[i].guv = $(this).text();
          case 4:
            table[i].goals = $(this).text();
          case 5:
            table[i].score = $(this).text();
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

async function writeMatchesFile(matches) {
  const dir = "./tmp";
  let path = `${dir}/matches`;
  const scorer = await getScorer();

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

const getScorer = async () => {
  const browser = await puppeteer.launch({
    slowMo: 250, // slow down by 250ms
    headless: true
  });
  const page = await browser.newPage();

  await page.goto(URL, {
    timeout: 180000
  });
  const scorer = await page.evaluate(() =>
    Array.from(
      document.querySelectorAll(
        "div#unterhaus_spiele div.unterhaus-table_box div.container__row.unterhaus-table_row1 > div.unterhaus-text4"
      )
    ).map((item) => item.innerText.trim())
  );
  await browser.close();

  return scorer;
};

const getMatchesContent2 = async (url) => {
  const browser = await puppeteer.launch({
    slowMo: 250, // slow down by 250ms
    timeout: 45000,
    headless: true
  });
  const page = await browser.newPage();
 
  await page.goto(url, {
    timeout: 180000
  });

  const results = await page.evaluate(() =>
    Array.from(
      document.querySelectorAll(
        "#unterhaus_spiele .unterhaus-table_box .container__row.unterhaus-table_row1"
      )
    ).map((match) => {
      return {
        home: match.querySelector(".unterhaus-left").innerText.trim(),
        guest: match.querySelector(".unterhaus-right").innerText.trim(),
        infos: {
          date: match
            .querySelector(".unterhaus-center > .unterhaus-text4")
            .innerText.trim(),
          score: match
            .querySelector(".unterhaus-center > .unterhaus-text1")
            .innerText.trim(),
          location: match
            .querySelectorAll(".unterhaus-center .unterhaus-text4")[1]
            .innerText.trim(),
          scorer: match.children[3] ? match.children[3].innerText.trim() : "",
        },
      };
    }),
    {
      timeout: 180000
    }
  );

  console.log("got matches\n");

  return results;
};

async function getMatchesContent(html) {
  const $ = await cheerio.load(html);

  const results = $("#unterhaus_spiele .unterhaus-table_box").find(
    ".container__row.unterhaus-table_row1"
  );

  const matches = [];

  results.each(function (i, el) {
    const home = $(this).find(".unterhaus-left").text().trim();

    let centerCol = $(this).find(".unterhaus-center").children();

    const infos = {
      date: centerCol.first().text(),
      score: centerCol.first().next().text().trim(),
      location: centerCol.first().next().next().text().trim(),
    };

    const guest = $(this).find(".unterhaus-right").text().trim();

    matches[i] = {
      home,
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
  getMatchesContent2,
  writeTableFile,
  writeMatchesFile,
  getScorer,
};
