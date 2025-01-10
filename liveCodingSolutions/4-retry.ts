import { Effect, Schema } from "effect";

// Instructions: ✅
// 1 - Split the errors ✅
// 2 - Add data validation with Schema ✅
// 3 - Recover from errors with catchAll/catchTag/catchTags ✅
// 4 - Retry ✅
// 5 - Manage concurrency
// 6 - Format the todos (sort / groupBy)

class FetchError {
  readonly _tag = "FetchError";
}
class JsonError {
  readonly _tag = "JsonError";
}

const todoSchema = Schema.Struct({
  id: Schema.Number,
  title: Schema.String,
  completed: Schema.Boolean,
});
const parseTodo = Schema.decodeUnknown(todoSchema);

const getTodo = (id: number) =>
  Effect.gen(function* () {
    yield* Effect.log(`Fetching todo ${id}`);
    const response = yield* Effect.tryPromise({
      try: () => fetch(`https://jsonplaceholder.typicode.com/todos/${id}`),
      catch: () => new FetchError(),
    });
    const jsonResponse = yield* Effect.tryPromise({
      try: () => response.json(),
      catch: () => new JsonError(),
    });
    const todo = yield* parseTodo(jsonResponse);
    yield* Effect.log(`Successfully fetch todo ${id}`);
    return todo;
  });

const getTodoWithRetry = (id: number) =>
  Effect.retry(getTodo(id), {
    times: 1,
    // { while: (error) => error instanceof FetchError }
    // { schedule: Schedule.fixed("2 seconds") }
    // { schedule: Schedule.exponential(2) }
  });

const program = Effect.catchAll(getTodoWithRetry(1), (error) =>
  Effect.succeed(`Recovering from error ${error._tag}`)
);

Effect.runPromise(program).then(console.log);
