// 132 라인

const curry =
  (f) =>
  (fn, ...iter) =>
    iter.length ? f(fn, ...iter) : (...args) => f(fn, ...args);

const arr = [1, 2, 3, 4, 5];
const string = "abcde";

console.log(arr.map((item) => item)); // [ 1 , 2 , 3 , 4 , 5]

// console.log(string.map((item) => item)); // map은 arr의 메서드이기때문에 arr가 아닌 string에서는 사용할 수 없다.

for (const a of arr) console.log(a); // 1,2,3,4,5
for (const a of string) console.log(a); // a,b,c,d,e

/**
 * for - of 는 iterable을 반환하는 iterator를 받아 iterable을 순회한다.
 * 즉, Array와 String은 순회 가능한 iterator이지만, map은 Array의 메서드 였기 떄문일뿐이다.
 */

const map = curry((f, iter) => {
  let res = [];
  for (const a of iter) res.push(f(a));
  return res;
});

console.log(map((item) => item, arr)); // [1,2,3,4,5]
console.log(map((item) => item, string)); // [a,b,c,d,e]

/**
 * 위와 같이 iterator의 속성을 사용한 for ... of 를 사용하여 map을 만들 수 있다.
 */

const filter = curry((f, iter) => {
  let res = [];
  for (const a of iter) if (f(a)) res.push(a);
  return res;
});

console.log(filter((item) => item < 3, arr)); // 1,2
console.log(filter((item) => item < "c", string)); // a,b

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

console.log(reduce((a, b) => a + b, 10, arr)); // 25
console.log(reduce((a, b) => a + b, arr)); // 15

const fn = {
  map,
  filter,
  reduce,
  curry,
};

module.exports.fn = fn;
