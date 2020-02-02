import { option, Result } from "../src";

export interface ResultFactory {
  ok<T, E = never>(value: T): Result<T, E>;
  err<E, T = never>(error: E): Result<T, E>;
}

/**
 * Can be used to test any implementation of `Result`—simply
 * pass in a factory that creates instances of the implementation
 * you want to test.
 */
export function testResultImpl(result: ResultFactory) {
  test("Result.prototype.match() calls correct callback", () => {
    function getMatcher() {
      return {
        err: jest.fn(error => -error),
        ok: jest.fn(x => x.toUpperCase()),
      };
    }

    const matcher1 = getMatcher();
    expect(result.ok("foo").match(matcher1)).toBe("FOO");
    expect(matcher1.ok.mock.calls.length).toBe(1);
    expect(matcher1.ok.mock.calls[0]).toEqual(["foo"]);
    expect(matcher1.err.mock.calls.length).toBe(0);

    const matcher2 = getMatcher();
    expect(result.err(9).match(matcher2)).toBe(-9);
    expect(matcher2.err.mock.calls.length).toBe(1);
    expect(matcher2.err.mock.calls[0]).toEqual([9]);
    expect(matcher2.ok.mock.calls.length).toBe(0);
  });

  test("result.ok()", () => {
    result.ok(42);
    result.ok("foo");
    result.ok({});
    result.ok([]);
    result.ok(null);
    result.ok(undefined);
  });

  test("result.err()", () => {
    result.err(42);
    result.err("bar");
    result.err({});
    result.err([]);
    result.err(null);
    result.err(undefined);
  });

  test("Result.prototype.ok()", () => {
    expect(result.ok(42).ok()).toEqual(option.some(42));
    expect(result.err("bar").ok()).toEqual(option.none());
  });

  test("Result.prototype.err()", () => {
    expect(result.ok("foo").err()).toEqual(option.none());
    expect(result.err("bar").err()).toEqual(option.some("bar"));
  });

  test("Result.prototype.isOk()", () => {
    [
      result.ok(42),
      result.ok("foo"),
      result.ok({}),
      result.ok([]),
      result.ok(null),
      result.ok(undefined),
    ].forEach(o => {
      expect(o.isOk()).toBe(true);
    });

    [
      result.err(42),
      result.err("bar"),
      result.err({}),
      result.err([]),
      result.err(null),
      result.err(undefined),
    ].forEach(o => {
      expect(o.isOk()).toBe(false);
    });
  });

  test("Result.prototype.isErr()", () => {
    [
      result.ok(42),
      result.ok("foo"),
      result.ok({}),
      result.ok([]),
      result.ok(null),
      result.ok(undefined),
    ].forEach(o => {
      expect(o.isErr()).toBe(false);
    });

    [
      result.err(42),
      result.err("bar"),
      result.err({}),
      result.err([]),
      result.err(null),
      result.err(undefined),
    ].forEach(o => {
      expect(o.isErr()).toBe(true);
    });
  });

  test("Result.prototype.map() only calls callback if `this` is ok", () => {
    const mapper1 = jest.fn(x => x * 3);
    expect(
      result
        .ok(4)
        .map(mapper1)
        .unwrap(),
    ).toBe(12);
    expect(mapper1.mock.calls[0]).toEqual([4]);

    const mapper2 = jest.fn(x => x * 3);
    expect(
      result
        .err("bar")
        .map(mapper2)
        .isErr(),
    ).toBe(true);
    expect(mapper2.mock.calls.length).toBe(0);
  });

  test("Result.prototype.mapErr() only calls callback if `this` is err", () => {
    const mapper1 = jest.fn(x => x * 3);
    expect(
      result
        .ok(4)
        .map(mapper1)
        .unwrap(),
    ).toBe(12);
    expect(mapper1.mock.calls[0]).toEqual([4]);

    const mapper2 = jest.fn(x => x * 3);
    expect(
      result
        .err("bar")
        .map(mapper2)
        .isErr(),
    ).toBe(true);
    expect(mapper2.mock.calls.length).toBe(0);
  });

  test("Result.prototype.ifOk() only calls callback if `this` is ok", () => {
    const callback1 = jest.fn(() => {});
    result.ok("foo").ifOk(callback1);
    expect(callback1.mock.calls[0]).toEqual(["foo"]);

    const callback2 = jest.fn(() => {});
    result.err("bar").ifOk(callback2);
    expect(callback2.mock.calls.length).toBe(0);
  });

  test("Result.prototype.ifErr() only calls callback if `this` is err", () => {
    const callback1 = jest.fn(() => {});
    result.ok("foo").ifErr(callback1);
    expect(callback1.mock.calls.length).toBe(0);

    const callback2 = jest.fn(() => {});
    result.err("bar").ifErr(callback2);
    expect(callback2.mock.calls[0]).toEqual(["bar"]);
  });

  test("Result.prototype.unwrap() returns wrapped value if `this` is ok", () => {
    expect(result.ok("foo").unwrap()).toBe("foo");
  });

  test("Result.prototype.unwrap() throws an UnwrapError with the correct message if `this` is err", () => {
    // `expect(...).toThrowError(expectedErr)` doesn't check if
    //     actualErr.name == expectedErr.name.
    //     Hence, we must manually verify this.
    let error: Error | undefined;
    try {
      result.err("bar").unwrap();
    } catch (e) {
      error = e;
    }
    expect(error).not.toBe(undefined);
    expect(error!.name).toBe("UnwrapError");
    expect(error!.message).toBe("Tried to call unwrap() on result.err()");
  });

  test("Result.prototype.safeUnwrap", () => {
    const res: Result<string, never> = result.ok("foo");
    expect(res.safeUnwrap()).toBe("foo");
  });

  test("Result.prototype.unwrapErr() returns wrapped value if `this` is err", () => {
    expect(result.err("bar").unwrapErr()).toBe("bar");
  });

  test("Result.prototype.unwrapErr() throws an UnwrapError with the correct message if `this` is ok", () => {
    // `expect(...).toThrowError(expectedErr)` doesn't check if
    //     actualErr.name == expectedErr.name.
    //     Hence, we must manually verify this.
    let error: Error | undefined;
    try {
      result.ok("foo").unwrapErr();
    } catch (e) {
      error = e;
    }
    expect(error).not.toBe(undefined);
    expect(error!.name).toBe("UnwrapError");
    expect(error!.message).toBe("Tried to call unwrapErr() on result.ok()");
  });

  test("Result.prototype.unwrapOrThrowErr() returns the wrapped value if `this` is ok", () => {
    const res: Result<string, Error> = result.ok("foo");
    expect(res.unwrapOrThrowErr()).toBe("foo");
  });

  test("Result.prototype.unwrapOrThrowErr() throws the wrapped value if `this` is err", () => {
    const res: Result<string, Error> = result.err(new Error("foo"));
    expect(() => {
      res.unwrapOrThrowErr();
    }).toThrow("foo");
  });

  test("Result.prototype.unwrapErrOrThrowOk() returns the wrapped value if `this` is err", () => {
    const res: Result<Error, string> = result.err("bar");
    expect(res.unwrapErrOrThrowOk()).toBe("bar");
  });

  test("Result.prototype.unwrapErrOrThrowOk() throws the wrapped value if `this` is ok", () => {
    const res: Result<Error, string> = result.ok(new Error("foo"));
    expect(() => {
      res.unwrapErrOrThrowOk();
    }).toThrow("foo");
  });

  test("Result.prototype.expect() returns wrapped value if `this` is ok", () => {
    expect(result.ok("foo").expect("Oh noes!")).toBe("foo");
  });

  test("Result.prototype.expect() throws the provided error message wrapped in an UnwrapError if the message is a string", () => {
    // `expect(...).toThrowError(expectedErr)` doesn't check if
    //     actualErr.name == expectedErr.name.
    //     Hence, we must manually verify this.
    let error: Error | undefined;
    try {
      result.err("bar").expect("Oh noes!");
    } catch (e) {
      error = e;
    }
    expect(error).not.toBe(undefined);
    expect(error!.name).toBe("UnwrapError");
    expect(error!.message).toBe("Oh noes!");
  });

  test("Result.prototype.expect() throws the provided error as is if it is an instance of Error", () => {
    // `expect(...).toThrowError(expectedErr)` doesn't use ===
    //     to compared actualErr against expectedErr
    //     Hence, we must manually verify this.
    const providedError = new Error("Oh noes!");
    let actualError: Error | undefined;
    try {
      result.err("bar").expect(providedError);
    } catch (e) {
      actualError = e;
    }
    expect(actualError).toBe(providedError);
  });

  test("Result.prototype.expectErr() returns wrapped value if `this` is err", () => {
    expect(result.err("bar").expectErr("Oh noes!")).toBe("bar");
  });

  test("Result.prototype.expectErr() throws the provided error message wrapped in an UnwrapError if the message is a string", () => {
    // `expect(...).toThrowError(expectedErr)` doesn't check if
    //     actualErr.name == expectedErr.name.
    //     Hence, we must manually verify this.
    let error: Error | undefined;
    try {
      result.ok("foo").expectErr("Oh noes!");
    } catch (e) {
      error = e;
    }
    expect(error).not.toBe(undefined);
    expect(error!.name).toBe("UnwrapError");
    expect(error!.message).toBe("Oh noes!");
  });

  test("Result.prototype.expectErr() throws the provided error as is if it is an instance of Error", () => {
    // `expect(...).toThrowError(expectedErr)` doesn't use ===
    //     to compared actualErr against expectedErr
    //     Hence, we must manually verify this.
    const providedError = new Error("Oh noes!");
    let actualError: Error | undefined;
    try {
      result.ok("foo").expectErr(providedError);
    } catch (e) {
      actualError = e;
    }
    expect(actualError).toBe(providedError);
  });

  test("Result.prototype.unwrapOr() returns wrapped value if `this` is ok", () => {
    expect(result.ok(42).unwrapOr(-19)).toBe(42);
  });

  test("Result.prototype.unwrapOr() returns the provided default value if `this` is err", () => {
    expect(result.err("bar").unwrapOr(-19)).toBe(-19);
  });

  test("Result.prototype.unwrapOrElse() only calls the provided thunk if `this` is err", () => {
    const thunk1 = jest.fn(() => -19);
    expect(result.ok(42).unwrapOrElse(thunk1)).toBe(42);
    expect(thunk1.mock.calls.length).toBe(0);

    const thunk2 = jest.fn(() => -19);
    expect(result.err("bar").unwrapOrElse(thunk2)).toBe(-19);
    expect(thunk2.mock.calls.length).toBe(1);
  });

  test("Result.prototype.and()", () => {
    expect(result.ok("foo").and(result.ok(42))).toEqual(result.ok(42));
    expect(result.ok("foo").and(result.err("bar"))).toEqual(result.err("bar"));
    expect(result.err("bar").and(result.ok(42))).toEqual(result.err("bar"));
    expect(result.err("bar").and(result.err("bar"))).toEqual(result.err("bar"));
  });

  test("Result.prototype.andThen() only calls the provided flat mapper if `this` is ok", () => {
    const firstChar = jest.fn(
      (s: string): Result<string, Error> => {
        return s.length === 0
          ? result.err(new Error("Empty string"))
          : result.ok(s.charAt(0));
      },
    );

    expect(result.err(new Error("No string")).andThen(firstChar)).toEqual(
      result.err(new Error("No string")),
    );
    expect(firstChar.mock.calls.length).toBe(0);
    expect(result.ok("foo").andThen(firstChar)).toEqual(result.ok("f"));
    expect(firstChar.mock.calls).toEqual([["foo"]]);
    expect(result.ok("").andThen(firstChar)).toEqual(
      result.err(new Error("Empty string")),
    );
    expect(firstChar.mock.calls).toEqual([["foo"], [""]]);
  });

  test("Result.prototype.or()", () => {
    expect(result.ok("foo").or(result.ok(42))).toEqual(result.ok("foo"));
    expect(result.ok("foo").or(result.err("bar"))).toEqual(result.ok("foo"));
    expect(result.err("bar").or(result.ok(42))).toEqual(result.ok(42));
    expect(result.err("bar").or(result.err("bar"))).toEqual(result.err("bar"));
  });

  test("Result.prototype.orElse() only calls the provided callback if `this` is err", () => {
    const getOk = jest.fn(() => result.ok(42));

    expect(result.ok("foo").orElse(getOk)).toEqual(result.ok("foo"));
    expect(getOk.mock.calls.length).toBe(0);

    expect(result.err("bar").orElse(getOk)).toEqual(result.ok(42));
    expect(getOk.mock.calls[0]).toEqual(["bar"]);

    const getErr = jest.fn(() => result.err("bar"));

    expect(result.ok("foo").orElse(getErr)).toEqual(result.ok("foo"));
    expect(getErr.mock.calls.length).toBe(0);

    expect(result.err("bar").orElse(getErr)).toEqual(result.err("bar"));
    expect(getErr.mock.calls[0]).toEqual(["bar"]);
  });

  test("Result.prototype.array()", () => {
    expect(result.err("bar").array()).toEqual([]);
    expect(result.ok("foo").array()).toEqual(["foo"]);
  });

  test("Result.prototype.transpose()", () => {
    expect(result.ok(option.none()).transpose()).toEqual(option.none());

    expect(result.ok(option.some("foo")).transpose()).toEqual(
      option.some(result.ok("foo")),
    );
    expect(result.err("bar").transpose()).toEqual(
      option.some(result.err("bar")),
    );
  });

  test("Result.prototype.okSatisfies()", () => {
    expect(result.ok(9).okSatisfies(x => x > 0)).toBe(true);
    expect(result.ok(-9).okSatisfies(x => x > 0)).toBe(false);
    expect(result.err("bar").okSatisfies(x => x > 0)).toBe(false);
  });

  test("Result.prototype.errSatisfies()", () => {
    expect(result.err(9).errSatisfies(x => x > 0)).toBe(true);
    expect(result.err(-9).errSatisfies(x => x > 0)).toBe(false);
    expect(result.ok("bar").errSatisfies(x => x > 0)).toBe(false);
  });

  test("Result.prototype.reverse()", () => {
    expect(result.ok("foo").reverse()).toEqual(result.err("foo"));
    expect(result.err("bar").reverse()).toEqual(result.ok("bar"));
  });
}
