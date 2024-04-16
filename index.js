const { timeStamp } = require("console");
const express = require("express");
const fs = require("fs");
//const users = require("./MOCK_DATA.json");
const app = express();

const port = 5000;

const mongoose = require("mongoose");
//step 3 connection
const connection = mongoose
  .connect("mongodb://127.0.0.1:27017/my-first-db")
  .then(console.log("coneection successful"))
  .catch((error) => {
    console.log("mongo error", error);
  });

// step 1 Schema Define
const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    gender: {
      type: String,
      required: true,
    },
    jobTitle: {
      type: String,
      required: true,
    },
  },
  {timeStamps:true}
  
);

// step 2 create Model
const user = mongoose.model("user", userSchema);

app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  console.log("hello main ne tumhare requets rok li");
  //to move to next function we use
  console.log("hello from middleware 1");
  next();
});
app.use((req, res, next) => {
  // console.log("hello main ne tumhare requets rok li")
  //to move to next function we use
  fs.appendFile(
    "log.text",
    `\n ${req.ip} : ${req.method}  : ${req.path} ::: ${Date.now()} \n`,
    (err, data) => {
      next();
    }
  );
});
app.get("/", (req, res) => {
  res.send("hello from node js");
});
app.get("/api/allusers",  async (req, res) => {
  const allDBusers =  await user.find({})
  res.setHeader("myname", "tayyab");
  return res.json(allDBusers);
});
app.get("/allusers", async (req, res) => {
  const allDBusers = await user.find({})
  const html = `
<ul>
    ${allDBusers.map((user) => ` <li>${user.firstName} ${user.jobTitle}</li>`).join("  ")}
</ul>`;

  return res.send(html);
});
//dynamic path parameter id
/*app.get("/api/allusers/:id", (req, res) => {
  const id = Number(req.params.id);
  const user = users.find((user) => user.id == id);
  return res.json(user);
}),
  
app.patch("/api/users/:id", (req, res) => {
  return res.json({ status: "pending" });
});
app.delete("/api/users/:id", (req, res) => {
  return res.json({ status: "pending" });
});
app.post("/api/users", (req, res) => {
    return res.json({ status: "pending" });
  });*/
//this above route can be written like this
app
  .route("/api/allusers/:id")
  .get( async (req, res) => {
    const useron = await user.findById(req.params.id);
    if (!useron) return res.status(404).json({msg :"user not found"});

    /*const id = Number(req.params.id);
    const user = users.find((user) => user.id == id);*/
    return res.json(useron);
  })
  .patch( async( req, res) => {
    const useron = await user.findByIdAndUpdate(req.params.id, {lastName:"changed"});
    return res.json({ status: "success" });
  })
  .delete(async (req, res) => {
    await user.findByIdAndDelete(req.params.id)
    return res.json({ status: "Sucess" });
  });
app.post("/api/users", async (req, res) => {
  const body = req.body;
  if (
    !body ||
    !body.first_name ||
    !body.last_name ||
    !body.email ||
    !body.gender ||
    !body.job_title
  ) {
    return res.status(400).json({ msg: "BAD Request" });
  }
  //inserting into db
  const result = await user.create({
    firstName: body.first_name,
    lastName: body.last_name,
    email: body.email,
    gender: body.gender,
    jobTitle: body.job_title,
  },);
  console.log("result", result);
  return res.status(201).json({ msg: "user created" });
  /*
// inserting into files
  users.push({ ...body, id: users.length + 1 });
  fs.writeFile("./MOCK_DATA.json)", JSON.stringify(body), (err, data) => {
    return res.status(201).json({ status: "pending", id: users.length });
  });*/
  //console.log("body", { body });
});

app.listen(port, (req, res) => {
  console.log("server started");
});
