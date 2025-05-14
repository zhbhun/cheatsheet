import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
import yaml from 'js-yaml';
import { FEATURES_KEYS } from './constants.ts';
import { Language, Reference, Feature } from './types.ts';
import { context, getLanguageData, loadFeature } from './utils.ts';
// import { loadReference } from './reference.ts';
import { getGenai } from './gemini.ts';

dotenv.config({
  path: path.resolve(context, '.env.local'),
});

const INSTRUCTION = `
你是一名精通多门编程语言的教育专家，非常擅长编写速查手册。请根据用户输入的语言特性，按下面的要求输出一份速查手册大纲。

- 生成规则:
  - **面面俱到**: 覆盖所有核心语法、API 用法及常见问题解决技巧，通常以「安装→创/构建→使用→配置→常见问题处理→最佳实践」逐步深入。
  - **实战优先**: 不涉及概念、定义或原理的说明，多示例演练。
  - **层级适度**: 相近主题合并，分类不能过细，不做无意义拆分。
  - **分类清晰**: 层级结构明确，方便用户快速定位，
- 执行步骤：
  1. 收集该特性的所有语法、API 的用法以及常见问题处理和最佳实践。
  2. 按从易到难排列用法，并按**生成规则**进行分类组织。
  3. 将分类结果转化为速查手册大纲。
  4. 检查是否符合"面面俱到", 补充遗漏的内容。
  5. 检查是否符合"实战优先", 删掉枯燥的概念、定义或原理的说明，增加示例演练。
  6. 检查是否符合"层级适度", 合并相近或太细的主题, 例如: for-in、forEach 合并为"数组遍历"，不要单独拆分了。
  7. 检查是否符合"分类清晰"，如果有不清晰的分类，重新组织它们。
- 输出格式：使用 YAML 格式输出
  \`\`\`yaml
  title: "标题"
  query: "检索关键词"
  comment: "一两句话的速查文档生成备注"
  outline:
    - title: "大纲标题"
      description: "关键语法或 API 列表，可选"
      children: 可选
        - title: "大纲标题"
          description: "关键语法或 API 列表，可选"
          children: 可选
  \`\`\`
- 参考示例： 示例：Kotlin flow
  \`\`\`yaml
  title: Flow
  query: Kotlin Flow
  comment: 详细介绍 Kotlin 中 Flow 的使用，涵盖基本概念、创建、操作符、热流、异常处理等。
  outline:
    - title: 构建
      description: "\`flow {}\`、\`flowOf()\`、\`asFlow()\`"
    - ...
  \`\`\`
`;

async function complete(
  query: string,
  references: Reference[],
  instruction: string
) {
  const response = await getGenai().models.generateContent({
    model: 'gemini-2.5-pro-exp-03-25',
    contents: [
      {
        role: 'user',
        parts: [
          ...references.map((ref) => ({
            text: `# [${ref.title}](${ref.url})\n\n${ref.content}`,
          })),
          {
            text: query,
          },
        ],
      },
    ],
    config: {
      systemInstruction: instruction,
    },
  });
  if (!response.text) {
    console.error('Error:', JSON.stringify(response, null, 2));
  }
  return response.text ?? '';
}

async function generateOutlineContent(
  language: Language,
  feature: Feature,
  references: Reference[]
): Promise<Feature> {
  const text = (
    await complete(
      `${language.title} ${feature.query || feature.title || ''}\n\nid: ${
        feature.id
      }\ntitle: ${feature.title}${
        feature.comment ? `\n\nps: ${feature.comment}` : ''
      }`,
      references,
      INSTRUCTION
    )
  )
    .replace(/^\s*```yaml(\n)?/g, '')
    .replace(/(\n)?```\s*$/g, '');
  let data: Partial<Feature> = {};
  try {
    data = yaml.load(text) as Pick<Feature, 'outline'>;
  } catch (error) {
    console.log('------\n', text, '\n------');
    console.log(error);
  }
  return {
    ...feature,
    outline: data.outline,
    references: feature.references?.map((ref) => ({
      title: ref.title,
      url: ref.url,
    })),
  };
}

async function generateOutlineByRecursion(language: Language, target: string) {
  const { filepath, feature } = await loadFeature(language, target);
  if (feature.children) {
    for (let index = 0; index < feature.children.length; index++) {
      const element = feature.children[index];
      await generateOutlineByRecursion(language, path.join(target, element));
    }
    return;
  } else if (feature.outline) {
    return;
  }
  console.log('>>', feature.id);
  // const references = await loadReference(language, feature);
  // feature.references = references.map((ref) => ({
  //   title: ref.title,
  //   url: ref.url,
  // }));
  const newFeature = await generateOutlineContent(language, feature, []);
  Object.assign(feature, newFeature);
  let content: string = '';
  try {
    content = yaml.dump(feature, {
      lineWidth: -1,
      sortKeys: (a, b) => (FEATURES_KEYS[a] ?? 999) - (FEATURES_KEYS[b] ?? 999),
    });
  } catch (error) {
    console.log(JSON.stringify(feature, null, 2));
    throw error;
  }
  await fs.promises.writeFile(filepath, content, 'utf-8');
}

/**
 *
 * @param language like typescript
 * @param feature like syntax/modules
 */
export async function generateOutline(language: string, feature: string) {
  await generateOutlineByRecursion(await getLanguageData(language), feature);
}
