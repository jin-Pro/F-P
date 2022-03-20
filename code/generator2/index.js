const {
  fn: { map, filter, reduce, go, pipe, curry, L, take, range },
} = require("../generator");

console.clear();

// queryStr 만들기

const queryStr = pipe(
  Object.entries,
  map(([k, v]) => `${k}=${v}`),
  reduce((a, b) => `${a}&${b}`),
  console.log
);

// queryStr에서 Object.entries는 iterator가 아닌 arr를 받기 때문에 배열이 완성된 상태로 map으로 전달된다.

L.entries = function* (obj) {
  for (const k in obj) yield [k, obj[k]];
};

go({ limit: 10, offset: 10 }, queryStr);

// join 만들기

// const join = (sep = ",", iter) =>
//   go(
//     iter,
//     reduce((a, b) => `${b}${sep}${a}`),
//     console.log
//   );

// pipe를 사용하기 위해 curry를 붙여준다.
const join = curry((sep = ",", iter) =>
  // pipe(
  go(
    iter,
    reduce((a, b) => `${b}${sep}${a}`),
    console.log
  )
);

join("-", [2022, 03, 25]);

// array의 join 이 아닌 iterable 프로토콜을 따르는 join 이기 때문에 지연이 가능하며, 다형성이 높아진다.
go(
  (function* () {
    yield 1;
    yield 2;
    yield 3;
    yield 4;
    yield 5;
  })(),
  join("-")
);

L.queryStr = pipe(
  L.entries,
  map(([k, v]) => `${k}=${v}`),
  reduce((a, b) => `${a}&${b}`),
  console.log
);

L.queryStr({ limit: 10, offset: 10 });

// find => 조건에 맞는 데이터를 가져오는 함수

const users = [
  { age: 21 },
  { age: 22 },
  { age: 23 },
  { age: 24 },
  { age: 25 },
  { age: 26 },
  { age: 27 },
  { age: 28 },
  { age: 29 },
  { age: 30 },
  { age: 31 },
];

const find = curry(
  (f, iter) =>
    // go(iter, filter(f), take(3), ([a]) => a, console.log)
    // 위 함수에서 filter와 take가 실행될때 이미 배열을 만들어 놓았기 떄문에 성능적으로 좋지 않다.
    go(iter, L.filter(f), take(3), ([a]) => a, console.log)
  // filter 함수를 lazy 형태로 사용하게되면 배열을 만들어 놓지 않기떄문에 take까지 조건이 맞으면 배열을 더 순회하지 않아 성능적으로 좋다.
);

find((u) => u.age > 30)(users);

// flatten 이라는 함수를 만들어본다.
// flatten이란 배열 내부 값들을 모두 펼쳐주는 함수이다.

// console.log(flatten([[1, 2], 3, 4, [5, 6, 7, 8], [[9, 10], 11]]));
// [1,2,3,4,5,6,7,8,9,10,11]
const takeAll = take(Infinity);
const isIterable = (a) => a && a[Symbol.iterator];

L.flatten = function* f(iter) {
  for (const a of iter) {
    // if (isIterable(a)) for (const b of a) yield b;
    if (isIterable(a)) yield* f(a);
    // 위 두줄 코드는 동일하다.
    else yield a;
  }
};

const flatten = pipe(L.flatten, takeAll);

console.log(take(3, L.flatten([[1, 2], 3, 4, [5, 6, 7, 8], [[9, 10], 11]])));
console.log(flatten([[1, 2], 3, 4, [5, 6, 7, 8], [[9, 10], 11]]));

// flatMap을 만들어본다.
// flatMap은 iter를 받아 map을 돌고, flatten을 하는 함수이다.

L.flatMap = curry(pipe(L.map, L.flatten));

const iter = L.flatMap(
  map((a) => a * a),
  [
    [1, 2],
    [3, 4],
    [5, 6, 7],
  ]
);

console.log([...iter]);
// error L.flatten에서 iter is not iterable
// L.map 에서 제대로 실행이 안된다고 판단

