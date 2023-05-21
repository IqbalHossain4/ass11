const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { parse } = require("dotenv");
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.axpgb1h.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    //await client.connect();
    const toysCollection = client.db("toys").collection("storetoy");

  //load all toys
  app.get("/toy", async (req, res) => {
    const result = await toysCollection.find(req.query).limit(20).toArray();
    res.send(result);
  });

    //post toys
    app.post("/toy", async (req, res) => {
      const newToy = req.body;
      const result = await toysCollection.insertOne(newToy);
      res.send(result);
    });

    

    //update
    app.put("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const toys = req.body;
      const query = { _id: new ObjectId(id) };
      const option = { upsert: true };
      const update = {
        $set: {
          name: toys.name,
          subcategory: toys.subcategory,
          available_quantity: toys.available_quantity,
          price: toys.price,
          // details: toys.details,
        },
      };
      const result = await toysCollection.updateOne(query, update, option);
      res.send(result);
    });

    //load with id
    app.get("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.findOne(query);
      res.send(result);
    });

    // indexing
    const indexKey = { name: 1 };
    const indexOption = { name: "name" };
    const result = await toysCollection.createIndex(indexKey, indexOption);

    //search
    app.get("/search/:key", async (req, res) => {
      const searchText = req.params.key;
      const data = await toysCollection
        .find({
          $or: [{ name: { $regex: searchText, $options: "i" } }],
        })
        .toArray();
      console.log(data);
      res.send(data);
    });

    //sorting acending data
    app.get("/sort", async (req, res) => {
      const cursor = toysCollection.find().sort({ price: 1 });
      const result = await cursor.toArray();
      res.send(result);
    });
	
//sorting decending data
app.get("/sorts", async (req, res) => {
      const cursor = toysCollection.find().sort({ price: -1 });
      const result = await cursor.toArray();
      res.send(result);
    });
    //delete
    app.delete("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello Toys");
});

app.listen(port, () => {
  console.log("Running Server", port);
});
