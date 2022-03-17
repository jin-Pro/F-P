const { fn: { map,filter,reduce,curry } } = require('../map,filter,reduce');

const products = [
  {name : '의자', price : 100000},
  {name : '책상', price : 500000},
  {name : '컴퓨터', price : 1500000},
  {name : '노트북', price : 1000000},
]

console.log(
  filter(item=>item < 1000000,
    map(item => item.price, products)));

console.log(
  reduce((a,b) => a + b,
  filter(item=>item < 1000000,
    map(item => item.price, products)))
)

// map, filter, reduce를 중첩하여 사용할 경우 함수의 순서가 역치이기 떄문에 가독성이 좋지 않다.


// console.log(
//   go(
//     products,
//     map(item=>item.price),
//     filter(item => item < 1000000),
//     reduce((a,b)=> a + b)
//   )
// )

// 위와 같은 형태로 함수를 중첩으로 사용하였을 경우, 조금 더 가독서잉 좋아지도록 함수를 생성해본다.

const go = (...args) => reduce((f,a) => f(a) , args)

console.log(
  go(
    0,
    a => a + 1,
    a => a + 10,
    a => a + 100
  )
)

// 값을 리턴하는 go와 다르게 함수들을 합성하여 함수를 리턴하는 pipe 함수를 만들어 보겠다.
// 파이프 함수를 사용한다면 아래와 같이 코드를 작성할 수 있다.

/**
 * const f = pipe(
 *  a => a + 1,
    a => a + 10,
    a => a + 100
 * )

    console.log(f(0))
 */

  const pipe = (...fn) => (args) => go(args,...fn)
  const f = pipe(
    a => a + 1,
    a => a + 10,
    a => a + 100
  )
  console.log(f(10))

  
  // 파이프 함수를 수정하여 아래와 같이 인자가 2개 이상인 함수도 사용할 수 있다.

  
  /**
   * const f = pipe(
      a,b => a + b, 
      a => a + 1,
      a => a + 10,
      a => a + 100
  * )

      console.log(f(1,2))
  */  

  const pipe1 = (f,...fs) => (...args) => go(f(...args),...fs)
  const f1 = pipe1(
    (a,b) => a + b,
    a => a + 1,
    a => a + 10,
    a => a + 100
  )

  console.log(f1(1,2))

  // go를 사용하여 위의 코드를 가독성 좋게 변경한다.

  console.log(
    reduce((a,b) => a + b,
    filter(item=>item < 1000000,
      map(item => item.price, products)))
  )

  console.log(
    go(
      products,
      products => map(item => item.price,products),
      products => filter(item => item < 1000000, products),
      products => reduce((a,b) => a + b,products)
    )
  )

  // 하지만, products인자를 계속 코드에 작성해준다는게 불편하다.
  // 아래와 같이 작성하면 좋을 것 같다.

  // console.log(
  //   go(
  //     products,
  //     map(item => item.price),
  //     filter(item => item < 1000000),
  //     reduce((a,b) => a + b)
  //   )
  // )

  // 위와 같은 코드를 만들기 위해서는 map,filter,reduce,에 iter가 없을 경우 도 추가해주어야한다.

  // const curry = f => (fn,...iter) => iter.lenth 
  // ? f(fn,...iter) 
  // : (...args) => f(fn,...args) 

  const multi = curry((a,b) => a * b);
  const multi5 = multi(5)
  console.log(multi5(10))

  // curry를 map,filter,reduce에 적용해주자.

  
console.clear();


  console.log(
    go(
      products,
      map(item => item.price),
      filter(item => item < 1000000),
      reduce((a,b) => a + b)
    )
  )