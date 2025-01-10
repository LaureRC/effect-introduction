---
theme: seriph
background: https://cdn.jsdelivr.net/gh/slidevjs/slidev-covers@main/static/pUSKnAUti5s.webp
title: Introduction to Effect
class: text-center
transition: fade
mdc: true
lineNumbers: true
monacoTypesAdditionalPackages:
  - effect
---

# Introduction to Effect

Laure Retru-Chavastel - Frontend Queens talk - Dec. 19, 2024

<!--
👋 I’m Laure Retru-Chavastel, a full-stack software engineer at **Inato**, a startup striving to bring clinical research to each and every patient across the globe.

Today, I’ll introduce you to **Effect**!
-->

---

# What is Effect?

<v-click>

> "Effect is a powerful TypeScript library designed to help developers easily create complex, synchronous, and asynchronous programs."

</v-click>

<!--
First of all, what is Effect? Let's quote their official documentation (which is amazing, have a look at it if you're interested in learning more about Effect!)
-->

---

# Why Effect?

```ts {monaco}
export const divide = (a: number, b: number) => {
  if (b === 0) {
    throw new Error('Cannot divide by zero')
  }
  return a / b
}

export const getTodo = async (id: number) => {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/todos/${id}`
  )
  return await response.json()
}
```

<!--
Here are some pretty classic functions: one to divide some numbers and another one to fetch a todo from an API.

Issues: 
- b is zero -> 1st method will throw
- fetch/json could reject in my 2nd method

BUT all of this is not visible in the signature of my method

This is where Effect can help.
-->

---

# The Effect Type

<v-click>

````md magic-move
```ts
type Effect<Success, Error, Requirements>
```

```ts
type Effect<Success, Error, Requirements>
//             ▲
//             │
//             │
//             └──── Represents the success type
```

```ts
type Effect<Success, Error, Requirements>
//             ▲       ▲
//             │       │
//             │       └──── Represents the error type
//             └──── Represents the success type
```

```ts
type Effect<Success, Error, Requirements>
//             ▲       ▲       ▲
//             │       │       └──── Represents required dependencies
//             │       └──── Represents the error type
//             └──── Represents the success type
```

```ts
type Effect<Success, Error, Requirements> =
//             ▲       ▲       ▲
//             │       │       └──── Represents required dependencies
//             │       └──── Represents the error type
//             └──── Represents the success type

<=> (requirements: Requirements) => Success | Error
```
````

</v-click>

<!--
Let's talk about THE core concept of the whole Effect ecosystem: the Effect type.

This type tells us that an effect: 

1️⃣ Can succeed and return a value of type `Success` 

2️⃣ Can fail with an error of type `Error`

3️⃣ May need some dependencies of type `Requirements` to run

You can think about it as a function that take requirements as an argument and then returns a value or an error.

Effects are not functions though!
-->

---

# The Effect type

> "The `Effect` type is an **immutable** description of a workflow or operation that is **lazily** executed"

<v-click>
<br>

- Immutable

</v-click>
<v-click>

- Lazy

</v-click>

<!--
Two important keywords here:

"Immutable" -> because Effect values are immutable. And every function in the Effect library will produce a new Effect value

"Lazy" -> when you create an effect, it won't run immediately. Instead, it will define a program that can succeed, fail or require some additional context.
-->

---

# Creating Effects

<v-click>

Basic constructors:

```ts {monaco-run}
import { Effect } from 'effect'

const success = Effect.succeed(18) // Effect<number>

// const failure = Effect.fail(new Error('Boom!')) // Effect<never, Error>
```

</v-click>

<!--
We'll start with the "basic" constructors allowing to create an effect from a value.

The **Succeed function** creates an Effect that always succeeds with a given value.

First type is the success (so here a number), 2nd one is the error, and last one is the requirements.

The **Fail function** creates an Effect that will always fail with this value.

It's important to note that you could actually put anything as an error, so it could be like a number, a string, an object, whatever you want.
-->

---

# Creating Effects

Basic constructors:

```ts {monaco-run}
import { Effect } from 'effect'

const divideWithoutEffect = (a: number, b: number) => {
  if (b === 0) {
    throw new Error('Cannot divide by zero')
  }
  return a / b
}

const divideWithEffect = (
  a: number,
  b: number
): Effect.Effect<number, Error> =>
  b === 0
    ? Effect.fail(new Error('Cannot divide by zero')) // Effect<never, Error>
    : Effect.succeed(a / b) // Effect<number>
```

<!--
Now that we know how to create effects from a value, let's rewrite our example of a divide function
-->

---

# Creating/Running Effects

Modeling synchronous effects

<v-click>

```ts {monaco-run}
import { Effect } from 'effect'

const program1 = Effect.succeed(console.log('Hello world 1'))

