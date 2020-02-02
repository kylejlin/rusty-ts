/**
 * An error that occurs when `unwrap()` or `expect()`
 * is called on `option.none()` or `result.err()`, or
 * `unwrapErr()` or `expectErr()` is called on `result.ok()`.
 */
export default class UnwrapError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnwrapError";
  }
}
