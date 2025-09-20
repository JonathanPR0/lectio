import axios from "axios";
import * as cheerio from "cheerio";

interface DailyText {
  date: string;
  themeVerse: string;
  bibleVersicle: string;
  paragraphs: string[];
}

/**
 * Faz uma única requisição e extrai os dados para 3 dias (anterior, atual e próximo)
 */
async function scrapeMultipleDays(year: number, month: number, day: number): Promise<DailyText[]> {
  const url = `https://wol.jw.org/pt/wol/h/r5/lp-t/${year}/${month}/${day}`;

  // Opções de headers podem ajudar se o site tiver proteções simples
  const response = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; LectioScraper/1.0)",
      "Accept-Language": "pt-BR,pt;q=0.9",
    },
    timeout: 15000,
  });

  const html = response.data;
  const $ = cheerio.load(html);
  const results: DailyText[] = [];

  // Processa todos os tabContent disponíveis
  $("div.tabContent").each((index, element) => {
    const tabElement = $(element);

    // Extrair a data do atributo data-date (2025-09-17T00:00:00.000Z)
    const dataDateAttr = tabElement.attr("data-date");
    let tabDate = "";

    if (dataDateAttr) {
      // Converte de ISO para YYYY-MM-DD
      const dateObj = new Date(dataDateAttr);
      tabDate = dateObj.toISOString().split("T")[0]; // pega apenas YYYY-MM-DD
    } else {
      // Fallback para o header da tab se não tiver data-date
      const headerText = tabElement.find("header h2").text().trim();
      const dateMatch = headerText.match(/(\d+)\s+de\s+([a-zA-Z]+)/i);
      if (dateMatch) {
        // Processamento simplificado aqui (pode precisar de mais lógica dependendo do formato)
        tabDate = `${year}-${month}-${dateMatch[1]}`;
      }
    }

    // Capturar o versículo tema e referência bíblica
    const themeVerse = tabElement.find("p.themeScrp em").first().text().trim();
    const bibleVersicle = tabElement.find("p.themeScrp a").first().text().trim();

    // Capturar os parágrafos
    const paragraphs: string[] = [];
    tabElement.find("div.bodyTxt p").each((i, el) => {
      const txt = $(el).text().trim();
      if (txt) paragraphs.push(txt);
    });

    results.push({
      date: tabDate,
      themeVerse,
      bibleVersicle,
      paragraphs,
    });
  });

  return results;
}

// Se quiser rodar direto
async function main() {
  try {
    // Por exemplo: data de teste
    const year = 2025;
    const month = 9;
    const day = 18;

    // Economiza chamadas obtendo todos os dias de uma vez
    const allDays = await scrapeMultipleDays(year, month, day);
    console.log("Todos os dias disponíveis:", JSON.stringify(allDays, null, 2));
  } catch (error) {
    console.error("Erro no scraping:", error);
  }
}

if (require.main === module) {
  main();
}

export { DailyText, scrapeMultipleDays };
