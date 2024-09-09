import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
import yaml from 'js-yaml';
import { GoogleGenerativeAI } from '@google/generative-ai';
import puppeteer from 'puppeteer';
import crypto from 'crypto';

interface LanguageData {
  id: string;
  title: string;
  documents: string[];
}

interface Reference {
  title: string;
  url: string;
  content: string;
}

interface Feature {
  id: string;
  title: string;
  query?: string;
  comment?: string;
  description?: string;
  children?: string[];
}

const context = path.resolve(import.meta.dirname, '..');
const dataContext = path.resolve(context, 'src/language');

dotenv.config({
  path: path.resolve(context, '.env.local'),
});

const geminiFlash = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY as string
).getGenerativeModel({
  model: 'models/gemini-1.5-flash-latest',
});

const geminiPro = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY as string
).getGenerativeModel({
  model: 'models/gemini-1.5-pro-latest',
});

async function isFileExit(filePath: string) {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function loadYAML(file: string): Promise<any> {
  const featureContent = await fs.promises.readFile(file, 'utf-8');
  const featureData: Feature = yaml.load(featureContent) as any;
  return featureData;
}

async function getLanguageData(language: string): Promise<LanguageData> {
  const content = await fs.promises.readFile(
    path.resolve(import.meta.dirname, `../data/${language}/index.yaml`),
    'utf-8'
  );
  return yaml.load(content) as any;
}

async function searchByGoogle(
  query: string
): Promise<Pick<Reference, 'title' | 'url'>[]> {
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

  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('#search span > a'))
      .slice(0, 10)
      .map((anchor: any) => {
        return {
          title: anchor.querySelector('h3')?.textContent,
          url: anchor.href,
        };
      })
      .filter(
        (link) =>
          link.url.indexOf('juejin.cn') < 0 && link.url.indexOf('51cto.com') < 0
      )
      .slice(0, 3);
  });

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
    '#radix-\\:r3\\:-content-markdown > div:first-child',
    { timeout: 60_000 }
  );

  // 获取该元素的 innerText
  const innerText = await page.evaluate(() => {
    const element = document.querySelector(
      '#radix-\\:r3\\:-content-markdown > div:first-child'
    );
    return element ? (element as HTMLElement).innerText : '';
  });

  await browser.close();

  return innerText;
}

async function generateContent(
  language: LanguageData,
  feature: Feature,
  references: Reference[]
): Promise<string> {
  const result = await geminiPro.generateContent({
    contents: [
      {
        role: 'user',
        parts: [
          ...references.map((ref) => ({
            text: `# [${ref.title}](${ref.url})\n\n${ref.content}`,
          })),
          {
            text: `${language.title} ${feature.query || feature.title}\n\nid: ${
              feature.id
            }\ntitle: ${feature.title}${
              feature.comment ? `\n\nps: ${feature.comment}` : ''
            }`,
          },
        ],
      },
    ],
    systemInstruction: `
你是一名精通多种语言的编程专家，根据参考文档和语言特性按下面的要求生成用法介绍。

- Ouput
  id: 语言特性的 ID
  title: 语言特性的标题
  description: 语言特性的描述信息，不支持该特性可以简单解释下（也可以通过其他方式来代替实现）
  example:
    - title: 示例代码的标题
      content: 示例代码的 markdown 内容
  references:
    - title: 参考文档的标题
      url: 参考文档的 URL
- Workflow
  1. 阅读参考文档，结合自己的知识了解该语言特性的用法。
  2. 总结该语言特性是什么，在什么场景用，使用什么来实现，作为特性的描述信息。
  3. 尽可能详细地总结排列出该语言特性的用法，例如：数组需要演示常见的创建、查询、遍历、修改和删除等操作。
  4. 针对总结出来的每个用法提供一个示例代码，并通过注释说明要点。
  4. 根据参考文档生成最多 6 个关联度高的文档作为返回结果的 references 字段。
  5. 汇总以上信息按输出要求返回 yaml 格式的文本
- Example
  - Input:
    \`\`\`
    Kotlin 循环语句
    id: loop
    title: 循环
    \`\`\`
  - Output:
    \`\`\`yaml
    id: loop
    title: 循环
    description: "Kotlin 支持 \`for\` 循环、\`while\` 循环和 \`do-while\` 循环三种基本循环结构。\`for\` 循环通常用于遍历集合或区间，而 \`while\` 和 \`do-while\` 循环则根据给定的布尔条件反复执行代码块。"
    example:
      - title: "for 循环遍历集合"
        content: |
          \`\`\`kotlin
          val items = listOf("apple", "banana", "kiwifruit")
          for (item in items) {
              println(item) // 输出集合中的每个元素
          }
          \`\`\`
      - title: "使用索引遍历集合"
        content: |
          \`\`\`kotlin
          for (index in items.indices) {
              println("Item at $index is \${items[index]}") // 按索引输出集合中的元素
          }
          \`\`\`
      - title: "遍历特定范围"
        content: |
          \`\`\`kotlin
          for (index in 0 until 100) {
              println(index) // 输出 0 到 99 的所有数字
          }
      - title: "遍历特定范围并设置步长"
        content: |
          \`\`\`kotlin
          for (index in 0 until 100 step 2) {
              println(index) // 输出 0, 2, 4, ..., 98
          }
          \`\`\`
      - title: "逆序遍历"
        content: |
          \`\`\`kotlin
          for (index in 100 downTo 1) {
              println(index) // 输出 100 到 1 的所有数字
          }
          \`\`\`
      - title: "遍历区间 (range) 的简单写法"
        content: |
          \`\`\`kotlin
          for (index in 1..5) {
              println(index) // 输出 1, 2, 3, 4, 5
          }
          \`\`\`
      - title: "while 循环"
        content: |
          \`\`\`kotlin
          var index = 0
          while (index < items.size) {
              println("Item at $index is \${items[index]}") // 按索引输出集合中的元素
              index++
          }
          \`\`\`
      - title: "do-while 循环"
        content: |
          \`\`\`kotlin
          var count = 3
          do {
              println("Countdown: $count")
              count--
          } while (count > 0) // 直到 count 不大于 0，循环结束
          \`\`\`
    references:
      - title: "Conditions and loops"
        url: https://kotlinlang.org/docs/control-flow.html
    \`\`\`
`,
  });

  let text = await result.response.text();
  text = text.replace(/^```yaml(\n)?/g, '').replace(/(\n)?```$/g, '');
  if (feature.query) {
    text = text.replace(
      'description: ',
      `query: ${feature.query}\ndescription: `
    );
  }
  if (feature.comment) {
    text = text.replace(
      'description: ',
      `comment: ${feature.comment}\ndescription: `
    );
  }
  return text;
}