// const program2 = Effect.sync(() => {
//     console.log('Hello world 2')
//     return 18
// })
```

</v-click>

<!--
To model synchronous side effects, we can not use succeed or fail, because those are actually evaluating the value passed to them right away.

To delay the execution of side effects you can use `Effect.sync`.

Notice that the error type is never. This is because you should only use `Effect.sync` when you are sure that the provided function do not throw errors.

Then, to run a synchronous effect, you can use `Effect.runSync`
-->

---

# Creating/Running Effects

Modeling synchronous effects

```ts {monaco-run}
import { Effect } from 'effect'

const program1 = Effect.try(() => JSON.parse('{"a": 1}'))

// const program2 = Effect.try({
//     try: () => JSON.parse('{"a": 1}'),
//     catch: () => new Error('Something went wrong'),
// })

const result = Effect.runSync(program1)
console.log(result)
```

<!--
If you need to use a function that could throw, then you should use `Effect.try`: it will capture the exceptions and transform them into manageable errors

You can also customize how the exceptions will be transformed.
-->

---

# Creating/Running Effects

Modeling asynchronous effects

<v-click>

```ts {monaco-run}
import { Effect } from 'effect'

const program = Effect.promise(() => Promise.resolve(18))

// const result = Effect.runPromise(program)
// result.then(console.log)
```

</v-click>

<!--
In an asynchronous context, Effect provides 2 other constructors: 

First, Effect.promise. 

One important point to note here is that there is no mention of `Promise` in the success type! This asynchronous nature is "hidden" by Effect.

Similarly to Effect.sync, you should only use it when you are sure that the operation will not reject.

Then you'll use `Effect.runPromise` to run the effect and return the result as a Promise -> this is pretty great if you're in an application where you'd like to use some features from Effect, but you don't want to migrate your whole codebase: using Effect.runPromise will offer compatibility with promise-based code.
-->

---

# Creating/Running Effects

Modeling asynchronous effects

```ts {monaco-run}
import { Effect } from 'effect'

const program1 = Effect.tryPromise(() =>
  fetch('https://jsonplaceholder.typicode.com/todos/1').then((res) =>
    res.json()
  )
)
// const program2 = Effect.tryPromise({
//     try: () => fetch('https://jsonplaceholder.typicode.com/todos/1'),
//     catch: () => new Error('Something went wrong'),
// })

const result = Effect.runPromise(program1)
result.then(console.log)
```

<!--
If you want to handle an operation that could reject, you should use `Effect.tryPromise`, which is very similar to the `Effect.try` we saw before.

And you can also customize how to transform the exceptions.

We now know how to create and run effects! But it's important to remember that you should not use the run* methods all the time, instead you should build your program by composing effects together, and then run them.
-->

---

# Building pipelines

`pipe`

```ts
import { pipe } from "effect"

const result = pipe(input, func1, func2, ..., funcN)

┌───────┐    ┌───────┐    ┌───────┐    ┌───────┐    ┌───────┐    ┌────────┐
│ input │───►│ func1 │───►│ func2 │───►│  ...  │───►│ funcN │───►│ result │
└───────┘    └───────┘    └───────┘    └───────┘    └───────┘    └────────┘
```

<!--
The standard way to compose Effects together is to build pipelines.
You can do so in Effect by using the `pipe` function, which helps compose functions in a **readable and sequential** way.
It takes the output of one function and passes it as the input to the next function in the pipeline.

But! I know it could be a bit too far from what you used to, and luckily Effect offers another syntax, that should be closer to what you know: generators.
-->

---

# Generators

<v-click>

```ts {monaco-run}
import { Effect } from 'effect'

const fetchTransactionAmount = Effect.promise(() => Promise.resolve(100))

// Function to apply a discount safely to a transaction amount
const applyDiscount = (
  total: number,
  discount: number
): Effect.Effect<number, Error> =>
  discount === 0
    ? Effect.fail(new Error('Discount cannot be zero'))
    : Effect.succeed(total - discount)

const finalAmount = Effect.gen(function* () {
  const amount = yield* fetchTransactionAmount
  const finalAmount = yield* applyDiscount(amount, 5)
  return finalAmount
})

Effect.runPromise(finalAmount).then(console.log)
```

</v-click>

<!--
Basically you can think of `Effect.gen` as `async` and `yield` as `await` to handle effects.

Btw, you can use both syntaxes (pipe or generators) in your code: using a generator might be more readable in one case and using pipe would be better in this other case. It's up to you!
-->

---

# Let’s code!

<!--
Enough theory now, let's code!

We'll write together a small app that will fetch todos. => see livingCoding.ts file
-->

---

# And so much more!

<br>

📚 Check out the **[documentation](https://effect.website/docs)**

🎥 Shout out to Ethan Niser for his [inspiring videos](https://youtube.com/playlist?list=PLstS9OwMLPrU8PWCRv5rW0cNHXu_TzlDi&feature=shared) on Effect!

<!--
That's the end of the live coding session! I hope I was able to show you how powerful and useful Effect can be to help us developers.
-->

---

# Thank you!
