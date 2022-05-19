function tes() {
  console.log("Apel");
}

setTimeout(tes, 1000);

setTimeout(() => {
  console.log("Mangga");
}, 3000);

const myPromise = new Promise((resolve, reject) => {
  //   reject("jeruk");

  setTimeout(() => {
    resolve("Semangka");
  }, 5000);
});

myPromise
  .then((value) => {
    console.log("Success", value);
  })
  .catch((err) => {
    console.log("Error", err);
  });

async function example() {
  let myPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("Kiwi");
    }, 7000);
  });
  let res = await myPromise;
  console.log(res);
  return "Melon";
}

console.log("Async", example());

let test = async () => {
  let res = await example();
  console.log(res);
};

test();
