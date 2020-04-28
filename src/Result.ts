import Option from "./Option";

/**
 * Represents a success (`ok`) or failure (`err`).
 */
export default interface Result<T, E> {
  /**
   * Accepts an object with two callbacks.
   * One will be called if `this` is `ok`.
   * The other will be called if `this` is `err`.
   * In either case, the inner value gets
   * passed to the callback.
   *
   * Returns the return value of whichever callback
   * gets called.
   *
   * @param matcher An object with callbacks for `ok` and `err`.
   */
  match<U, V>(matcher: { ok: (value: T) => U; err: (error: E) => V }): U | V;

  /**
   * Returns the inner value wrapped in `some` if `this` is
   * `ok`.
   * Otherwise, returns `none`.
   */
  ok(): Option<T>;

  /**
   * Returns the inner value wrapped in `some` if `this` is
   * `err`.
   * Otherwise, returns `none`.
   */
  err(): Option<E>;

  isOk(): this is Result<T, never>;

  isErr(): this is Result<never, E>;

  /**
   * Applies a function to the inner value if `this` is `ok`.
   * Otherwise, returns the `err` untouched.
   *
   * @param mapper A function that will be called if `this` is `ok`.
   */
  map<T2>(mapper: (value: T) => T2): Result<T2, E>;

  /**
   * Applies a function to the inner value if `this` is `err`.
   * Otherwise, returns the `ok` untouched.
   *
   * @param mapper A function that will be called if `this` is `err`.
   */
  mapErr<E2>(mapper: (error: E) => E2): Result<T, E2>;

  /**
   * Calls the provided callback with the value that `this` wraps
   * if `this` is `ok`.
   *
   * This method is the same as `Result.prototype.map()`
   * except that it discards the value returned by
   * the callback, unconditionally returning undefined.
   *
   * @param executor A callback that will be called if `this` is `ok`.
   */
  ifOk(executor: (value: T) => void): void;

  /**
   * Calls the provided callback if `this` is `err`.
   *
   * @param executor A callback that will be called if `this` is `err`.
   */
  ifErr(executor: (error: E) => void): void;

  /**
   * Returns the inner value if `this` is `ok`,
   * otherwise throwing an error.
   */
  unwrap(): T;

  /**
   * Same as `unwrap()` except this method will never
   * throw, since `this` cannot be `err` (because
   * the error type is `never`).
   */
  safeUnwrap(this: Result<any, never>): T;

  /**
   * Same as `unwrapErr()` except this method will never
   * throw, since `this` cannot be `ok` (because
   * the ok type is `never`).
   */
  safeUnwrapErr(this: Result<never, any>): E;

  /**
   * Returns the inner value if `this` is `err`,
   * otherwise throwing an error.
   */
  unwrapErr(): E;

  /**
   * Returns the inner value if `this` is `ok`,
   * otherwise throws the inner value.
   */
  unwrapOrThrowErr(this: Result<any, Error>): T;

  /**
   * Returns the inner value if `this` is `err`,
   * otherwise throws the inner value.
   */
  unwrapErrOrThrowOk(this: Result<Error, any>): E;

  /**
   * Returns the inner value if `this` is `ok`,
   * otherwise throwing an error with the provided message.
   *
   * @param message The message of the error to throw if `this` is `err`.
   */
  expect(message: string): T;
  /**
   * Returns the inner value if `this` is `ok`,
   * otherwise throwing the provided error.
   *
   * @param error The error to throw if `this` is `none`.
   */
  expect(error: Error): T;

  expect(message: string | Error): T;

  /**
   * Returns the inner value if `this` is `err`,
   * otherwise throwing an error with the provided message.
   *
   * @param message The message of the error to throw if `this` is `ok`.
   */
  expectErr(message: string): E;
  /**
   * Returns the inner value if `this` is `err`,
   * otherwise throwing the provided error.
   *
   * @param error The error to throw if `this` is `ok`.
   */
  expectErr(error: Error): E;

  expectErr(message: string | Error): E;

  /**
   * Returns the inner value if `this` is `ok`,
   * otherwise returns the provided default.
   *
   * @param defaultValue The value to return if `this` is `none`.
   */
  unwrapOr<D>(defaultValue: D): T | D;

  /**
   * Returns the inner value if `this` is `ok`,
   * otherwise calls the provided thunk and returns its return value.
   *
   * The thunk is called lazily (i.e., if `this` is `ok`, the thunk
   * will never be called because there is no need for a default value).
   *
   * @param defaultValueThunk A callback that returns the value to return if `this` is `err`.
   */
  unwrapOrElse<D>(defaultValueThunk: (error: E) => D): T | D;

  /**
   * Returns the provided option if `this` is `some`,
   * otherwise returns `Option.none()`.
   *
   * @param other The `Option` to return if `this` is `some`.
   */
  and<T2, E2>(other: Result<T2, E2>): Result<T2, E | E2>;

  /**
   * If `this` is `ok`, calls the provided callback with the inner value
   * and returns the callback's return value.
   * Otherwise, returns `this`.
   *
   * The callback is called lazily (i.e., if `this` is `err`, the callback
   * will never be called).
   *
   * @param flatMapper A function that returns an `Result` to return if `this` is `some`.
   */
  andThen<T2, E2>(flatMapper: (value: T) => Result<T2, E2>): Result<T2, E | E2>;

  /**
   * Returns `this` if `this` is `ok`,
   * otherwise returning the provided result.
   *
   * @param other The `Result` to return if `this` is `err`.
   */
  or<T2, E2>(other: Result<T2, E2>): Result<T | T2, E2>;

  /**
   * Returns `this` if `this` is `ok`,
   * otherwise calling the provided callback and returning its return value.
   *
   * @param otherThunk The callback to call if `this` is `err`.
   */
  orElse<T2, E2>(otherThunk: (error: E) => Result<T2, E2>): Result<T | T2, E2>;

  /**
   * Returns an empty array if `this` is `err`,
   * otherwise returns a one-item array containing
   * the inner value.
   *
   * Similar to Rust's `Result::iter()`.
   */
  array(): [] | [T];

  /**
   * Transposes a `Result` of an `Option` into an `Option` of a `Result`.
   *
   * `ok(none)` will be mapped to `none`.
   * `ok(some(t))` and `err(e)` will be mapped to `some(ok(t))` and `some(err(e))`, respectively.
   */
  transpose<U>(this: Result<Option<U>, E>): Option<Result<U, E>>;

  /**
   * If `this` is `ok`, returns the return value of the provided
   * predicate.
   * Otherwise, returns `false`.
   */
  okSatisfies(predicate: (value: T) => boolean): boolean;

  /**
   * If `this` is `err`, returns the return value of the provided
   * predicate.
   * Otherwise, returns `false`.
   */
  errSatisfies(predicate: (error: E) => boolean): boolean;

  /**
   * If this is `ok(t)`, returns `err(t)`.
   * If this is `err(e)`, so this returns `ok(e)`.
   */
  reverse(): Result<E, T>;
}
