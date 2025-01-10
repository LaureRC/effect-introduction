import { Effect } from "effect";

// Instructions: ✅
// 1 - Split the errors
// 2 - Add data validation with Schema
// 3 - Recover from errors with catchAll/catchTag/catchTags
// 4 - Retry
// 5 - Manage concurrency
// 6 - Format the todos (sort / groupBy)

const getTodo = (id: number) =>
  Effect.tryPromise({
    try: () =>
      fetch(`https://jsonplaceholder.typicode.com/todos/${id}`).then((res) =>
        res.json()
      ),
    catch: () => new Error("Error while fetching todo"),
  });

const program = getTodo(1);

Effect.runPromise(program).then(console.log);
