const { fn : { map, filter, reduce , go , pipe , curry }} = require('../go,pipe,curry');

// range 함수를 작성하여 입력한 인자에 수에 맞는 배열을 반환하는 함수 range를 만들어본다.

const range = (l) => {
  let res = []
  let i = -1;
  while (++i < l){
    res.push(i)
  }
  return res;
}

console.log(range(5))
// [ 0, 1, 2, 3, 4]

const add = (a,b) => a + b;

const list = range(5) // [ 0, 1, 2, 3, 4]
console.log(reduce(add,list)) // 10

const L = {}

L.range = function *(l){
  let i = -1;
  while(++i < l) yield i
}

const Llist = L.range(5)

console.log(Llist)
console.log(Llist.next())
// console.log(Llist.next())
// console.log(Llist.next())

console.log(reduce(add,Llist)) // 10

// 제너레이터로 만든 list, Llist는 [0,1,2,3,4]가 아니다.
// 즉 range로 만든 list는 배열을 만들어 놓지만,
// L.range로 만든 Llist는 배열을 만들어 놓는게 아닌, iterator를 순회할때 값을 생성한다.

// 그렇다면 배열을 미리 만드는 것과 계산을 할때 순회하여 값을 생성하는 경우의 차이는 어떠할까?

console.clear();

console.time('range')
console.log(reduce(add,range(10000000)))
console.timeEnd('range')
// 853.222ms

console.time('L.range')
console.log(reduce(add,L.range(10000000)))
console.timeEnd('L.range')
// 359.005ms