import { option } from "../src";

test("option.all()", () => {
  const a = option.some("foo");
  const b = option.none();
  const c = option.some(42);
  const d = option.some(null);

  const abcd = option.all([a, b, c, d]);
  expect(abcd.isNone()).toBe(true);

  const acd = option.all([a, c, d]);
  expect(acd.isSome()).toBe(true);
  expect(acd.unwrap()).toEqual(["foo", 42, null]);
});
