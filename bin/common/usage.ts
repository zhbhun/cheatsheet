import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
import yaml from 'js-yaml';
import { LanguageData, Reference, Feature } from './types.ts';
import { context, getLanguageData, loadFeature } from './utils.ts';
// import { loadReference } from './reference.ts';
import { getGenai } from './gemini.ts';

dotenv.config({
  path: path.resolve(context, '.env.local'),
});

const keys: Record<any, number> = {
  id: 0,
  title: 1,
  query: 2,
  comment: 3,
  description: 4,
  outline: 5,
  usage: 6,
  references: 7,
};

const defaultInstruction = `
你是一名精通多种语言的编程专家，非常擅长编写入门教程。请根据用户输入的文档和编程语言特性梳理输出一份循序渐进的速查手册。

- 工作流：
  1. 总结该语言特性是什么，在什么场景用，使用什么来实现，作为特性的描述信息。
  2. 总结该语言特性的大纲，要求：
    - 实战优先，避免枯燥的定义和原理讲解，通常是从构建到使用，再进阶到配置等。
    - 面面俱到，尽量包含相关特性的大部分语法、API和常见问题的解决。
    - 分类清晰，使得用户能够根据大纲立刻找到相应部分的文档。
  3. 根据大纲，生成速查手册文档，要求：
    - 针对每个用法，生成一个标题，这个标题应该简洁明了，能够准确描述该用法的功能。
    - 针对每个用法，生成一个描述信息，描述信息中包含该用法的概括介绍。如果涉及的关键语法、属性或方法**存在较多且容易混淆**时，需要依次罗列介绍，例如：
      - 语法：如果存在多种语法或使用场景且容易混淆的，需要分别描述
      - 属性：如果对应的值有不同的设置方式或使用场景，需要分别描述。
      - 方法：如果每个方法都有不同的调用方式或使用场景，需要分别描述。
    - 针对每个用法，生成一个示例代码，示例代码应该简洁明了，能够准确演示该用法的功能。
      - 必须遵循事实，不得虚构
      - 示例必须是独立的，包含相应的上下文信息
      - 必须注释说明用法产生的效果
      - 必须注释说明关键语法、属性和方法的用法
- 输出：YAML
  \`\`\`yaml
  title: "编程语言特性"
  description: "该编程语言特性是什么，在什么场景用，使用什么来实现。"
  outlint:
    - 用法1。。。
      - 用法1a。。。
      - 用法1b。。。
    - 用法2。。。
    - 用法3。。。
  usage:
    - title: "用法标题"
      description: 用法描述，采用 Markdown 格式
      example: 代码示例，采用 Markdown 格式
  \`\`\`
- 示例
  - Kotlin 数组
    \`\`\`yaml
    title: "数组"
    description: "Kotlin 中的 \`Array\` 和 \`List\` 都用于存储有序元素，但它们有明显的区别。\`Array\` 是固定大小的，初始化后不能调整长度，且每个元素都可以被修改（mutable）。\`List\` 是接口，分为只读的 \`listOf()\` 和可变的 \`mutableListOf()\`。与数组不同，\`List\` 可以动态增加或减少元素。"
    usage:
      - title: "创建数组"
        description: "Kotlin 提供了多种形式的数组：Array、List 和 MutableList。"
        children: |
          - title: Array
            description: "固定大小的数组，可以读写元素。"
            example: |
              \`\`\`kotlin
              // 使用 Array 类创建数组
              val squares = Array(5) { it * it } // [0, 1, 4, 9, 16]

              // 使用 arrayOf() 函数创建数组
              val array = arrayOf(1, 2, 3, 4, 5)

              // 空数组
              val emptyArray = emptyArray<String>()

              // 空元素数组
              val nullArray = arrayOfNulls<String>(3) // 创建一个包含三个空元素的数组

              // 基本类型数组
              val intArray = IntArray(5) { it * 2 } // [0, 2, 4, 6, 8]
              // DoubleArray、FloatArray、BooleanArray

              // Array 与 List 的互转
              val array = arrayOf(1, 2, 3)
              val arrayList = array.toList()
              val listArray = arrayList.toTypedArray()
              \`\`\`
          - title: List
            description: "不可变列表，不能添加、修改或删除元素。"
            example: 略
          - title: MutableList
            description: "可变列表，可以添加、修改或删除元素。"
            example: 略
      - title: "访问元素"
        description: "可以通过索引来访问数组元素，索引从 0 开始。也可以使用 get() 方法来访问。对于可变和不可变列表，访问方式相同。超出索引范围会抛出 ArrayIndexOutOfBoundsException 异常。"
        example: 略
      - ...
    \`\`\`
`;

