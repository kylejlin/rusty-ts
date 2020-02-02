import { option } from "../src";

test("option.fromVoidable()", () => {
  expect(option.fromVoidable(undefined)).toEqual(option.none());
  expect(option.fromVoidable(null)).toEqual(option.none());

  expect(option.fromVoidable(0)).toEqual(option.some(0));
  expect(option.fromVoidable(42)).toEqual(option.some(42));
  expect(option.fromVoidable("")).toEqual(option.some(""));
  expect(option.fromVoidable("foo")).toEqual(option.some("foo"));
  expect(option.fromVoidable(true)).toEqual(option.some(true));
  expect(option.fromVoidable(false)).toEqual(option.some(false));
});
