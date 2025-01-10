import express from "express";

const app = express();
app.use(express.json());

const x = [1, 5, 2, 3];

console.log(x.toSorted())

app.listen(6000, () => {
  console.log("Auth microservice listning on port 300");
});
