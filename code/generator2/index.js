const {
  fn: { map, filter, reduce, go, pipe, curry, L, take },
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

console.log(L.flatten([[1, 2], 3, 4, [5, 6, 7, 8], [[9, 10], 11]]));
console.log(flatten([[1, 2], 3, 4, [5, 6, 7, 8], [[9, 10], 11]]));

// flatMap을 만들어본다.
// flatMap은 iter를 받아 map을 돌고, flatten을 하는 함수이다.

L.flatMap = curry(pipe(L.map, takeAll, L.flatten));

let iter = L.flatMap(
  (a) => a,
  [
    [1, 2],
    [3, 4],
    [5, 6, 7],
  ]
);

// console.log(iter.next());

// error L.flatten에서 iter is not iterable
// L.map 에서 제대로 실행이 안된다고 판단

// iter 변수의 값을 펼쳐서 생각해봄

/**
 *
 L.flatMap(
  (a) => a,
  [
    [1, 2],
    [3, 4],
    [5, 6, 7],
  ]
);
함수는 아래와 같다.

curry(
  pipe(
    L.map, 
    L.flatten
    )
  )(
  (a) => a,
  [
    [1, 2],
    [3, 4],
    [5, 6, 7],
  ]
  )
)

--- 

curry 함수는 

const curry =
  (f) =>
  (fn, ...iter) =>
    iter.length ? f(fn, ...iter) : (...args) => f(fn, ...args);

  이기 때문에,

  위 코드는 아래와 같다.

  pipe(
    L.map, 
    L.flatten
    )
  )(
  (a) => a,
  [
    [1, 2],
    [3, 4],
    [5, 6, 7],
  ]
  )

  ---

  pipe 함수는


const pipe =
  (...fn) =>
  (args) =>
    go(args, ...fn);

  이기 때문에,

  위 코드는 아래와 같다.

  go(
    (
      (a) => a,
      [
        [1, 2],
        [3, 4],
        [5, 6, 7],
      ]
    ),
    L.map,
    L.flatten
  )

  ---

  go 함수는

  const go = (...args) => reduce((a, f) => f(a), args);
  
  이기 때문에, 위 코드는 아래와 같다.

  reduce((a,f) => f(a), (
      (a) => a,
      [
        [1, 2],
        [3, 4],
        [5, 6, 7],
      ]
    ),
    L.map,
    L.flatten
  )

  ---

  reduce 함수는

  const reduce = curry((f, acc, iter) => {
    if (!iter) {
      iter = acc[Symbol.iterator]();
      acc = iter.next().value;
    }
    for (const a of iter) {
      acc = f(acc, a);
    }
    return acc;
  });

  이므로, 

  acc은 (
    (a) => a,
    [
      [1, 2],
      [3, 4],
      [5, 6, 7],
    ]
  )

  이며,

  iter 는 [ L.map , L.flatten ] 이다.

  여기서 제가 생각한 문제는 
  
  L.map에서 f로는 a => a , iter = [
      [1, 2],
      [3, 4],
      [5, 6, 7],
    ] 를 받아서 iter를 그대로 반환해야 한다고 생각합니다.

    하지만, L.flatten에서 받아온 iter는 iterable이 아니라고 에러 반환을
    하는데, 문제가 무엇인지 모르겠습니다..
 */
