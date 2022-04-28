//for loop
console.log("For Loop");
for (let i = 0; i < 5; i += 1) {
  console.log(i);
}

//while loop
let i = 0;
console.log("While Loop");
while (i < 3) {
  console.log(i);
  i += 1;
}

let a = ["a", "b", "c"];

//for loop in array/object
console.log("For in Loop");
for (let i in a) {
  console.log(a[i]);
}

let b = {
  a: "a",
  b: 1234,
};

for (let i in b) {
  console.log("Key", i);
  console.log("Value", b[i]);
}