// iter 변수의 값을 펼쳐서 생각해봄

/**
 L.flatMap(
  map((a) => a * a),
  [
    [1, 2],
    [3, 4],
    [5, 6, 7],
  ]
);

위 함수는

curry(
  pipe(
    L.map, 
    L.flatten
  )
)(map((a) => a * a),
  [
    [1, 2],
    [3, 4],
    [5, 6, 7],
  ])

  이며,

  curry 함수는

  const curry =
  (f) =>
  (fn, ...iter) =>
    iter.length ? f(fn, ...iter) : (...args) => f(fn, ...args);

  이므로

  f : pipe(L.map,L.flatten)
  fn : map(a => a * a)
  iter : [[1, 2],[3, 4],[5, 6, 7]]

  => pipe(L.map,L.flatten)(map(a => a * a),[[1, 2],[3, 4],[5, 6, 7]]) 이 된다.

  pipe 함수는

  const pipe = 
    (...fn) =>
    (args) =>
      go(args, ...fn);

  이므로, go(map(a => a * a), L.map,L.flatten)이 된다.
  여기서, [[1, 2],[3, 4],[5, 6, 7]] 의 값이 누락되게 된다, 왜냐하면 pipe는 args 인자 1개를 받기 때문이다.
  pipe에서 인자를 2개 이상 받기 위해서는 pipe 함수를 수정해야 한다.

  const pipe =
  (f, ...fs) =>
  (...args) =>
    go(f(...args), ...fs);
  와 같이  수정하게되면

pipe(L.map,L.flatten)(map(a => a * a),[[1, 2],[3, 4],[5, 6, 7]]) 함수는
go(
  L.map(
    map(a => a * a), 
    [[1, 2],[3, 4],[5, 6, 7]]
  ),
  L.flatten
)
이 되어 에러가 발생하지 않는다.
 */

// =----------------------------------------------

// 2차원 다루기

console.clear();

const arr = [
  [1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [9, 10],
];

go(
  arr,
  L.flatten,
  L.filter((a) => a % 2),
  // takeAll,
  take(2),
  console.log
);

// 실무 데이터에 적용해보기

const users2 = [
  {
    name: "a",
    age: 25,
    family: [
      { name: "a1", age: 53 },
      { name: "a2", age: 52 },
      { name: "a3", age: 15 },
      { name: "a4", age: 29 },
    ],
  },
  {
    name: "b",
    age: 28,
    family: [
      { name: "b1", age: 25 },
      { name: "b2", age: 26 },
      { name: "b3", age: 75 },
      { name: "b4", age: 56 },
    ],
  },
  {
    name: "c",
    age: 22,
    family: [
      { name: "c1", age: 2 },
      { name: "c2", age: 4 },
      { name: "c3", age: 26 },
      { name: "c4", age: 27 },
    ],
  },
  {
    name: "d",
    age: 23,
    family: [
      { name: "d1", age: 14 },
      { name: "d2", age: 16 },
      { name: "d3", age: 35 },
      { name: "d4", age: 36 },
    ],
  },
];

// users의 가족들중 20살 미만인 사람 4명을 뽑겠다.

go(
  users2,
  L.flatMap((u) => u.family),
  L.filter((u) => u.age > 20),
  take(4),
  console.log
);

/**
 객체 지향 프로그래밍은 데이터를 우선적으로 정리 한 후, 메서드를 그 이후에 만들면서 코드 작성
 함수형 프로그래밍은 이미 만들어져있는 함수들로 조합하여 데이터를 구성한다.
 */

console.time("");
go(
  range(10000000),
  filter((n) => n < 1000),
  take(4),
  console.log
);
console.timeEnd(""); // 196ms

console.time("");
go(
  range(10000000),
  L.filter((n) => n < 1000),
  take(4),
  console.log
);
console.timeEnd(""); // 91 ms

console.time("");
go(
  L.range(10000000),
  L.filter((n) => n < 1000),
  take(4),
  console.log
);
console.timeEnd(""); // 0.1 ms
