const cheerio = require('cheerio');

// in Safari -> Webinformationen einblenden -> Elemente -> den gewünschten Inhalt identifizieren -> right click -> Kopieren -> Selektorenpfad
// Google Chrome DevTools (F12) -> select Element in Dev View -> right click ... on the left -> Copy -> Copy Selector
const cssPathMyth = "body > table > tbody > tr > td > table > tbody > tr > td > table > tbody > tr > td > table > tbody > tr:nth-child(145) > td:nth-child(2)";
const cssPathTief = "body > table > tbody > tr > td > table > tbody > tr > td > table > tbody > tr > td > table > tbody > tr:nth-child(106) > td:nth-child(2)";

const tempParse = function (url) {
  const fetchPromise = fetch(url);
  return fetchPromise.then(response => {
    return response.text();
  }).then(html => {
    const $ = cheerio.load(html);
    if (html.includes("Mythenquai")) {
      cssPath = cssPathMyth;
      //console.log("Myth css " + cssPath);
    } else {
      cssPath = cssPathTief;
      //console.log("Else css " + cssPath);
    }
    return $(cssPath).text().trim();
  });
};

module.exports = tempParse;
