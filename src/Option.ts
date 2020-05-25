import Result from "./Result";

/**
 * A wrapper representing a value that may be missing.
 */
export default interface Option<T> {
  /**
   * Accepts an object with two callbacks.
   * One will be called if `this` is `none`.
   * The other will be called with the value
   * that `this` wraps if `this` is `some`.
   *
   * Returns the return value of whichever callback
   * gets called.
   *
   * @param matcher An object with callbacks for `none` and `some`.
   */
  match<N, S>(matcher: { none: () => N; some: (value: T) => S }): N | S;

  isNone(): boolean;

  isSome(): boolean;

  /**
   * Returns `Option.none()` if `this` is `none`,
   * and `Option.some(mapper(x))` where `x` is
   * the value that `this` wraps.
   *
   * @param mapper A function that will be called if `this` is `some`.
   */
  map<R>(mapper: (value: T) => R): Option<R>;

  /**
   * Calls the provided callback with the value that `this` wraps
   * if `this` is `some`.
   *
   * This method is the same as `Option.prototype.map()`
   * except that it discards the value returned by
   * the callback, unconditionally returning undefined.
   *
   * @param executor A callback that will be called if `this` is `some`.
   */
  ifSome(executor: (value: T) => void): void;

  /**
   * Calls the provided callback if `this` is `none`.
   *
   * @param executor A callback that will be called if `this` is `none`.
   */
  ifNone(executor: () => void): void;

  /**
   * Returns the value that `this` wraps if `this` is `some`,
   * otherwise throwing an `UnwrapError`.
   */
  unwrap(): T;

  /**
   * Returns the value that `this` wraps if `this` is `some`,
   * otherwise throwing an `UnwrapError` with the provided message.
   *
   * @param message The message of the `UnwrapError` to throw if `this` is `none`.
   */
  expect(message: string): T;
  /**
   * Returns the value that `this` wraps if `this` is `some`,
   * otherwise throwing the provided error.
   *
   * @param error The error to throw if `this` is `none`.
   */
  expect(error: Error): T;

  expect(message: string | Error): T;

  /**
   * Returns the value that `this` wraps if `this` is `some`,
   * otherwise returns the provided default.
   *
   * @param defaultValue The value to return if `this` is `none`.
   */
  unwrapOr<D>(defaultValue: D): T | D;

  /**
   * Returns the value that `this` wraps if `this` is `some`,
   * otherwise calls the provided thunk and returns its return value.
   *
   * The thunk is called lazily (i.e., if `this` is `some`, the thunk
   * will never be called because there is no need for a default value).
   *
   * @param defaultValueThunk A callback that returns the value to return if `this` is `none`.
   */
  unwrapOrElse<D>(defaultValueThunk: () => D): T | D;

  /**
   * Returns the provided option if `this` is `some`,
   * otherwise returns `Option.none()`.
   *
   * @param other The `Option` to return if `this` is `some`.
   */
  and<U>(other: Option<U>): Option<U>;

  /**
   * If `this` is `some`, calls the provided callback with the value
   * that `this` wraps and returns the callback's return value.
   * Otherwise, returns `Option.none()`.
   *
   * The callback is called lazily (i.e., if `this` is `none`, the callback
   * will never be called).
   *
   * @param flatMapper A function that returns an `Option` to return if `this` is `some`.
   */
  andThen<U>(flatMapper: (value: T) => Option<U>): Option<U>;

  /**
   * Returns `this` if `this` is `some`,
   * otherwise returning the provided option.
   *
   * @param other The `Option` to return if `this` is `none`.
   */
  or<U>(other: Option<U>): Option<T | U>;

  /**
   * Returns `this` if `this` is `some`,
   * otherwise calling the provided callback and returning its return value.
   *
   * @param otherThunk The callback to call if `this` is `none`.
   */
  orElse<U>(otherThunk: () => Option<U>): Option<T | U>;

  /**
   * Returns `Option.none()` if `this` is `none`,
   * otherwise calls the provided predicate with the value
   * that `this` wraps and returns `this` if the predicate returns true
   * and `Option.none()` if the predicate returns false.
   *
   * @param predicate The callback that returns whether to keep the wrapped value.
   */
  filter(predicate: (value: T) => boolean): Option<T>;

  /**
   * Converts from `Option<Option<U>>` to `Option<U>`.
   * Only removes one level of nesting.
   */
  flatten<U>(this: Option<Option<U>>): Option<U>;

  /**
   * Returns an empty array if `this` is `none`,
   * otherwise returns a one-item array containing
   * the value that `this` wraps.
   *
   * Similar to Rust's `Option::iter()`.
   */
  array(): T[];

  /**
   * Returns the `Option` that is `some` if exactly one of
   * `[this, other]` is `some`, otherwise returns `Option.none()`.
   */
  xor<U>(other: Option<U>): Option<T | U>;

  /**
   * Transposes an `Option` of a `Result` into a `Result` of an `Option`.
   *
   * `none` will be mapped to `ok(none)`.
   * `some(ok(t))` and `some(err(e))` will be mapped to `ok(some(t))` and `err(e)`, respectively.
   */
  transpose<U, E>(this: Option<Result<U, E>>): Result<Option<U>, E>;

  /**
   * Returns false if `this` is `none`,
   * otherwise returns whether the value that `this`
   * wraps equals the provided value (equality is
   * determined using `===`).
   *
   * In other words, this method returns true if and only if
   * `this` is `some(v)` and `v === other`.
   */
  equalsSome(other: T): boolean;

  /**
   * Returns false if `this` is `none`,
   * otherwise returns whether the value that `this`
   * wraps satisfies the provided predicate.
   *
   * In other words, this method returns true if and only if
   * `this` is `some(v)` and `predicate(v)` is `true`.
   *
   * @param predicate The callback to call if `this`
   * is `some`.
   */
  someSatisfies(predicate: (val: T) => boolean): boolean;
}
