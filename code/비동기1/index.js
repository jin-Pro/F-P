const {
  fn: { find },
} = require("../generator2");
// 자바스크립트에서 비동기 함수를 동시성있게 작성하는 방법은 2가지이다.
// 콜백함수를 사용하거나
// Promise를 사용하거나 이다.

// function add10(a, callback) {
//   setTimeout(() => callback(a + 10), 1000);
// }

// add10(5, console.log);

// 위 함수는 callback 함수를 인자로 받아 일정 시간 뒤에 callback 함수를 실행한다.

// function add20(a) {
//   return new Promise((resolve) =>
//     setTimeout(() => {
//       resolve(a + 20);
//     }, 1000)
//   );
// }

// add20(10).then(console.log);

// 위 함수는 Promise 객체를 사용하여 일정 시간 뒤에 data를 resolve한다.

/**
 이 때, promise와 callback 함수 패턴에 대한 차이에 대해서
 - callback 지옥이 줄어들어 가독성이 늘어난다. 
 보다는 
 Promise 는 비동기 값을 일급으로 다루기 때문에 값으로 다룰수 있다.

 Promise 객체의 사용은 대기,이행,종료의 상태를 가지는 Promise 객체를 반환하며,
 그 값을 재사용하여 향후 다른 코드에 적용하여 확장할 수 있다는 것에 중점을 둔다.

 반대로, callback함수는 값을 반환하지 않기 때문에, 코드로만 나타나며 확장할 수 없다.
 */

// const add30 = add20(10);

// add30.then((a) => a + 10).then(console.log);
// add30.then(add20).then(add20).then(console.log);

// add10(5, (res) =>
//   add10(res, (res) => add10(res, (res) => add10(res, console.log)))
// );

// ------------------------------------

const go1 = (a, f) => (a instanceof Promise ? a.then(f) : f(a));
const add5 = (a) => a + 5;

console.log(go1(5, add5));

// 위 함수에서 a는 비동기 상황의 일급 값이 아닌 일반 값이 들어와야한다.

// console.log(go1(Promise.resolve(5), add5));
// Promise메서드는 Promise를 반환한다. 즉 일반 값이 아니다.

const delay100 = (a) =>
  new Promise((resolve) => setTimeout(() => resolve(a), 100));

// console.log(go1(delay100(10), add5));

const test = go1(5, add5);
const promiseTest = go1(delay100(5), add5);
// console.log(test);
// promiseTest.then(console.log);

console.log("----------");
// go1(go1(10, add5), console.log);
// go1(go1(delay100(10), add5), console.log);

const n1 = 10;
const n2 = delay100(10);

// go1(go1(n1, add5), console.log);
// go1(go1(n2, add5), console.log);

// -----------------------------------

// Promise를 사용하여 비동기 상황을 합성할 수 있다.

// const g = (a) => a + 1;
// const f = (a) => a * a;

// console.log(f(g(1))); // 4
// console.log(f(g())); // NaN

console.clear();

// 함수를 합성하는데 있어서 정확한 인자를 넣어야 의도에 맞는 함수가 실행된다.
// 하지만 아래와 같은 경우 인자를 넣어주지 않은 경우 의도에 맞지 않은 함수가 실행된다.

// [1]
//   .map(g)
//   .map(f)
//   .forEach((r) => console.log(r));

// []
//   .map(g)
//   .map(f)
//   .forEach((r) => console.log(r));

// // array는 map을 통해 함수를 합성한다.
// // 아무런 값이 없음에도 의도에 맞지 않는 값이 출력되지 않는다.

// Promise.resolve(1).then(g).then(f).then(console.log);
// // Promise는 then을 통해 함수를 합성한다.
// Promise.resolve(0).then(g).then(f).then(console.log); // NaN
// // Promise는 값에 대해 안전한 합성을 하지 않고, 아래와 같이 비동기 상황을 안전하게 합성하는 객체이다.

// new Promise((resolve) => setTimeout(() => resolve(5), 100))
//   .then(g)
//   .then(f)
//   .then(console.log);

// ------------------------------------------------------------

const users = [
  { id: 1, name: "aa" },
  { id: 2, name: "bb" },
  { id: 3, name: "cc" },
];

const getUserById = (id) => find((u) => u.id == id, users);

const f = ({ name }) => name;
const g = getUserById;

// const fg1 = (id) => f(g(id));

// const r1 = fg1(2);
// console.log(r1);

// users.pop();
// users.pop();

// const r2 = fg1(2);
// console.log(r2); // 에러 반환

const fg2 = (id) => Promise.resolve(id).then(g).then(f);

// fg2(2).then(console.log);

users.pop();
users.pop();

// fg2(2).then(console.log);

// Promise를 사용하더라도 에러는 발생한다.
// 하지만, Promise는 값에 대해 안전한 합성이 목적이 아닌,
// 비동기 상황을 안전하게 합성하는 객체이다.

const getUserByIdPromise = (id) =>
  find((u) => u.id == id, users) || Promise.reject("error");

const g1 = getUserByIdPromise;

const fg3 = (id) =>
  Promise.resolve(id)
    .then(g1)
    .then(f)
    .catch((a) => a);
// then(g1)에서의 결과값이 reject이기 때문에 then(f)를 건너고 catch로 넘어간다.
// Promise를 사용하여 비동기 상황을 안전하게 합성한다.

fg3(2).then(console.log);

// -------------------------------

// Promise의 특징

Promise.resolve(Promise.resolve(1)).then(console.log);

/**
 위 코드는

 Promise.resolve(Promise.resolve(1)).then(res => console.log(Promise.resolve(1))) 이 아니다.

 Promise의 then은 깊숙히 존재하는 resolve 값 도 한번에 꺼내온다.
 */
