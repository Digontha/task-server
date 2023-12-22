const express = require('express')
const app = express()
var cors = require('cors')
const port = process.env.PORT || 5000;
require('dotenv').config()

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!')
})


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jp082z4.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!")

    const todoCollection = client.db("taskDB").collection("todo");
    const ongoingCollection = client.db("taskDB").collection("ongoing");
    const completedCollection = client.db("taskDB").collection("completed");
    // TODO SECTION

    app.post("/todo", async (req, res) => {
      const data = req.body
      const result = await todoCollection.insertOne(data);
      res.send(result);
    })

    app.get("/todo", async (req, res) => {
      const email = req.query.email
      let query = {}
      if (email) {
        query = { email: email }
      }
      const result = await todoCollection.find(query).toArray();
      res.send(result);
    });

    app.delete("/todo/:id", async (req, res) => {
      const id = req.params.id
      const query={_id : new ObjectId(id)}
      const result = await todoCollection.deleteOne(query);
      res.send(result);
    });

    // ONGOING SECTION

    app.post("/ongoing", async (req, res) => {
      const data = req.body
      const result = await ongoingCollection.insertOne(data);
      res.send(result);
    })

    app.get("/ongoing", async (req, res) => {
      const email = req.query.email
      let query = {}
      if (email) {
        query = { email: email }
      }
      const result = await ongoingCollection.find(query).toArray();
      res.send(result);
    });

    app.delete("/ongoing/:id", async (req, res) => {
      const id = req.params.id
      const query={_id : new ObjectId(id)}
      const result = await ongoingCollection.deleteOne(query);
      res.send(result);
    });
    

    // COMPLETED SECTION

    app.post("/completed", async (req, res) => {
      const data = req.body
      const result = await completedCollection.insertOne(data);
      res.send(result);
    })

    app.get("/completed", async (req, res) => {
      const result = await completedCollection.find().toArray();
      res.send(result);
    });

    app.delete("/completed/:id", async (req, res) => {
      const id = req.params.id
      const query={_id : new ObjectId(id)}
      const result = await completedCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/completed/:id", async (req, res) => {
      const id = req.params.id
      let query = {}
      if (id) {
          query = { _id: new ObjectId(id) }
      }
      const result = await completedCollection.findOne(query)
      res.send(result)
  });

  app.put("/completed/:id", async (req, res) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) }
    const options = { upsert: true };
    const data = req.body;
    const UpdateResult = {
        $set: {
           tasks: data.tasks,
           description: data.description,
           deadline: data.deadline,
           
        }
    }
    const result = await completedCollection.updateOne(filter, UpdateResult, options)
    res.send(result);
});

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})