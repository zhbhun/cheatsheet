
- syntax

    - id: syntax
    - title: 语法
    - children

      - variables

        - id: variables
        - title: 变量
        - children

          - variable
            - id: variable
            - title: 变量
            - description: 变量是用于存储数据的命名容器。您可以随时更改存储在变量中的值。
            - example:

              ```kotlin
              var message = "Hello!" // 使用 `var` 关键字声明一个名为 message 的变量，并将其赋值为字符串 "Hello!"。
              message = "Hello, world!" // 更改 message 变量的值。
              ```
            
            - references

              - [Variables](https://kotlinlang.org/docs/basic-syntax.html#variables)

          - constant

            - id: constant
            - title: 常量
            - description: 常量类似于变量，但其值一旦设置就不能更改。常量在程序运行时不会发生改变，通常用于存储固定的值，例如圆周率或数学常数。
            - example:

              ```kotlin
              val PI = 3.14159 // 使用 `val` 关键字声明一个名为 PI 的常量，并将其赋值为 3.14159。
              // PI = 3.14 // 这将导致错误，因为您不能更改常量的值。
              ```

            - references

              - [Variables](https://kotlinlang.org/docs/basic-syntax.html#variables)

          - naming

            - id: naming
            - title: 命名
            - description: 变量和常量的名称必须遵循 Kotlin 的命名规则。使用有意义的名称可以提高代码的可读性和可维护性。
            - example:

              ```kotlin
              var myVariable = "value" // 变量名通常使用驼峰命名法。
              val MY_CONSTANT = 10 // 常量名通常使用大写字母和下划线。
              ```

            - references

              - [Coding Conventions](https://kotlinlang.org/docs/coding-conventions.html#naming-rules)

      - types

        - id: types
        - title: 类型
        - children

          - number

            - id: number
            - title: 数字
            - description: 表示数字，可以是整数或浮点数。Kotlin 提供了多种数字类型，例如 Int、Long、Float 和 Double，以满足不同的精度和范围需求。
            - example:

              ```kotlin
              var num = 10 // 整数类型 Int
              var floatNum = 3.14 // 浮点数类型 Double
              ```

            - references

              - [Basic Types](https://kotlinlang.org/docs/basic-types.html)

          - string

            - id: string
            - title: 字符串
            - description: 表示文本。字符串是字符的序列，可以使用双引号或三重引号括起来。
            - example:

              ```kotlin
              var str = "Hello World!" // 使用双引号括起来的字符串
              var multilineStr = """
                  多行字符串
                  可以使用三重引号
              """.trimIndent() // 使用三重引号括起来的字符串，可以使用 trimIndent() 方法去除多余的缩进
              ```

            - references

              - [Strings](https://kotlinlang.org/docs/strings.html)

          - boolean

            - id: boolean
            - title: 布尔值
            - description: 表示真或假。布尔值只有两个可能的值：true 或 false。
            - example:

              ```kotlin
              var bool = true
              var falseBool = false
              ```

            - references

              - [Basic Types](https://kotlinlang.org/docs/basic-types.html)

          - null

            - id: null
            - title: 空值
            - description: 表示有意缺少值。Kotlin 使用 null 表示空值，需要使用 `?` 声明可为空的类型。
            - example:

              ```kotlin
              var empty: String? = null // 声明一个可为空的字符串类型变量
              ```

            - references

              - [Null Safety](https://kotlinlang.org/docs/null-safety.html)

          - object

            - id: object
            - title: 对象
            - description: 键值对的集合。Kotlin 中的对象可以使用 data class 或 class 声明，并可以使用属性和方法进行操作。
            - example:

              ```kotlin
              data class Person(val name: String, val age: Int) // 声明一个数据类 Person
              var person = Person("John", 30) // 创建一个 Person 对象
              println(person.name) // 访问对象的属性
              ```

            - references

              - [Classes and Objects](https://kotlinlang.org/docs/classes.html)

      - convert

        - id: convert
        - title: 类型转换
        - description: 将一种数据类型转换为另一种数据类型。Kotlin 提供了多种类型转换方法，例如 toInt()、toString() 和 toBoolean() 等。
        - example:

          ```kotlin
          var num = "10".toInt() // 将字符串 "10" 转换为数字 10
          var str = 10.toString() // 将数字 10 转换为字符串 "10"
          var bool = "true".toBoolean() // 将字符串 "true" 转换为布尔值 true
          ```

        - references

          - [Type Conversions](https://kotlinlang.org/docs/basic-types.html#type-conversions)

      - expression

        - id: expression
        - title: 表达式
        - children

          - arithmetic-operation

            - id: arithmetic-operation
            - title: 算术运算
            - description: 执行数学运算，例如加法、减法、乘法和除法。Kotlin 支持常见的算术运算符，例如 +、-、*、/ 和 %。
            - example:

              ```kotlin
              var result = 10 + 5 // 加法
              result = 10 - 5 // 减法
              result = 10 * 5 // 乘法
              result = 10 / 5 // 除法
              result = 10 % 5 // 取模 (余数)
              ```

            - references

              - [Operators](https://kotlinlang.org/docs/operator-overloading.html)

          - logical-operation

            - id: logical-operation
            - title: 逻辑运算
            - description: 用于组合或修改布尔值。Kotlin 支持常见的逻辑运算符，例如 && (与)、|| (或) 和 ! (非)。
            - example:

              ```kotlin
              var result = true && false // 逻辑与，返回 false
              result = true || false // 逻辑或，返回 true
              result = !true // 逻辑非，返回 false
              ```

            - references

              - [Operators](https://kotlinlang.org/docs/operator-overloading.html)

          - comparison-operation

            - id: comparison-operation
            - title: 比较运算
            - description: 比较两个值并返回布尔值。Kotlin 支持常见的比较运算符，例如 > (大于)、< (小于)、>= (大于等于)、<= (小于等于)、== (等于) 和 != (不等于)。
            - example:

              ```kotlin
              var result = 10 > 5 // 大于，返回 true
              result = 10 < 5 // 小于，返回 false
              result = 10 >= 5 // 大于等于，返回 true
              result = 10 <= 5 // 小于等于，返回 false
              result = 10 == 5 // 等于，返回 false
              result = 10 != 5 // 不等于，返回 true
              ```

            - references

              - [Operators](https://kotlinlang.org/docs/operator-overloading.html)

          - nullish-coalescing-operation

            - id: nullish-coalescing-operation
            - title: 空值合并运算
            - description: 如果第一个操作数为 null 或 undefined，则返回第二个操作数。Kotlin 使用 Elvis 运算符 `?:` 实现空值合并运算。
            - example:

              ```kotlin
              var result = null ?: "default value" // 返回 "default value"，因为第一个操作数为 null。
              ```

            - references

              - [Null Safety](https://kotlinlang.org/docs/null-safety.html)

          - ternary-expression

            - id: ternary-expression
            - title: 三元表达式
            - description: 基于条件返回不同值的一种简写方式。Kotlin 没有三元运算符，可以使用 if-else 表达式实现类似的功能。
            - example:

              ```kotlin
              var result = if (condition) value1 else value2 // 如果 condition 为真，则返回 value1，否则返回 value2。
              ```

            - references

              - [Control Flow](https://kotlinlang.org/docs/control-flow.html)

          - function-expression

            - id: function-expression
            - title: 函数表达式
            - description: 定义一个匿名函数。Kotlin 支持函数表达式，可以使用 lambda 表达式或匿名函数定义。
            - example:

              ```kotlin
              var myFunction = { param: Int ->
                  // 函数体
              } // 使用 lambda 表达式定义一个匿名函数
              ```

            - references

              - [Functions](https://kotlinlang.org/docs/functions.html)

      - statement

        - id: statement
        - title: 语句
        - children

          - ifelse

            - id: ifelse
            - title: if-else 语句
            - description: 根据条件执行不同的代码块。Kotlin 的 if-else 语句与其他语言类似。
            - example:

              ```kotlin
              if (condition) {
                  // 如果 condition 为真，则执行此代码块。
              } else {
                  // 如果 condition 为假，则执行此代码块。
              }
              ```

            - references

              - [Control Flow](https://kotlinlang.org/docs/control-flow.html)

          - while

            - id: while
            - title: while 循环
            - description: 只要条件为真就重复执行代码块。Kotlin 的 while 循环与其他语言类似。
            - example:

              ```kotlin
              while (condition) {
                  // 循环体，只要 condition 为真就一直执行。
              }
              ```

            - references

              - [Control Flow](https://kotlinlang.org/docs/control-flow.html)

          - for

            - id: for
            - title: for 循环
            - description: 重复执行代码块特定次数。Kotlin 的 for 循环可以使用 ranges、arrays 和 collections 等进行迭代。
            - example:

              ```kotlin
              for (i in 0..9) {
                  // 循环体，执行 10 次。
              }
              ```

            - references

              - [Control Flow](https://kotlinlang.org/docs/control-flow.html)

          - when

            - id: when
            - title: when 语句
            - description: Kotlin 中的 when 语句类似于其他语言中的 switch 语句，可以根据表达式的值执行不同的代码块。
            - example:

              ```kotlin
              when (expression) {
                  value1 -> {
                      // 当 expression 等于 value1 时执行。
                  }
                  value2 -> {
                      // 当 expression 等于 value2 时执行。
                  }
                  else -> {
                      // 当 expression 不匹配任何 case 时执行。
                  }
              }
              ```

            - references

              - [Control Flow](https://kotlinlang.org/docs/control-flow.html)

- function

  - id: function
  - title: 函数
  - description: 一段可重复使用的代码块，可以接受参数并返回值。函数可以提高代码的可读性和可维护性。
  - example:

    ```kotlin
    fun myFunction(param1: Int, param2: Int): Int {
        // 函数体
        return param1 + param2 // 返回结果
    }

    val result = myFunction(1, 2) // 调用函数
    ```
    - references
        - [Functions](https://kotlinlang.org/docs/functions.html)

- class

  - id: class
  - title: 类
  - description: 创建对象的蓝图。类定义了对象的属性和方法，可以用于创建多个具有相同属性和方法的对象。
  - example:

    ```kotlin
    class MyClass(param1: Int, param2: Int) { // 构造函数
        var property1 = param1
        var property2 = param2

        fun myMethod() {
            // 方法体
        }
    }

    val myInstance = MyClass(1, 2) // 创建 MyClass 的实例
    myInstance.myMethod() // 调用实例方法
    ```
    - references
        - [Classes and Objects](https://kotlinlang.org/docs/classes.html)

- generic

  - id: generic
  - title: 泛型
  - description: 允许我们编写可重用的代码组件，这些组件可以与各种数据类型一起使用，而无需为每种类型编写单独的版本。泛型可以提高代码的可重用性和类型安全性。
  - example:

    ```kotlin
    fun <T> identity(arg: T): T { // 定义一个泛型函数
        return arg
    }

    val output = identity<String>("myString") // 使用泛型函数
    ```
    - references
        - [Generics](https://kotlinlang.org/docs/generics.html)

- std

  - collections

    - id: collections
    - title: 集合
    - children

      - array

        - id: array
        - title: 数组
        - description: 有序的集合，可以存储任何数据类型。Kotlin 中的数组使用 Array 类表示，可以使用 arrayOf() 函数创建。
        - example:

          ```kotlin
          val myArray = arrayOf(1, 2, 3) // 创建一个数组
          myArray[0] = 4 // 修改数组元素
          println(myArray[0]) // 访问数组元素
          ```
          - references
            - [Arrays](https://kotlinlang.org/docs/arrays.html)

      - list

        - id: list
        - title: 列表
        - description: 有序的集合，可以存储任何数据类型。Kotlin 中的列表使用 List 接口表示，可以使用 listOf() 函数创建不可变列表，使用 mutableListOf() 函数创建可变列表。
        - example:

          ```kotlin
          val myList = listOf("apple", "banana", "orange") // 创建一个不可变列表
          val myMutableList = mutableListOf("apple", "banana", "orange") // 创建一个可变列表
          myMutableList.add("grape") // 添加元素
          println(myList[0]) // 访问列表元素
          ```
          - references
            - [Collections Overview](https://kotlinlang.org/docs/collections-overview.html)

      - set

        - id: set
        - title: 集合
        - description: 唯一值的集合。Kotlin 中的集合使用 Set 接口表示，可以使用 setOf() 函数创建不可变集合，使用 mutableSetOf() 函数创建可变集合。
        - example:

          ```kotlin
          val mySet = setOf(1, 2, 3) // 创建一个不可变集合
          val myMutableSet = mutableSetOf(1, 2, 3) // 创建一个可变集合
          myMutableSet.add(4) // 添加元素
          println(mySet.contains(1)) // 检查集合是否包含某个元素
          ```
          - references
            - [Collections Overview](https://kotlinlang.org/docs/collections-overview.html)

      - map

        - id: map
        - title: 映射
        - description: 键值对的集合。Kotlin 中的映射使用 Map 接口表示，可以使用 mapOf() 函数创建不可变映射，使用 mutableMapOf() 函数创建可变映射。
        - example:

          ```kotlin
          val myMap = mapOf("key1" to "value1", "key2" to "value2") // 创建一个不可变映射
          val myMutableMap = mutableMapOf("key1" to "value1", "key2" to "value2") // 创建一个可变映射
          myMutableMap["key3"] = "value3" // 添加键值对
          println(myMap["key1"]) // 获取键对应的值
          ```
          - references
            - [Collections Overview](https://kotlinlang.org/docs/collections-overview.html)

  - date

    - id: date
    - title: 日期
    - description: Kotlin 中的日期和时间可以使用 `java.time` 包中的类进行处理，例如 `LocalDate`、`LocalTime` 和 `LocalDateTime`。
    - example:

      ```kotlin
      import java.time.LocalDate
      import java.time.LocalTime
      import java.time.LocalDateTime

      val today = LocalDate.now() // 获取当前日期
      val now = LocalTime.now() // 获取当前时间
      val currentDateTime = LocalDateTime.now() // 获取当前日期和时间
      println(today) // 输出当前日期
      println(now) // 输出当前时间
      println(currentDateTime) // 输出当前日期和时间
      ```
      - references
        - [java.time package](https://docs.oracle.com/javase/8/docs/api/java/time/package-summary.html)

  - regexp

    - id: regexp
    - title: 正则表达式
    - description: 正则表达式用于匹配文本中的模式。Kotlin 中的正则表达式可以使用 `Regex` 类进行处理。
    - example:

      ```kotlin
      val pattern = Regex("abc") // 定义一个正则表达式
      println(pattern.containsMatchIn("abcdefg")) // 测试字符串是否匹配正则表达式
      ```
      - references
        - [Kotlin Regex](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.text/-regex/)

  - coroutine

    - id: coroutine
    - title: 协程
    - description: 协程是 Kotlin 中的轻量级线程，可以用于简化异步编程。
    - example:

      ```kotlin
      import kotlinx.coroutines.*

      fun main() {
          GlobalScope.launch { // 在后台启动一个新的协程
              delay(1000L) // 非阻塞的延迟 1 秒
              println("Hello from coroutine")
          }
          println("Hello from main")
          Thread.sleep(2000L) // 阻塞主线程 2 秒，以确保协程完成
      }
      ```
      - references
        - [Coroutines](https://kotlinlang.org/docs/coroutines-overview.html)


- module

  - id: module
  - title: 模块
  - description: 允许我们将代码组织成单独的文件，并通过导入和导出语句在它们之间共享代码。Kotlin 中的模块使用关键字 `package` 声明，并使用 `import` 关键字导入其他模块。
  - example:

    ```kotlin
    // myModule.kt
    package com.example

    fun myFunction() { // 导出函数
        // 函数体
    }

    // main.kt
    package com.example

    import com.example.myFunction // 导入函数

    fun main() {
        myFunction() // 调用导入的函数
    }
    ```
  - references
      - [Packages and Imports](https://kotlinlang.org/docs/packages.html)