const instructionWihoutOutline = `
你是一名精通多种语言的编程专家，非常擅长编写入门教程。请根据用户输入的文档和编程语言特性梳理输出一份循序渐进的速查手册。

- 工作流：
  1. 总结该语言特性是什么，在什么场景用，使用什么来实现，作为特性的描述信息。
  2. 根据用户提供的大纲，生成速查手册文档，要求：
    - 针对每个用法，生成一个标题，这个标题应该简洁明了，能够准确描述该用法的功能。
    - 针对每个用法，生成一个描述信息，描述信息中包含该用法的概括介绍。如果涉及的关键语法、属性或方法**存在较多且容易混淆**时，需要依次罗列介绍，例如：
      - 语法：如果存在多种语法或使用场景且容易混淆的，需要分别描述
      - 属性：如果对应的值有不同的设置方式或使用场景，需要分别描述。
      - 方法：如果每个方法都有不同的调用方式或使用场景，需要分别描述。
    - 针对每个用法，生成一个示例代码，示例代码应该简洁明了，能够准确演示该用法的功能。
      - 必须遵循事实，不得虚构
      - 示例必须是独立的，包含相应的上下文信息
      - 必须注释说明用法产生的效果
      - 必须注释说明关键语法、属性和方法的用法
- 输出：YAML
  \`\`\`yaml
  title: "编程语言特性"
  description: "该编程语言特性是什么，在什么场景用，使用什么来实现。"
  outline:
    - title: 用法1。。。
      children:
        - title: 用法1a。。。
        - title: 用法1b。。。
    - title: 用法2。。。
    - title: 用法3。。。
  usage:
    - title: "用法1"
      description: 用法描述，采用 Markdown 格式
      children:
        - title: 用法1a
          description: "..."
          example: "..."
        - title: 用法1b
          description: "..."
          example: "..."
    - title: "用法2"
      description: "..."
      example: "..."
    - title: "用法3"
      description: "..."
      example: "..."
  \`\`\`
- 示例
  - Kotlin 数组
    \`\`\`yaml
    title: "数组"
    description: "Kotlin 中的 \`Array\` 和 \`List\` 都用于存储有序元素，但它们有明显的区别。\`Array\` 是固定大小的，初始化后不能调整长度，且每个元素都可以被修改（mutable）。\`List\` 是接口，分为只读的 \`listOf()\` 和可变的 \`mutableListOf()\`。与数组不同，\`List\` 可以动态增加或减少元素。"
    outline:
      - title: 数组创建
        - title: Array
        - title: List
        - title: MutableList
      - title: 访问元素
      - title: 查找元素
        description: findd、firstOrNulld 、indexOfd 和 lastIndexOfd
      - title: 修改元素
      - title: 删除元素
      - title: 数组遍历
      - title: 数组转换
        children:
          - title: map
          - title: flatMap
          - title: reduce
      - title: 数组截取
        description: subList、drop & take
      - title: 数组匹配
        children:
          - title: any
          - title: all
      - title: 数组过滤
        description: filterd、filterIndexedd
      - title: 数组排序
        description: sortedd、sortedBy、sortedDescending 和 sortedByDescending
    usage:
      - title: "创建数组"
        description: "Kotlin 提供了多种形式的数组：Array、List 和 MutableList。"
        children: |
          - title: Array
            description: "固定大小的数组，可以读写元素。"
            example: |
              \`\`\`kotlin
              // 使用 Array 类创建数组
              val squares = Array(5) { it * it } // [0, 1, 4, 9, 16]

              // 使用 arrayOf() 函数创建数组
              val array = arrayOf(1, 2, 3, 4, 5)

              // 空数组
              val emptyArray = emptyArray<String>()

              // 空元素数组
              val nullArray = arrayOfNulls<String>(3) // 创建一个包含三个空元素的数组

              // 基本类型数组
              val intArray = IntArray(5) { it * 2 } // [0, 2, 4, 6, 8]
              // DoubleArray、FloatArray、BooleanArray

              // Array 与 List 的互转
              val array = arrayOf(1, 2, 3)
              val arrayList = array.toList()
              val listArray = arrayList.toTypedArray()
              \`\`\`
          - title: List
            description: "不可变列表，不能添加、修改或删除元素。"
            example: 略
          - title: MutableList
            description: "可变列表，可以添加、修改或删除元素。"
            example: 略
      - title: "访问元素"
        description: "可以通过索引来访问数组元素，索引从 0 开始。也可以使用 get() 方法来访问。对于可变和不可变列表，访问方式相同。超出索引范围会抛出 ArrayIndexOutOfBoundsException 异常。"
        example: 略
      - ...
    \`\`\`
`;

