import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Hello from Express!");
}); 

app.use((req, res) => {
  res.status(404).json({error: "404: Not found"});
});

app.listen(3000);
