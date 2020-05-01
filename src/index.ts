import Option from "./Option";
import OptionImpl from "./private/OptionImpl";
import Result from "./Result";
import ResultImpl from "./private/ResultImpl";

export { default as Option } from "./Option";
export { default as Result } from "./Result";

export const option = {
  /**
   * Returns a `some` variant that wraps the provided value.
   *
   * Corresponds to Rust's `Option::<T>::Some(T)`.
   */
  some<T>(value: T): Option<T> {
    return OptionImpl.some(value);
  },

  /**
   * Returns the `none` variant.
   *
   * Corresponds to Rust's `Option::None`.
   */
  none<T = never>(): Option<T> {
    return OptionImpl.none();
  },

  /**
   * Transposes an array of options into an optional array,
   * analagous to how `Promise.all()` transposes
   * an array of promises into promised array.
   *
   * If every option is `some`, this method returns `option.some(arr)`
   * where `arr` is an array of the unwrapped `Option`s.
   * Otherwise, this method returns `option.none()`.
   *
   * @param options A tuple or array of options.
   */
  all: optionDotAll,

  /**
   * Accepts one argument `t`, returning `none` if the `t`
   * is `null` or `undefined` , otherwise returning `some(t)`.
   */
  fromVoidable<T>(voidable: T | undefined | null): Option<T> {
    if (voidable === undefined || voidable === null) {
      return OptionImpl.none();
    } else {
      return OptionImpl.some(voidable);
    }
  },
};

/**
 * Transposes an array of options into an optional array,
 * analagous to how `Promise.all()` transposes
 * an array of promises into promised array.
 *
 * If every option is `some`, this method returns `option.some(arr)`
 * where `arr` is an array of the unwrapped `Option`s.
 * Otherwise, this method returns `option.none()`.
 *
 * @param options A tuple or array of options.
 */
export function optionDotAll<A>(options: [Option<A>]): Option<[A]>;
export function optionDotAll<A, B>(
  options: [Option<A>, Option<B>],
): Option<[A, B]>;
export function optionDotAll<A, B, C>(
  options: [Option<A>, Option<B>, Option<C>],
): Option<[A, B, C]>;
export function optionDotAll<A, B, C, D>(
  options: [Option<A>, Option<B>, Option<C>, Option<D>],
): Option<[A, B, C, D]>;
export function optionDotAll<A, B, C, D, E>(
  options: [Option<A>, Option<B>, Option<C>, Option<D>, Option<E>],
): Option<[A, B, C, D, E]>;
export function optionDotAll<A, B, C, D, E, F>(
  options: [Option<A>, Option<B>, Option<C>, Option<D>, Option<E>, Option<F>],
): Option<[A, B, C, D, E, F]>;
export function optionDotAll<A, B, C, D, E, F, G>(
  options: [
    Option<A>,
    Option<B>,
    Option<C>,
    Option<D>,
    Option<E>,
    Option<F>,
    Option<G>,
  ],
): Option<[A, B, C, D, E, F, G]>;
export function optionDotAll<A, B, C, D, E, F, G, H>(
  options: [
    Option<A>,
    Option<B>,
    Option<C>,
    Option<D>,
    Option<E>,
    Option<F>,
    Option<G>,
    Option<H>,
  ],
): Option<[A, B, C, D, E, F, G, H]>;

export function optionDotAll<T>(options: Option<T>[]): Option<T[]>;

export function optionDotAll<T>(options: Option<T>[]): Option<T[]> {
  let values = [];
  for (let i = 0; i < options.length; i++) {
    const option = options[i];
    if (option.isSome()) {
      values.push((option as any).value);
    } else {
      return OptionImpl.none();
    }
  }
  return OptionImpl.some(values);
}

