import { Effect } from "effect";

// Instructions: ✅
// 1 - Split the errors ✅
// 2 - Add data validation with Schema
// 3 - Recover from errors with catchAll/catchTag/catchTags
// 4 - Retry
// 5 - Manage concurrency
// 6 - Format the todos (sort / groupBy)

class FetchError {
  readonly _tag = "FetchError";
}
class JsonError {
  readonly _tag = "JsonError";
}

const getTodo = (id: number) =>
  Effect.gen(function* () {
    const response = yield* Effect.tryPromise({
      try: () => fetch(`https://jsonplaceholder.typicode.com/todos/${id}`),
      catch: () => new FetchError(),
    });
    const responseJson = yield* Effect.tryPromise({
      try: () => response.json(),
      catch: () => new JsonError(),
    });
    return responseJson;
  });

const program = getTodo(1);

Effect.runPromise(program).then(console.log);
