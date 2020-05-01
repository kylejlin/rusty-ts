import { result } from "../src";

test("result.all() returns ok if all the array elements are ok", () => {
  const a = result.ok({ a: 1 });
  const b = result.ok({ b: 2 });
  const c = result.ok({ c: 3 });
  const d = result.ok({ d: 4 });
  const e = result.ok({ e: 5 });
  const f = result.ok({ f: 6 });
  const g = result.ok({ g: 7 });
  const h = result.ok({ h: 8 });

  const all = result
    .all([a, b, c, d, e, f, g, h])
    .expect("result.all() should return ok if all the values are ok");
  expect([
    all[0].a,
    all[1].b,
    all[2].c,
    all[3].d,
    all[4].e,
    all[5].f,
    all[6].g,
    all[7].h,
  ]).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
});

test("result.all() returns err value of the first array element that is an err", () => {
  const a = result.ok({ a: 1 });
  const b = result.ok({ b: 2 });
  const errC = result.err({ errC: 3 });
  const d = result.ok({ d: 4 });
  const errE = result.err({ errE: 5 });

  const all = result
    .all([a, b, errC, d, errE])
    .expectErr(
      "result.all() should return an err if one of the values is an err",
    );
  expect(all).toEqual({ errC: 3 });
});
