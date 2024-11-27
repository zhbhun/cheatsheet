import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import crypto from 'crypto';
import { Feature, LanguageData, Reference } from './types.ts';
import { context, isFileExit } from './utils.ts';
import { getGeminiFlash } from './gemini.ts';

async function searchByGoogle(
  query: string,
  ignores: string[] = []
): Promise<{ title: string; url: string }[]> {
  console.log('> query', query);
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--lang=en-US'],
  });
  const page = await browser.newPage();
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
    query
  )}`;

  await page.goto(searchUrl);

  const links = (
    await page.evaluate(() => {
      return Array.from(document.querySelectorAll('#search span > a'))
        .slice(0, 10)
        .map((anchor: any) => {
          return {
            title: anchor.querySelector('h3')?.textContent,
            url: anchor.href,
          };
        });
    })
  )
    .filter((item) => {
      if (
        item.url.indexOf('www.youtube.com') >= 0 ||
        item.url.indexOf('blog.csdn.net') >= 0
      ) {
        return false;
      }
      if (ignores.length > 0) {
        return !ignores.some(
          (ignore) =>
            item.url.indexOf(ignore) >= 0 || item.title?.indexOf(ignore) >= 0
        );
      }
      return true;
    })
    // .filter(
    //   (link) =>
    //     link.url.indexOf('juejin.cn') < 0 && link.url.indexOf('51cto.com') < 0
    // )
    .slice(0, 2);

  await browser.close();

  return links;
}

async function scrapePage(url: string) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--lang=en-US'],
  });
  const page = await browser.newPage();

  // 导航到指定的 URL
  await page.goto(
    `https://www.firecrawl.dev/playground?url=${encodeURIComponent(url)}`
  );

  // 等待 #radix-\:r3\:-content-markdown > div:first-child 元素出现
  await page.waitForSelector(
    'main [role="tabpanel"]:nth-child(2)',
    { timeout: 120_000 }
  );

  // 获取该元素的 innerText
  const innerText = await page.evaluate(() => {
    const element = document.querySelector(
      'main [role="tabpanel"]:nth-child(2)'
    );
    return element ? (element as HTMLElement).innerText : '';
  });

  await browser.close();

  return innerText;
}

export async function loadReference(
  language: LanguageData,
  feature: Feature
): Promise<Reference[]> {
  const references: Reference[] = [];
  let links: { title: string; url: string }[] = feature.references || [];
  if (links.length === 0) {
    for (let i = 0; i <= language.documents.length; i++) {
      const site = language.documents[i];
      links = await searchByGoogle(
        `${site ? `site:${site} ` : ''}${
          feature.query || `${language.title} ${feature.title}`
        }`,
        language.ignores
      );
    }
  }
  for (let j = 0; j < links.length; j++) {
    const link = links[j];
    if (references.some((reference) => reference.url === link.url)) {
      continue;
    }
    const id = crypto.createHash('sha256').update(link.url).digest('hex');
    console.log('>', 'scrape', id, '-', link.title, '-', link.url);
    const cachePath = path.resolve(context, 'cache', `${id}.json`);
    let content: string = '';
    let rate = -1;
    if (await isFileExit(cachePath)) {
      const cacheContent = await fs.promises.readFile(cachePath, 'utf-8');
      const cacheData: Reference = JSON.parse(cacheContent);
      content = cacheData.content;
      rate = cacheData.rate;
    }
    if (!content) {
      content = (await scrapePage(link.url)).trim();
    }
    if (!content) {
      continue;
    }
    const reference: Reference = {
      url: link.url,
      title: link.title,
      content,
      rate: rate,
    };
    await fs.promises.writeFile(
      cachePath,
      JSON.stringify(reference, null, 2),
      'utf-8'
    );
    references.push(reference);
  }
  if ((feature.references?.length ?? 0) === 0) {
    const result = await getGeminiFlash().generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${
                feature.query || feature.title
              }\n\`\`\`json${JSON.stringify(references.slice(0, 2))}\`\`\``,
            },
          ],
        },
      ],
      systemInstruction: `
  你是一名精通多种编程语言的专家，根据用户提供的语言特性和文档列表，分析计算每个文档作为入门教程或参考文献的评分，评分区间为 0 到 10，数值越大参考文档的评分越高。返回的结果是一个 JSON 对象，key 是文档 URL， value 是个数值，对应文档的评分。

  - Input：
    Android Xxx

    \`\`\`json
    [
      {
        "title": "Xxx",
        "url": "https://xxx",
        "content": "..."
      },
      {
        "title": "Yyy",
        "url": "https://yyy",
        "content": "..."
      },
      {
        "title": "Zzz",
        "url": "https://zzz",
        "content": "..."
      }
    ]
    \`\`\`
  - Output：只返回 JSON 代码，不要包含其他信息
    \`\`\`json
    {
      "https://xxx": 6,
      "https://yyy": 8,
      "https://zzz": 9
    }
    \`\`\`
  `,
    });
    const text = (await result.response.text())
      .replace(/.*```json/, '')
      .replace(/```.*/, '');
    const rates = JSON.parse(text);
    return references
      .map((item) => ({
        ...item,
        rate: rates[item.url] || 0,
      }))
      .filter((item) => item.rate >= 6)
      .sort((a, b) => b.rate - a.rate);
  }
  return references;
}
