const express = require("express");
const app = express();
const cors = require("cors");
const crypto = require("crypto");
require("dotenv").config();

app.use(
  express.urlencoded({
    extended: false,
  })
);
app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

const USERS = [
  // {
  //   _id: "73b86379-b4a8-4722-82a3-cf41bc30f1f7",
  //   username: "asad",
  // },
];

const EXERCISES = [
  // {
  //   _id: "73b86379-b4a8-4722-82a3-cf41bc30f1f7",
  //   username: "asad",
  //   description: "desc",
  //   duration: 2,
  //   date: "Sat Oct 20 2024",
  // },
  // {
  //   _id: "73b86379-b4a8-4722-82a3-cf41bc30f1f7",
  //   username: "asad",
  //   description: "hello",
  //   duration: 10,
  //   date: "Sat Oct 19 2024",
  // },
  // {
  //   _id: "73b86379-b4a8-4722-82a3-cf41bc30f1f7",
  //   username: "asad",
  //   description: "hello",
  //   duration: 10,
  //   date: "Sat Oct 21 2024",
  // },
];

app.get("/api/users", (req, res) => {
  return res.json(USERS);
});

app.post("/api/users", (req, res) => {
  const username = req.body.username?.trim();
  console.log("body", req.body);
  if (!username) return res.status(404).send("Username required");
  const user = {
    _id: crypto.randomUUID(),
    username,
  };
  USERS.push(user);
  res.json(user);
});

app.post("/api/users/:_id/exercises", (req, res) => {
  const body = { ...req.body };
  const userId = req.params._id;

  console.log("body", body);
  const { description, duration, date } = body;
  if (!userId || !description || !duration)
    return res
      .status(404)
      .send("Please provide valid description and duration");

  const user = USERS.find(({ _id }) => _id === userId);
  if (!user) return res.status(404).send("User not exist with this userId");

  if (!parseInt(duration))
    return res.status(404).send("User not exist with this userId");

  const d = new Date(date ?? Date.now()).toDateString();

  if (d === "Invalid Date") return res.status(404).send("Invalid Date");

  const exercise = {
    _id: userId,
    username: user.username,
    description,
    duration: parseInt(duration),
    date: d,
  };
  EXERCISES.push(exercise);
  res.json(exercise);
});

app.get("/api/users/:id/logs?", (req, res) => {
  const userId = req.params.id;
  const user = USERS.find(({ _id }) => _id === userId);
  if (!user) return res.status(404).send("User not exist with this userId");

  let { from, to, limit } = req.query;
  from && (from = new Date(from));
  to && (to = new Date(to));
  limit && (limit = parseInt(limit));

  let exercises = EXERCISES.filter(({ _id }) => _id === userId);
  if (from && from.toString() !== "Invalid Date")
    exercises = exercises.filter((e) => new Date(e.date) >= from);
  if (to && to.toString() !== "Invalid Date")
    exercises = exercises.filter((e) => new Date(e.date) <= to);
  if (limit) exercises = exercises.slice(0, limit);
  exercises = exercises.map((e) => {
    const exercise = { ...e };
    delete exercise._id;
    return exercise;
  });

  return res.json({
    username: user.username,
    count: exercises.length,
    _id: userId,
    log: exercises,
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
