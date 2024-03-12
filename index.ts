#!/usr/bin/env node

import { Option, program } from 'commander';
import fs from "fs";
import path from "path";
import puppeteer from 'puppeteer';


type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

const paperSizes = ['letter', 'legal', 'tabloid', 'ledger', 'a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6'] as const;
type PaperSize = ArrayElement<typeof paperSizes>

async function printPdf(file_or_url: string, paperSize: PaperSize) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(file_or_url, { waitUntil: 'networkidle0' });
  const pdf = await page.pdf({ format: paperSize });

  await browser.close();
  return pdf
}

function isValidHttpUrl(file_or_url: string) {
  let url;

  try {
    url = new URL(file_or_url);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

function fileUrl(file_or_url: string) {
  if (isValidHttpUrl(file_or_url))
    return file_or_url
  else {
    if (fs.existsSync(file_or_url))
      return "file://" + path.resolve(file_or_url)
    else {
      process.stderr.write(`File "${file_or_url} does not exist.\n"`)
      process.exit(1)
    }
  }
}

async function main() {
  program
    .description('Converts HTML to PDF using headless Chrome')
    .name("html-to-pdf")
    .addOption(new Option('-f,  --file <file>', "file or url to HTML file").makeOptionMandatory())
    .addOption(new Option('-o,  --output <output>', "output PDF file").makeOptionMandatory())
    .addOption(new Option('-p, --paper-size <paper-size>', "paper size",).default("letter").choices(paperSizes))

  program.parse();

  const options = program.opts();
  const uri = fileUrl(options["file"])
  const pdf = await printPdf(fileUrl(options["file"]), options["paperSize"])
  fs.writeFileSync(options["output"], pdf)

}


await main()
