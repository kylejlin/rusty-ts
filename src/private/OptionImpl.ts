import Option from "../Option";
import Result from "../Result";
import ResultImpl from "./ResultImpl";
import UnwrapError from "./UnwrapError";

export default class OptionImpl<T> implements Option<T> {
  private constructor(private isNone_: boolean, private value: T | undefined) {}

  static some<T>(value: T): Option<T> {
    return new OptionImpl(false, value);
  }

  static none<T>(): Option<T> {
    return new OptionImpl<T>(true, undefined);
  }

  match<N, S>(matcher: { none: () => N; some: (value: T) => S }): N | S {
    if (this.isNone()) {
      return matcher.none();
    } else {
      return matcher.some(this.value as T);
    }
  }

  isNone(): boolean {
    return this.isNone_;
  }

  isSome(): boolean {
    return !this.isNone();
  }

  map<R>(mapper: (value: T) => R): Option<R> {
    return this.match({
      none: () => (this as unknown) as OptionImpl<never>,
      some: value => OptionImpl.some(mapper(value)),
    });
  }

  ifSome(executor: (value: T) => void): void {
    this.map(executor);
  }

  ifNone(executor: () => void): void {
    if (this.isNone()) {
      executor();
    }
  }

  unwrap(): T {
    return this.expect("Tried to call unwrap() on option.none()");
  }

  expect(message: string): T;

  expect(error: Error): T;

  expect(message: string | Error): T {
    return this.match({
      none: () => {
        const error =
          "string" === typeof message ? new UnwrapError(message) : message;
        throw error;
      },
      some: value => value,
    });
  }

  unwrapOr<D>(defaultValue: D): T | D {
    return this.match({
      none: () => defaultValue,
      some: value => value,
    });
  }

  unwrapOrElse<D>(defaultValueThunk: () => D): T | D {
    return this.match({
      none: () => defaultValueThunk(),
      some: value => value,
    });
  }

  and<U>(other: Option<U>): Option<U> {
    return this.match({
      none: () => OptionImpl.none(),
      some: () => other,
    });
  }

  andThen<U>(flatMapper: (value: T) => Option<U>): Option<U> {
    return this.match({
      none: () => OptionImpl.none(),
      some: flatMapper,
    });
  }

  or<U>(other: Option<U>): Option<T | U> {
    return this.match({
      none: () => other,
      some: () => this,
    });
  }

  orElse<U>(otherThunk: () => Option<U>): Option<T | U> {
    return this.match({
      none: otherThunk,
      some: () => this,
    });
  }

  filter(predicate: (value: T) => boolean): Option<T> {
    return this.andThen(value => (predicate(value) ? this : OptionImpl.none()));
  }

  flatten<U>(this: Option<Option<U>>): Option<U> {
    return this.andThen(innerOption => innerOption);
  }

  array(): T[] {
    return this.match({ none: () => [], some: value => [value] });
  }

  xor<U>(other: Option<U>): Option<T | U> {
    return this.match({
      none: () => other,
      some: () =>
        other.match({
          none: () => this,
          some: () => OptionImpl.none(),
        }),
    });
  }

  transpose<U, E>(this: Option<Result<U, E>>): Result<Option<U>, E> {
    return this.match({
      none: () => ResultImpl.ok(OptionImpl.none()),
      some: res =>
        res.match({
          ok: t => ResultImpl.ok(OptionImpl.some(t)),
          err: e => ResultImpl.err(e),
        }),
    });
  }

  equalsSome(other: T): boolean {
    return this.match({
      none: () => false,
      some: v => v === other,
    });
  }

  someSatisfies(predicate: (val: T) => boolean): boolean {
    return this.match({
      none: () => false,
      some: predicate,
    });
  }
}
