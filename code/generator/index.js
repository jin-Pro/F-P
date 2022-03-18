const {
  fn: { map, filter, reduce, go, pipe, curry },
} = require("../go,pipe,curry");

// range 함수를 작성하여 입력한 인자에 수에 맞는 배열을 반환하는 함수 range를 만들어본다.

const range = (l) => {
  let res = [];
  let i = -1;
  while (++i < l) {
    res.push(i);
  }
  return res;
};

console.log(range(5));
// [ 0, 1, 2, 3, 4]

const add = (a, b) => a + b;

const list = range(5); // [ 0, 1, 2, 3, 4]
console.log(reduce(add, list)); // 10

const L = {};

L.range = function* (l) {
  let i = -1;
  while (++i < l) yield i;
};

const Llist = L.range(5);

console.log(Llist);
console.log(Llist.next());
// console.log(Llist.next())
// console.log(Llist.next())

console.log(reduce(add, Llist)); // 10

// 제너레이터로 만든 list, Llist는 [0,1,2,3,4]가 아니다.
// 즉 range로 만든 list는 배열을 만들어 놓지만,
// L.range로 만든 Llist는 배열을 만들어 놓는게 아닌, iterator를 순회할때 값을 생성한다.

// 그렇다면 배열을 미리 만드는 것과 계산을 할때 순회하여 값을 생성하는 경우의 차이는 어떠할까?

console.clear();

// console.time('range')
// console.log(reduce(add,range(10000000)))
// console.timeEnd('range')
// // 853.222ms

// console.time('L.range')
// console.log(reduce(add,L.range(10000000)))
// console.timeEnd('L.range')
// // 359.005ms

// 다음은, range함수로 만든 데이터에서 지정한 갯수만큼 데이터를 가지고오는 take함수를 만들어본다.

const take = curry((l, iter) => {
  let res = [];
  for (const a of iter) {
    res.push(a);
    if (res.length === l) return res;
  }
  return res;
});
// take는 입력한 갯수만큼 배열의 데이터를 꺼내오는 함수이기때문에 take자체를 지연성으로 두는 것보다는 take에 넣어주는 iter가 지연성있는 배열이어야한다.
// 아래 코드는 range함수로 10개를 만들고 take함수로 5개를 뽑아오는 함수이다.
console.log(take(5, range(10)));

console.time("range");
console.log(take(5, range(10000000)));
console.timeEnd("range");
// range: 504.045ms

console.time("L.range");
console.log(take(5, L.range(10000000)));
console.timeEnd("L.range");
// L.range: 0.26ms

// 위 두 함수의 차이는 range는 10000000개의 배열을 만들고 나서 5개를 뽑는다.
// L.range는 10000000개의 배열을 만들지 않고, take에 입력한 인자의 갯수만큼만 뽑는다.

// 위 코드는 아래와 같이 작성할 수 있다.

console.time("go range");
go(range(10000000), take(5), console.log);
console.timeEnd("go range");
// go range: 595.511ms

console.time("go L.range");
go(L.range(10000000), take(5), console.log);
console.timeEnd("go L.range");
// go L.range: 0.245ms

// 지연 평가 map => L.map

L.map = curry(function* (f, iter) {
  for (const a of iter) yield f(a);
});

console.time("map");
go(
  range(1000000),
  map((i) => i * i)
);
console.timeEnd("map");
// map: 165.47ms

console.time("L.map");
go(
  L.range(1000000),
  L.map((i) => i * i)
);
console.timeEnd("L.map");
// L.map: 0.139ms

L.filter = curry(function* (f, iter) {
  for (const a of iter) if (f(a)) yield a;
});

console.time("filter");
go(
  range(1000000),
  filter((i) => i < 1000)
);
console.timeEnd("filter");
// filter: 70.581ms

console.time("L.filter");
go(
  L.range(1000000),
  L.filter((i) => i < 1000)
);
console.timeEnd("L.filter");
// L.filter: 0.145ms

const fn = {
  map,
  filter,
  reduce,
  go,
  pipe,
  curry,
  L,
};

module.exports.fn = fn;
