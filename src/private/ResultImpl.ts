import Option from "../Option";
import OptionImpl from "./OptionImpl";
import Result from "../Result";
import UnwrapError from "./UnwrapError";

export default class ResultImpl<T, E> implements Result<T, E> {
  private constructor(private isErr_: boolean, private value: T | E) {}

  static ok<T, E>(value: T): ResultImpl<T, E> {
    return new ResultImpl<T, E>(false, value);
  }

  static err<T, E>(error: E): ResultImpl<T, E> {
    return new ResultImpl<T, E>(true, error);
  }

  match<U, V>(matcher: { ok: (value: T) => U; err: (error: E) => V }): U | V {
    if (this.isErr_) {
      return matcher.err(this.value as E);
    } else {
      return matcher.ok(this.value as T);
    }
  }

  ok(): Option<T> {
    return this.match({
      ok: t => OptionImpl.some(t),
      err: () => OptionImpl.none(),
    });
  }

  err(): Option<E> {
    return this.match({
      ok: () => OptionImpl.none(),
      err: e => OptionImpl.some(e),
    });
  }

  isOk(): boolean {
    return !this.isErr_;
  }

  isErr(): boolean {
    return this.isErr_;
  }

  map<T2>(mapper: (value: T) => T2): Result<T2, E> {
    return this.match({
      ok: t => ResultImpl.ok(mapper(t)),
      err: () => (this as unknown) as Result<never, E>,
    });
  }

  mapErr<E2>(mapper: (error: E) => E2): Result<T, E2> {
    return this.match({
      err: e => ResultImpl.err(mapper(e)),
      ok: () => (this as unknown) as Result<T, never>,
    });
  }

  ifOk(executor: (value: T) => void): void {
    this.map(executor);
  }

  ifErr(executor: (error: E) => void): void {
    this.mapErr(executor);
  }

  unwrap(): T {
    return this.expect("Tried to call unwrap() on result.err()");
  }

  safeUnwrap(this: Result<any, never>): T {
    return (this as any).value;
  }

  unwrapErr(): E {
    return this.expectErr("Tried to call unwrapErr() on result.ok()");
  }

  unwrapOrThrowErr(this: Result<any, Error>): T {
    return this.match({
      ok: t => t,
      err: e => {
        throw e;
      },
    });
  }

  unwrapErrOrThrowOk(this: Result<Error, any>): E {
    return this.match({
      ok: t => {
        throw t;
      },
      err: e => e,
    });
  }

  expect(message: string | Error): T {
    return this.match({
      ok: value => value,
      err: () => {
        const error =
          "string" === typeof message ? new UnwrapError(message) : message;
        throw error;
      },
    });
  }

  expectErr(message: string | Error): E {
    return this.match({
      ok: () => {
        const error =
          "string" === typeof message ? new UnwrapError(message) : message;
        throw error;
      },
      err: value => value,
    });
  }

  unwrapOr<D>(defaultValue: D): T | D {
    return this.match({
      ok: value => value,
      err: () => defaultValue,
    });
  }

  unwrapOrElse<D>(defaultValueThunk: (error: E) => D): T | D {
    return this.match({
      ok: value => value,
      err: () => defaultValueThunk(this.value as E),
    });
  }

  and<T2, E2>(other: Result<T2, E2>): Result<T2, E | E2> {
    return this.match({
      ok: () => other,
      err: () => (this as unknown) as Result<never, E>,
    });
  }

  andThen<T2, E2>(
    flatMapper: (value: T) => Result<T2, E2>,
  ): Result<T2, E | E2> {
    return this.match({
      ok: flatMapper,
      err: () => (this as unknown) as Result<never, E>,
    });
  }

  or<T2, E2>(other: Result<T2, E2>): Result<T | T2, E2> {
    return this.match({
      ok: () => (this as unknown) as Result<T, never>,
      err: () => other,
    });
  }

  orElse<T2, E2>(otherThunk: (error: E) => Result<T2, E2>): Result<T | T2, E2> {
    return this.match({
      ok: () => (this as unknown) as Result<T, never>,
      err: otherThunk,
    });
  }

  array(): [] | [T] {
    return this.match({
      ok: t => [t],
      err: () => [],
    });
  }

  transpose<U>(this: Result<Option<U>, E>): Option<Result<U, E>> {
    return this.match({
      ok: opt =>
        opt.match({
          some: t => OptionImpl.some(ResultImpl.ok(t)),
          none: () => OptionImpl.none(),
        }),
      err: e => OptionImpl.some(ResultImpl.err(e)),
    });
  }

  okSatisfies(predicate: (value: T) => boolean): boolean {
    return this.ok().match({
      some: predicate,
      none: () => false,
    });
  }

  errSatisfies(predicate: (error: E) => boolean): boolean {
    return this.err().match({
      some: predicate,
      none: () => false,
    });
  }

  reverse(): Result<E, T> {
    return this.match({
      ok: t => ResultImpl.err(t),
      err: e => ResultImpl.ok(e),
    });
  }
}