async function loadFeature(
  language: LanguageData,
  feature: string
): Promise<{
  filepath: string;
  feature: Feature;
}> {
  const currentPath = path.resolve(dataContext, language.id, feature);
  if (
    (await isFileExit(currentPath)) &&
    !(await fs.promises.stat(currentPath).then((stat) => stat.isDirectory()))
  ) {
    return {
      filepath: currentPath,
      feature: await loadYAML(currentPath),
    };
  }
  const currentFilePath = `${currentPath}.yaml`;
  if (await isFileExit(currentFilePath)) {
    return {
      filepath: currentFilePath,
      feature: await loadYAML(currentFilePath),
    };
  }
  const currentDirectoryPath = `${currentPath}/index.yaml`;
  if (await isFileExit(currentDirectoryPath)) {
    return {
      filepath: currentDirectoryPath,
      feature: await loadYAML(currentDirectoryPath),
    };
  }
  throw new Error(`Feature ${feature} not found`);
}

async function generateFeature(language: LanguageData, target: string) {
  const { filepath, feature } = await loadFeature(language, target);
  if (feature.children) {
    for (let index = 0; index < feature.children.length; index++) {
      const element = feature.children[index];
      await generateFeature(language, path.join(target, element));
    }
    return;
  } else if (feature.description) {
    return;
  }
  const { documents: sites } = language;
  const references: (Reference & {
    relevancy: number;
  })[] = [];
  console.log('#', feature.id, '-', feature.title, '-', feature.query);
  for (let i = 0; i <= sites.length; i++) {
    const site = sites[i];
    const links = await searchByGoogle(
      `${site ? `site:${site}` : language.title} ${
        feature.query || feature.title
      }`
    );
    for (let j = 0; j < links.length; j++) {
      const link = links[j];
      if (references.some((reference) => reference.url === link.url)) {
        continue;
      }
      const id = crypto.createHash('sha256').update(link.url).digest('hex');
      console.log('>', 'link', id, '-', link.title, '-', link.url);
      const cachePath = path.resolve(context, 'cache', `${id}.json`);
      let content: string = '';
      if (await isFileExit(cachePath)) {
        const cacheContent = await fs.promises.readFile(cachePath, 'utf-8');
        const cacheData: Reference = JSON.parse(cacheContent);
        content = cacheData.content;
      }
      if (!content) {
        content = (await scrapePage(link.url)).trim();
      }
      if (!content) {
        continue;
      }
      const reference: Reference = {
        title: link.title,
        url: link.url,
        content,
      };
      await fs.promises.writeFile(
        cachePath,
        JSON.stringify(reference, null, 2),
        'utf-8'
      );
      const relevancyResult = await geminiFlash.generateContent({
        contents: [
          {
            role: 'model',
            parts: [
              {
                text: `参考文档：\n${content}`,
              },
            ],
          },
          {
            role: 'user',
            parts: [
              {
                text: `语言特性：${feature.query || feature.title}`,
              },
            ],
          },
        ],
        systemInstruction:
          '你是一名精通多种语言的编程专家，根据文档和语言特性，分析计算参考文档与语言特性的关联度，关联度区间为 0 到 10，数值越大关联度越高，为 0 表示没有关联。ps：只能返回一个数字，不能包含其他信息。',
      });
      const relevancyTxt = await relevancyResult.response.text();
      console.log('  ', 'relevancy =', relevancyTxt);
      const relevancy = Number(relevancyTxt);
      if (relevancy >= 1) {
        references.push({ ...reference, relevancy: relevancy });
      }
    }
  }
  const result = await generateContent(
    language,
    feature,
    references.sort((a, b) => b.relevancy - a.relevancy)
  );
  await fs.promises.writeFile(filepath, result, 'utf-8');
}

async function main(language: string, feature: string) {
  await generateFeature(await getLanguageData(language), feature);
}

main('typescript', 'syntax/modules').catch(console.error);