async function complete(
  query: string,
  references: Reference[],
  instruction = defaultInstruction
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

async function generateContent(
  language: LanguageData,
  feature: Feature,
  references: Reference[]
): Promise<Feature> {
  const text = await complete(
    `${language.title} ${feature.query || feature.title || ''}\n\nid: ${
      feature.id
    }\ntitle: ${feature.title}${
      feature.outline
        ? `\noutline:\n  ${yaml
            .dump(feature.outline, {
              lineWidth: -1,
              indent: 2,
            })
            .replace(/\n/g, '\n  ')}`
        : ''
    }${feature.comment ? `\n\nps: ${feature.comment}` : ''}`,
    references,
    feature.outline ? instructionWihoutOutline : defaultInstruction
  );
  const data = yaml.load(
    text.replace(/^\s*```yaml(\n)?/g, '').replace(/(\n)?```\s*$/g, '')
  ) as {
    title: string;
    description: string;
    usage: {
      title: string;
      description: string;
      example: string;
    }[];
  };
  return {
    id: feature.id,
    title: feature.title,
    query: feature.query,
    comment: feature.comment,
    description: data.description,
    usage: data.usage,
    references: feature.references?.map((ref) => ({
      title: ref.title,
      url: ref.url,
    })),
  };
}

async function generateFeatureByRecursion(
  language: LanguageData,
  target: string
) {
  const { filepath, feature } = await loadFeature(language, target);
  if (feature.children) {
    for (let index = 0; index < feature.children.length; index++) {
      const element = feature.children[index];
      await generateFeatureByRecursion(language, path.join(target, element));
    }
    return;
  } else if (feature.description && !!feature.usage?.[0]?.example) {
    return;
  }
  console.log('#', feature.id, '-', feature.title, '-', feature.query);
  // const references = await loadReference(language, feature);
  // feature.references = references.map((ref) => ({
  //   title: ref.title,
  //   url: ref.url,
  // }));
  if (!feature.description) {
    const newFeature = await generateContent(language, feature, []);
    Object.assign(feature, newFeature);
  }
  let content: string = '';
  try {
    content = yaml.dump(feature, {
      lineWidth: -1,
      sortKeys: (a, b) => (keys[a] ?? 999) - (keys[b] ?? 999),
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
export async function generateUsage(language: string, feature: string) {
  await generateFeatureByRecursion(await getLanguageData(language), feature);
}
