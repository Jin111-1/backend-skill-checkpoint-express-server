import express from "express";
import questionRouter from "./apps/question.js";
import answersRouter from "./apps/answer.js";
const app = express();
const port = 4000;

app.use(express.json());
app.use("/question" , questionRouter)
app.use("/answer", answersRouter)


app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
