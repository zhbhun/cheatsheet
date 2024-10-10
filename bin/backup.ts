import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
import yaml from 'js-yaml';
import { GoogleGenerativeAI } from '@google/generative-ai';
import puppeteer from 'puppeteer';
import crypto from 'crypto';
import { LanguageData, Reference, Feature } from './types.ts';

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
    return (
      Array.from(document.querySelectorAll('#search span > a'))
        .slice(0, 10)
        .map((anchor: any) => {
          return {
            title: anchor.querySelector('h3')?.textContent,
            url: anchor.href,
          };
        })
        // .filter(
        //   (link) =>
        //     link.url.indexOf('juejin.cn') < 0 && link.url.indexOf('51cto.com') < 0
        // )
        .slice(0, 3)
    );
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

- Workflow
  1. 阅读参考文档，结合自己的知识了解该语言特性的用法。
  2. 总结该语言特性是什么，在什么场景用，使用什么来实现，作为特性的描述信息。
  3. 先梳理该语言特性额所有语法、属性或方法，然后结合实际总结出该语言特性的所有用法列表，例如：
    - Kotlin 数组：创建、访问、修改、遍历、转换、过滤、排序和查找等操作。
    - Kotlin 按钮：创建按钮、设置文本、设置样式、绑定事件、启用和禁用等
  4. 针对上一步的每个用法生成标题、说明和示例，要求符合以下规则：
    - 示例代码中的注释必须清晰明了，解释关键代码的作用和效果
    - 如果在示例外该属性值有更多不同的用法，必须使用注释说明不同用法的区别
    - 下面是一些参考示例：
      - Kotlin 按钮创建：
        tile: 创建按钮
        content: 创建按钮的方法有两种，一种是使用 XML 布局文件，另一种是使用 Kotlin 代码。XML 布局文件中使用 <Button> 标签，Kotlin 代码中使用 Button() 构造函数。
        example: |
          \`\`\`xml
          <!-- 在 XML 布局文件中创建按钮 -->
          <Button
            android:id="@+id/myButton"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="Click Me"
            android:background="@color/buttonColor" <!-- 设置背景颜色 -->
            android:textColor="@android:color/white" <!-- 设置文本颜色 -->
            android:enabled="true"/> <!-- 启用按钮 -->
          \`\`\`

          \`\`\`kotlin
          // 在 Kotlin 中动态创建按钮
          val myButton = Button(this).apply {
              text = "Click Me"
              setBackgroundColor(ContextCompat.getColor(context, R.color.buttonColor)) // 设置背景颜色
              setTextColor(Color.WHITE) // 设置文本颜色
              isEnabled = true // 启用按钮
          }
          \`\`\`
      - Kotlin TextView 对齐方式：
        title: 对齐方式
        content: gravity 属性用于设置文本在视图中的对齐方式，可选值有 left、right、top、bottom、start、end、center_horizontal、center_vertical、fill 和 center。
        example: |
          \`\`\`xml
          <TextView
              android:layout_width="match_parent"
              android:layout_height="wrap_content"
              android:gravity="center" <!-- 文本在视图中的居中对齐 -->
              android:text="居中对齐的文本"/>
          <!-- gravity 属性的其他可选值：
              - left: 左对齐
              - right: 右对齐
              - top: 顶部对齐
              - bottom: 底部对齐
              - start: 从左到右时左对齐，从右到左时右对齐
              - end: 从左到右时右对齐，从右到左时左对齐
              - center_horizontal: 水平居中
              - center_vertical: 垂直居中
              - fill: 填充整个 TextView
              - center: 水平和垂直都居中
          -->
          \`\`\`
  5. 根据参考文档生成最多 6 个关联度高的文档作为返回结果的 references 字段。
  6. 汇总以上信息按输出要求返回 YAML 格式的文本
- Ouput：YAML 格式的文本
  id: 语言特性的 ID
  title: 语言特性的标题
  query: 参考文档查找关键词
  comment: 备注
  description: 语言特性的描述信息，不支持该特性可以简单解释下（也可以通过其他方式来代替实现）
  usage:
    - title: 用法标题
      content: 用法说明
      example: 示例代码（Markdown）
  references:
    - title: 参考文档的标题
      url: 参考文档的 URL
- Example: 参考示例
  - Input:
    Kotlin 循环语句
    id: loop
    title: 循环
    query: Kotlin 循环语句
    comment: 尽可能的介绍不同的循环语句的用法和使用场景
  - Output：YAML 格式的文本
    id: loop
    title: 循环
    query: 循环语句
    comment: 尽可能的介绍不同的循环语句的用法和使用场景
    description: "Kotlin 支持 \`for\` 循环、\`while\` 循环和 \`do-while\` 循环三种基本循环结构。\`for\` 循环通常用于遍历集合或区间，而 \`while\` 和 \`do-while\` 循环则根据给定的布尔条件反复执行代码块。"
    usage:
      - title: 创建
        content: listOf()，mutableListOf()，arrayOf()，arrayOfNulls()，emptyArray()。
        example: |
          \`\`\`kotlin
          // 创建不可变和可变列表
          val immutableList = listOf("apple", "banana", "cherry") // 不可变列表
          val mutableList = mutableListOf("apple", "banana") // 可变列表

          // 创建空数组
          val emptyArray = emptyArray<String>() // 创建一个空字符串数组
          val nullArray = arrayOfNulls<String>(3) // 创建一个包含三个空元素的数组
          \`\`\`
      - title: 访问
        content: get()，first()，last()，getOrNull()，firstOrNull()。
        example: |
          \`\`\`kotlin
          val immutableList = listOf("apple", "banana", "cherry")
          val firstFruit = immutableList.first() // "apple"
          val lastFruit = immutableList.last() // "cherry"
          val safeElement = immutableList.getOrNull(5) // null (安全访问)
          \`\`\`
      - title: 修改
        content: add()，remove()，set()，clear()（使用 MutableList）。
        example: |
          \`\`\`kotlin
          val immutableList = listOf("apple", "banana", "cherry")
          mutableList.add("cherry") // 添加元素
          mutableList[0] = "orange" // 修改第一个元素
          mutableList.remove("banana") // 删除元素
          mutableList.clear() // 清空列表
          \`\`\`
      - title: 遍历
        content: forEach()，forEachIndexed()，for 循环。
        example: |
          \`\`\`kotlin
          immutableList.forEach { fruit ->
              println("I like $fruit") // 使用 forEach 遍历
          }

          // 使用 forEachIndexed 获取索引
          immutableList.forEachIndexed { index, fruit ->
              println("Fruit at index $index is $fruit") // 打印索引和元素
          }
          \`\`\`
      - title: 转换
        content: map()，mapIndexed()，flatMap()，groupBy()。
        example: |
          \`\`\`kotlin
          val numbers = listOf(1, 2, 3, 4, 5)

          // 转换
          val doubled = numbers.map { it * 2 } // 结果为 [2, 4, 6, 8, 10]
          val grouped = numbers.groupBy { it % 2 } // 根据奇偶分组
          \`\`\`
      - title: 过滤
        content: filter()，filterNot()，filterIndexed()，filterNotNull()。
        example: |
          \`\`\`kotlin
          val numbers = listOf(1, 2, 3, 4, 5)

          // 过滤
          val evenNumbers = numbers.filter { it % 2 == 0 } // 结果为 [2, 4]
          val nonNulls = listOf(1, null, 3).filterNotNull() // 结果为 [1, 3]
          \`\`\`
      - title: 排序
        content: sorted()，sortedDescending()，sortedBy()，sortedByDescending()。
        example: |
          \`\`\`kotlin
          val fruits = listOf("banana", "apple", "cherry")

          // 排序
          val sortedFruits = fruits.sorted() // 按字母顺序排序，结果为 ["apple", "banana", "cherry"]
          val reversedFruits = fruits.sortedDescending() // 反向排序，结果为 ["cherry", "banana", "apple"]
          \`\`\`
      - title: 查找
        content: find()，findLast()，first()，last()，indexOf()，lastIndexOf()。
        example: |
          \`\`\`kotlin
          val fruits = listOf("banana", "apple", "cherry")

          // 查找元素
          val foundFruit = fruits.find { it.startsWith("b") } // "banana"
          val fruitIndex = fruits.indexOf("cherry") // 2
          val lastIndex = fruits.lastIndexOf("banana") // 0
          \`\`\`
    references:
      - title: "Conditions and loops"
        url: https://kotlinlang.org/docs/control-flow.html
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
