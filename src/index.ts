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
   * If every option is `some`, this method returns `Option.some(arr)`
   * where `arr` is an array of the unwrapped `Option`s.
   * Otherwise, this method returns `Option.none()`.
   *
   * @param options A tuple or array of options.
   */
  all: optionDotAll,
};

/**
 * Transposes an array of options into an optional array,
 * analagous to how `Promise.all()` transposes
 * an array of promises into promised array.
 *
 * If every option is `some`, this method returns `Option.some(arr)`
 * where `arr` is an array of the unwrapped `Option`s.
 * Otherwise, this method returns `Option.none()`.
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
};
