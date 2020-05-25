import { Option, result } from "../src";

export interface OptionFactory {
  some<T>(value: T): Option<T>;
  none<T = never>(): Option<T>;
}

/**
 * Can be used to test any implementation of `Option`—simply
 * pass in a factory that creates instances of the implementation
 * you want to test.
 */
export function testOptionImpl(option: OptionFactory) {
  test("option.some()", () => {
    option.some(42);
    option.some("foo");
    option.some({});
    option.some([]);
    option.some(null);
    option.some(undefined);
  });

  test("option.none()", () => {
    option.none();
  });

  test("Option.prototype.isSome()", () => {
    [
      option.some(42),
      option.some("foo"),
      option.some({}),
      option.some([]),
      option.some(null),
      option.some(undefined),
    ].forEach(o => {
      expect(o.isSome()).toBe(true);
    });

    expect(option.none().isSome()).toBe(false);
  });

  test("Option.prototype.isNone()", () => {
    [
      option.some(42),
      option.some("foo"),
      option.some({}),
      option.some([]),
      option.some(null),
      option.some(undefined),
    ].forEach(o => {
      expect(o.isNone()).toBe(false);
    });

    expect(option.none().isNone()).toBe(true);
  });

  test("Option.prototype.match() calls correct callback", () => {
    function getMatcher() {
      return {
        none: jest.fn(() => -1),
        some: jest.fn(x => x.toUpperCase()),
      };
    }

    const matcher1 = getMatcher();
    expect(option.some("foo").match(matcher1)).toBe("FOO");
    expect(matcher1.some.mock.calls.length).toBe(1);
    expect(matcher1.some.mock.calls[0]).toEqual(["foo"]);
    expect(matcher1.none.mock.calls.length).toBe(0);

    const matcher2 = getMatcher();
    expect(option.none().match(matcher2)).toBe(-1);
    expect(matcher2.none.mock.calls.length).toBe(1);
    expect(matcher2.none.mock.calls[0]).toEqual([]);
    expect(matcher2.some.mock.calls.length).toBe(0);
  });

  test("Option.prototype.map() only calls callback if `this` is some", () => {
    const mapper1 = jest.fn(x => x * 3);
    expect(
      option
        .some(4)
        .map(mapper1)
        .unwrap(),
    ).toBe(12);
    expect(mapper1.mock.calls[0]).toEqual([4]);

    const mapper2 = jest.fn(x => x * 3);
    expect(
      option
        .none()
        .map(mapper2)
        .isNone(),
    ).toBe(true);
    expect(mapper2.mock.calls.length).toBe(0);
  });

  test("Option.prototype.ifSome() only calls callback if `this` is some", () => {
    const callback1 = jest.fn(() => {});
    option.some("foo").ifSome(callback1);
    expect(callback1.mock.calls[0]).toEqual(["foo"]);

    const callback2 = jest.fn(() => {});
    option.none().ifSome(callback2);
    expect(callback2.mock.calls.length).toBe(0);
  });

  test("Option.prototype.ifNone() only calls callback if `this` is none", () => {
    const callback1 = jest.fn(() => {});
    option.some("foo").ifNone(callback1);
    expect(callback1.mock.calls.length).toBe(0);

    const callback2 = jest.fn(() => {});
    option.none().ifNone(callback2);
    expect(callback2.mock.calls.length).toBe(1);
  });

  test("Option.prototype.unwrap() returns wrapped value if `this` is some", () => {
    expect(option.some("foo").unwrap()).toBe("foo");
  });

  test("Option.prototype.unwrap() throws an UnwrapError with the correct message if `this` is none", () => {
    // `expect(...).toThrowError(expectedErr)` doesn't check if
    //     actualErr.name == expectedErr.name.
    //     Hence, we must manually verify this.
    let error: Error | undefined;
    try {
      option.none().unwrap();
    } catch (e) {
      error = e;
    }
    expect(error).not.toBe(undefined);
    expect(error!.name).toBe("UnwrapError");
    expect(error!.message).toBe("Tried to call unwrap() on option.none()");
  });

  test("Option.prototype.expect() returns wrapped value if `this` is some", () => {
    expect(option.some("foo").expect("Oh noes!")).toBe("foo");
  });

  test("Option.prototype.expect() throws the provided error message wrapped in an UnwrapError if the message is a string", () => {
    // `expect(...).toThrowError(expectedErr)` doesn't check if
    //     actualErr.name == expectedErr.name.
    //     Hence, we must manually verify this.
    let error: Error | undefined;
    try {
      option.none().expect("Oh noes!");
    } catch (e) {
      error = e;
    }
    expect(error).not.toBe(undefined);
    expect(error!.name).toBe("UnwrapError");
    expect(error!.message).toBe("Oh noes!");
  });

  test("Option.prototype.expect() throws the provided error as is if it is an instance of Error", () => {
    // `expect(...).toThrowError(expectedErr)` doesn't use ===
    //     to compared actualErr against expectedErr
    //     Hence, we must manually verify this.
    const providedError = new Error("Oh noes!");
    let actualError: Error | undefined;
    try {
      option.none().expect(providedError);
    } catch (e) {
      actualError = e;
    }
    expect(actualError).toBe(providedError);
  });

  test("Option.prototype.unwrapOr() returns wrapped value if `this` is some", () => {
    expect(option.some(42).unwrapOr(-19)).toBe(42);
  });

  test("Option.prototype.unwrapOr() returns the provided default value if `this` is none", () => {
    expect(option.none().unwrapOr(-19)).toBe(-19);
  });

  test("Option.prototype.unwrapOrElse() only calls the provided thunk if `this` is none", () => {
    const thunk1 = jest.fn(() => -19);
    expect(option.some(42).unwrapOrElse(thunk1)).toBe(42);
    expect(thunk1.mock.calls.length).toBe(0);

    const thunk2 = jest.fn(() => -19);
    expect(option.none().unwrapOrElse(thunk2)).toBe(-19);
    expect(thunk2.mock.calls.length).toBe(1);
  });

  test("Option.prototype.and()", () => {
    expect(option.some("foo").and(option.some(42))).toEqual(option.some(42));
    expect(option.some("foo").and(option.none())).toEqual(option.none());
    expect(option.none().and(option.some(42))).toEqual(option.none());
    expect(option.none().and(option.none())).toEqual(option.none());
  });

  test("Option.prototype.andThen() only calls the provided flat mapper if `this` is some", () => {
    const firstChar = jest.fn(
      (s: string): Option<string> => {
        return s.length === 0 ? option.none() : option.some(s.charAt(0));
      },
    );

    expect(option.none().andThen(firstChar)).toEqual(option.none());
    expect(firstChar.mock.calls.length).toBe(0);
    expect(option.some("foo").andThen(firstChar)).toEqual(option.some("f"));
    expect(firstChar.mock.calls).toEqual([["foo"]]);
    expect(option.some("").andThen(firstChar)).toEqual(option.none());
    expect(firstChar.mock.calls).toEqual([["foo"], [""]]);
  });

  test("Option.prototype.or()", () => {
    expect(option.some("foo").or(option.some(42))).toEqual(option.some("foo"));
    expect(option.some("foo").or(option.none())).toEqual(option.some("foo"));
    expect(option.none().or(option.some(42))).toEqual(option.some(42));
    expect(option.none().or(option.none())).toEqual(option.none());
  });

  test("Option.prototype.orElse() only calls the provided callback if `this` is none", () => {
    const getSome42 = jest.fn(() => option.some(42));

    expect(option.some("foo").orElse(getSome42)).toEqual(option.some("foo"));
    expect(getSome42.mock.calls.length).toBe(0);

    expect(option.none().orElse(getSome42)).toEqual(option.some(42));
    expect(getSome42.mock.calls).toEqual([[]]);

    const getNone = jest.fn(() => option.none());

    expect(option.some("foo").orElse(getNone)).toEqual(option.some("foo"));
    expect(getNone.mock.calls.length).toBe(0);

    expect(option.none().orElse(getNone)).toEqual(option.none());
    expect(getNone.mock.calls).toEqual([[]]);
  });

  test("Option.prototype.filter() only calls the provided predicate if `this` is some", () => {
    const isEven = jest.fn(n => n % 2 === 0);

    expect(option.none().filter(isEven)).toEqual(option.none());
    expect(isEven.mock.calls.length).toBe(0);

    expect(option.some(1).filter(isEven)).toEqual(option.none());
    expect(isEven.mock.calls).toEqual([[1]]);

    expect(option.some(2).filter(isEven)).toEqual(option.some(2));
    expect(isEven.mock.calls).toEqual([[1], [2]]);
  });

  test("Option.prototype.flatten()", () => {
    expect(option.some(option.some("foo")).flatten()).toEqual(
      option.some("foo"),
    );
    expect(option.some(option.none()).flatten()).toEqual(option.none());
    expect(option.none().flatten()).toEqual(option.none());
  });

  test("Option.prototype.array()", () => {
    expect(option.none().array()).toEqual([]);
    expect(option.some("foo").array()).toEqual(["foo"]);
  });

  test("Option.prototype.xor()", () => {
    expect(option.some("foo").xor(option.some(42))).toEqual(option.none());
    expect(option.some("foo").xor(option.none())).toEqual(option.some("foo"));
    expect(option.none().xor(option.some(42))).toEqual(option.some(42));
    expect(option.none().xor(option.none())).toEqual(option.none());
  });

  test("Option.prototype.transpose()", () => {
    expect(option.none().transpose()).toEqual(result.ok(option.none()));
    expect(option.some(result.ok("foo")).transpose()).toEqual(
      result.ok(option.some("foo")),
    );
    expect(option.some(result.err("bar")).transpose()).toEqual(
      result.err("bar"),
    );
  });

  test("Option.prototype.equalsSome()", () => {
    expect(option.some(42).equalsSome(42)).toBe(true);
    expect(option.some("foo").equalsSome("foo")).toBe(true);

    expect(option.some(42).equalsSome(5)).toBe(false);
    expect(option.some("foo").equalsSome("bar")).toBe(false);
    expect(option.some<string | number>("42").equalsSome(42)).toBe(false);
    expect(option.some({}).equalsSome({})).toBe(false);

    expect(option.none<number>().equalsSome(42)).toBe(false);
  });

  test("Option.prototype.someSatisfies()", () => {
    expect(option.some("foo").someSatisfies(v => v.length === 3)).toBe(true);

    expect(option.some("foo").someSatisfies(v => v.length === 500)).toBe(false);

    expect(option.none().someSatisfies(() => true)).toBe(false);
  });
}
