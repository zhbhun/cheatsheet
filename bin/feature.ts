import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
import yaml from 'js-yaml';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { LanguageData, Reference, Feature } from './types.ts';
import { context, getLanguageData, loadFeature } from './utils.ts';
import { loadReference } from './reference.ts';

dotenv.config({
  path: path.resolve(context, '.env.local'),
});

const keys: Record<any, number> = {
  id: 0,
  title: 1,
  query: 2,
  comment: 3,
  description: 4,
  usage: 5,
  references: 6,
};

const instruction = `
你是一名精通多种语言的编程专家，并且非常擅长编写入门教程。请根据用户输入的文档和编程语言特性梳理输出一份循序渐进的用法教程。

- 工作流：
  1. 总结该语言特性是什么，在什么场景用，使用什么来实现，作为特性的描述信息。
  2. 罗列出编程语言特性的**所有**语法、属性和方法。
  3. 按照循序渐进顺序，梳理出该编程语言特性的**所有**用法列表。
    - 避免枯燥的理论知识讲解。
    - 每个教程都是个实际的用法，例如数组的：如何创建、如何访问、如何修改、如何遍历、如何转换、如何过滤、如何排序、如何查找等。
    - 每个用法不能太泛，也不能太细，要有明确的功能和用法。
    - 用法列表应该是循序渐进的，从简单到复杂，从基础到高级。
    - 涵盖编程语言的所有特性，让学习者掌握全方位的技能。
  4. 针对每个用法，生成一个标题，这个标题应该简洁明了，能够准确描述该用法的功能。
  5. 针对每个用法，生成一个描述信息，描述信息中包含该用法的概括介绍。涉及到的关键语法、属性或方法需要依次罗列介绍。
    - 语法：每种语法都有不同的用法，需要分别描述。
    - 属性：对应的值有不同的设置方式，需要分别描述。
    - 方法：每个方法都有不同的调用方式，需要分别描述。
  6. 针对每个用法，生成一个示例代码，示例代码应该简洁明了，能够准确演示该用法的功能。
    - 必须遵循事实，不得虚构
    - 示例必须是独立的，包含相应的上下文信息
    - 必须注释说明用法产生的效果
    - 必须注释说明关键语法、属性和方法的用法
- 输出：YAML
  \`\`\`yaml
  title: "编程语言特性"
  description: "该编程语言特性是什么，在什么场景用，使用什么来实现。"
  usage: |
    - title: "用法标题"
      description: "用法描述（Markdown）"
      example": "代码示例（Markdown）"
  }
  \`\`\`
- 示例
  - Kotlin 数组
    \`\`\`yaml
    title: "数组"
    description: "Kotlin 中的 \`Array\` 和 \`List\` 都用于存储有序元素，但它们有明显的区别。\`Array\` 是固定大小的，初始化后不能调整长度，且每个元素都可以被修改（mutable）。\`List\` 是接口，分为只读的 \`listOf()\` 和可变的 \`mutableListOf()\`。与数组不同，\`List\` 可以动态增加或减少元素。"
    usage:
      - title: "创建数组"
        description: |
          Kotlin 提供多种方式来创建数组。
          - arrayOf(): 函数创建固定大小的数组，数组创建后大小不能修改。
          - intArrayOf(), floatArrayOf(), doubleArrayOf(): 分别创建特定类型的数组。
          - Array() 构造函数：接受大小和初始化函数的参数。
          - mutableListOf(): 创建可变列表，允许动态添加、删除或修改元素。
          - listOf(): 创建不可变列表，内容不可修改。
        example: |
          \`\`\`kotlin
          // 创建不可变和可变列表
          val immutableList = listOf("apple", "banana", "cherry") // 不可变列表
          val mutableList = mutableListOf("apple", "banana") // 可变列表

          // 创建空数组
          val emptyArray = emptyArray<String>() // 创建一个空字符串数组
          val nullArray = arrayOfNulls<String>(3) // 创建一个包含三个空元素的数组
          \`\`\`
      - title: "访问元素"
        description: "可以通过索引来访问数组元素，索引从 0 开始。也可以使用 get() 方法来访问。对于可变和不可变列表，访问方式相同。超出索引范围会抛出 ArrayIndexOutOfBoundsException 异常。"
        example: 略
      - title: "修改数组"
        description: "对于通过 arrayOf() 或 mutableListOf() 创建的数组，可以通过索引修改数组中的元素，也可以使用 set() 方法来更新指定位置的元素。对于通过 listOf() 创建的不可变列表，内容不可修改。"
        example: 略
      - title: "数组遍历"
        description: |
          数组的遍历方式包括：
          - 使用 for 循环或 forEach 函数遍历每一个元素。
          - 使用 withIndex() 方法同时获取索引和值。
          - 使用 forEachIndexed() 函数遍历带有索引的数组元素。
        example: 略
      - title: "数组转换"
        description: |
          可以使用多种函数对数组进行转换：
          - map(): 遍历数组并对每个元素进行转换，生成包含新值的数组或列表。
          - filter(): 按条件过滤数组元素，返回满足条件的子集。
          - flatMap(): 将数组中的每个元素映射为一个新的集合，然后将这些集合合并为一个列表。转换操作不会修改原数组或列表，而是返回一个新数组或列表。
        example: 略
      - title: "数组过滤"
        description: "使用 filter() 函数根据条件过滤数组中的元素，生成满足条件的子集。filterIndexed() 可以在过滤时同时使用元素的索引。"
        example: 略
      - title: "数组排序"
        description: |
          Kotlin 提供多种排序方式：
          - sorted(): 按自然顺序排序。
          - sortedBy(): 根据指定的选择器进行排序。
          - sortedDescending(): 按降序排列。
          - sortedByDescending(): 按选择器降序排列。
        example: 略
      - title: "查找元素"
        description: "可以使用 find()、firstOrNull() 函数查找满足条件的数组或列表元素，返回第一个匹配的元素。也可以使用 indexOf() 或 lastIndexOf() 查找元素在数组或列表中的索引位置。"
        example: 略
        \`\`\`
  - Android LinearLayout
    \`\`\`yaml
    title: "LinearLayout"
    description: "LinearLayout 是 Android 中最常用的布局之一，用于在水平或垂直方向上排列子视图。LinearLayout 可以设置子视图的对齐方式、权重、边距等属性。"
    usage:
      - title: "创建布局"
        description: "在 XML 布局中使用 LinearLayout 标签，或者通过代码创建 LinearLayout 实例。LinearLayout 是一种按水平或垂直方向排列子视图的容器。"
        example: |
          \`\`\`xml
          <!-- 创建一个默认横向排列的 LinearLayout 布局 -->
          <LinearLayout
              xmlns:android="http://schemas.android.com/apk/res/android"
              android:layout_width="match_parent"
              android:layout_height="match_parent"
              android:padding="16dp">

              <!-- 第一个文本项，位于左边 -->
              <TextView
                  android:layout_width="wrap_content"
                  android:layout_height="wrap_content"
                  android:text="Item 1"/>

              <!-- 第二个文本项，依次排在第一个项右方 -->
              <TextView
                  android:layout_width="wrap_content"
                  android:layout_height="wrap_content"
                  android:text="Item 2"/>
          </LinearLayout>
          \`\`\`
      - title: "排列方向"
        description: "通过设置 android:orientation 属性来指定子视图的排列方向，可以是垂直（vertical）或水平（horizontal）。在代码中可以通过 setOrientation() 设置。"
        example: |
          \`\`\`xml
          <!-- 这个布局中，子视图将按垂直方向排列，所有子视图依次向下排列。 -->
          <LinearLayout
            xmlns:android="http://schemas.android.com/apk/res/android"
            android:id="@+id/linearLayout"
            android:layout_width="match_parent"
            android:layout_height="match_parent"
            android:orientation="vertical"
            android:padding="16dp">

            <!-- 第一个按钮项，位于顶部，内容居中显示 -->
            <Button
                android:id="@+id/toggleButton"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="Item 1"
                android:gravity="center"/>

            <!-- 第二个文本项，依次排在第一个项下方，内容也居中显示 -->
            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="Item 2"
                android:gravity="center"/>
          </LinearLayout>
          \`\`\`

          \`\`\`kotlin
          class MainActivity : AppCompatActivity() {
              override fun onCreate(savedInstanceState: Bundle?) {
                  super.onCreate(savedInstanceState)
                  setContentView(R.layout.activity_main)

                  // 获取 LinearLayout 和切换按钮
                  val linearLayout = findViewById<LinearLayout>(R.id.linearLayout)
                  val toggleButton = findViewById<Button>(R.id.toggleButton)

                  // 设置按钮点击监听器，切换布局方向
                  toggleButton.setOnClickListener {
                      // 检查当前方向并切换
                      if (linearLayout.orientation == LinearLayout.HORIZONTAL) {
                          linearLayout.orientation = LinearLayout.VERTICAL
                      } else {
                        linearLayout.orientation = LinearLayout.HORIZONTAL
                      }
                  }
              }
          }
          \`\`\`

      - title: "对齐方式"
        description: |
          使用 android:gravity 属性来控制所有子视图在 LinearLayout 内的对齐方式。单个子视图可以通过 android:layout_gravity 属性设置自身在父布局中的对齐方式。可选值包括：
          - center: 子视图在容器中居中。
          - left: 子视图在容器中左对齐。
          - right: 子视图在容器中右对齐。
          - top: 子视图在容器顶部对齐。
          - bottom: 子视图在容器底部对齐。
          - center_horizontal: 子视图在水平方向居中。
          - center_vertical: 子视图在垂直方向居中。
        example: 略
      - title: "基线对齐"
        description: "通过设置 android:baselineAligned 属性来控制子视图的基线对齐，通常用于文本元素对齐。默认情况下，LinearLayout 会将第一个子视图作为基线对齐的参考。可以通过 android:baselineAlignedChildIndex 属性指定其他子视图为基线参考。"
        example: 略
      - title: "权重占比"
        description: "通过 android:layout_weight 属性来指定子视图在剩余空间中分配的比例，支持动态调整布局。android:weightSum 属性定义所有子视图的权重总和。"
        example: 略
      - title: "元素间距"
        description: "使用 android:layout_margin 和 android:padding 属性来定义子视图之间的间距或内边距。可以分别设置四个方向的间距：start、end、top、bottom。"
        example: 略
      - title: "分隔符"
        description: "通过 android:divider 和 android:showDividers 属性在子视图之间添加可自定义的分割线。分割线可以通过 drawable 资源自定义样式，并可以设置分割线的间距。"
        example: 略
    \`\`\`
`;

const gemini = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY as string
).getGenerativeModel({
  model: 'models/gemini-1.5-pro-latest',
});

async function complete(query: string, references: Reference[]) {
  const result = await gemini.generateContent({
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
    systemInstruction: instruction,
  });
  const text = await result.response.text();
  return text;
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
      feature.comment ? `\n\nps: ${feature.comment}` : ''
    }`,
    references
  );
  const data = yaml.load(
    text.replace(/^```yaml(\n)?/g, '').replace(/(\n)?```$/g, '')
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
  const references = await loadReference(language, feature);
  feature.references = references.map((ref) => ({
    title: ref.title,
    url: ref.url,
  }));
  if (!feature.description) {
    const newFeature = await generateContent(language, feature, references);
    Object.assign(feature, newFeature);
  }
  await fs.promises.writeFile(
    filepath,
    yaml.dump(feature, {
      lineWidth: -1,
      sortKeys: (a, b) => (keys[a] ?? 999) - (keys[b] ?? 999),
    }),
    'utf-8'
  );
}

/**
 *
 * @param language like typescript
 * @param feature like syntax/modules
 */
export async function generateFeature(language: string, feature: string) {
  await generateFeatureByRecursion(await getLanguageData(language), feature);
}