export const result = {
  /**
   * Returns an `ok` variant that wraps the provided value.
   *
   * Corresponds to Rust's `Result::<T, E>::Ok(T)`.
   */
  ok<T, E = never>(value: T): Result<T, E> {
    return ResultImpl.ok<T, E>(value);
  },

  /**
   * Returns an `err` variant that wraps the provided value.
   *
   * Corresponds to Rust's `Result::<T, E>::Err(E)`.
   */
  err<E, T = never>(error: E): Result<T, E> {
    return ResultImpl.err<T, E>(error);
  },

  /**
   * Transposes an array of results into an result with an array,
   * analagous to how `Promise.all()` transposes
   * an array of promises into promised array.
   *
   * If every result is `ok`, this method returns `result.ok(arr)`
   * where `arr` is an array of the unwrapped `Result`s.
   * Otherwise, this method returns `result.err(e)` where `e` is
   * the error value of the first result in the array that was an `err`.
   *
   * @param results A tuple or array of results.
   */
  all: resultDotAll,
};

/**
 * Transposes an array of results into an result with an array,
 * analagous to how `Promise.all()` transposes
 * an array of promises into promised array.
 *
 * If every result is `ok`, this method returns `result.ok(arr)`
 * where `arr` is an array of the unwrapped `Result`s.
 * Otherwise, this method returns `result.err(e)` where `e` is
 * the error value of the first result in the array that was an `err`.
 *
 * @param results A tuple or array of results.
 */
export function resultDotAll<T1, E1>(
  results: [Result<T1, E1>],
): Result<[T1], E1>;
export function resultDotAll<T1, E1, T2, E2>(
  results: [Result<T1, E1>, Result<T2, E2>],
): Result<[T1, T2], E1 | E2>;
export function resultDotAll<T1, E1, T2, E2, T3, E3>(
  results: [Result<T1, E1>, Result<T2, E2>, Result<T3, E3>],
): Result<[T1, T2, T3], E1 | E2 | E3>;
export function resultDotAll<T1, E1, T2, E2, T3, E3, T4, E4>(
  results: [Result<T1, E1>, Result<T2, E2>, Result<T3, E3>, Result<T4, E4>],
): Result<[T1, T2, T3, T4], E1 | E2 | E3 | E4>;
export function resultDotAll<T1, E1, T2, E2, T3, E3, T4, E4, T5, E5>(
  results: [
    Result<T1, E1>,
    Result<T2, E2>,
    Result<T3, E3>,
    Result<T4, E4>,
    Result<T5, E5>,
  ],
): Result<[T1, T2, T3, T4, T5], E1 | E2 | E3 | E4 | E5>;
export function resultDotAll<T1, E1, T2, E2, T3, E3, T4, E4, T5, E5, T6, E6>(
  results: [
    Result<T1, E1>,
    Result<T2, E2>,
    Result<T3, E3>,
    Result<T4, E4>,
    Result<T5, E5>,
    Result<T6, E6>,
  ],
): Result<[T1, T2, T3, T4, T5, T6], E1 | E2 | E3 | E4 | E5 | E6>;
export function resultDotAll<
  T1,
  E1,
  T2,
  E2,
  T3,
  E3,
  T4,
  E4,
  T5,
  E5,
  T6,
  E6,
  T7,
  E7
>(
  results: [
    Result<T1, E1>,
    Result<T2, E2>,
    Result<T3, E3>,
    Result<T4, E4>,
    Result<T5, E5>,
    Result<T6, E6>,
    Result<T7, E7>,
  ],
): Result<[T1, T2, T3, T4, T5, T6, T7], E1 | E2 | E3 | E4 | E5 | E6 | E7>;
export function resultDotAll<
  T1,
  E1,
  T2,
  E2,
  T3,
  E3,
  T4,
  E4,
  T5,
  E5,
  T6,
  E6,
  T7,
  E7,
  T8,
  E8
>(
  results: [
    Result<T1, E1>,
    Result<T2, E2>,
    Result<T3, E3>,
    Result<T4, E4>,
    Result<T5, E5>,
    Result<T6, E6>,
    Result<T7, E7>,
    Result<T8, E8>,
  ],
): Result<
  [T1, T2, T3, T4, T5, T6, T7, T8],
  E1 | E2 | E3 | E4 | E5 | E6 | E7 | E8
>;

export function resultDotAll<T, E>(results: Result<T, E>[]): Result<T[], E>;

export function resultDotAll<T, E>(results: Result<T, E>[]): Result<T[], E> {
  let values = [];
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.isOk()) {
      values.push(result.safeUnwrap());
    } else {
      return result as Result<never, E>;
    }
  }
  return ResultImpl.ok(values);
}
