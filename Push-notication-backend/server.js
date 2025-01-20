const express = require("express");
const cors = require("cors");
const WebSocket = require("ws");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// WebSocket server
const server = app.listen(5001, "0.0.0.0", () => {
  console.log("Server running on port 5001");
});

const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = new Map();

wss.on("connection", (ws, req) => {
  console.log("New client connected");

  // Extract userId from query params (e.g., ws://localhost:5001?userId=123)
  const userId = new URLSearchParams(req.url.split("?")[1]).get("userId");

  if (userId) {
    clients.set(userId, ws); // Map userId to WebSocket connection
  }

  ws.on("message", (message) => {
    console.log(`Received message: ${message}`);
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    clients.delete(userId); // Remove client from map on disconnect
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

// Root route to display "Backend is running successfully"
app.get("/", (req, res) => {
  res.send("Backend is running successfully!");
});

// API to send notification
app.post("/api/send-notification", async (req, res) => {
  const { userId, title, message, image, eventName, additionalFields } = req.body;

  const notification = {
    title,
    message,
    image,
    eventName,
    additionalFields,
  };

  // Send notification via WebSocket
  const client = clients.get(userId);
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(notification));
    res.status(200).json({ message: "Notification sent successfully" });
  } else {
    res.status(404).json({ message: "User is not connected" });
  }
});

// API to schedule notification
app.post("/api/schedule-notification", async (req, res) => {
  const { userId, title, message, image, eventName, additionalFields, time } = req.body;

  const notification = {
    title,
    message,
    image,
    eventName,
    additionalFields,
    time,
  };

  // Schedule notification (e.g., using setTimeout or a cron job)
  const delay = new Date(time).getTime() - Date.now();
  if (delay > 0) {
    setTimeout(() => {
      const client = clients.get(userId);
      if (client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(notification));
      }
    }, delay);
  }

  res.status(200).json({ message: "Notification scheduled successfully" });
});

// const express = require("express");
// const mongoose = require("mongoose");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// require("dotenv").config();

// const app = express();


// app.use(cors({ origin: "*" })); // Allows all origins for now

// // Middleware
// app.use(express.json());
// app.use(cors({ origin: 'http://localhost:3000', methods: '*', allowedHeaders: ['Content-Type'], credentials: true }));


// // MongoDB Connection
// const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/crud_app";
// mongoose.connect(mongoURI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });


// const db = mongoose.connection;
// db.on("error", console.error.bind(console, "Connection error:"));
// db.once("open", () => console.log("MongoDB connected successfully!"));

// // Item Model
// const Item = require("./models/Item"); // Import the Item model from another file

// // Routes
// // POST - Create a new item
// app.post("/api/items", async (req, res) => {
//   try {
//     const newItem = new Item(req.body);
//     const savedItem = await newItem.save();
//     res.status(201).json(savedItem);
//   } catch (err) {
//     console.error("Error saving item:", err.message);
//     res.status(500).json({ message: err.message });
//   }
// });

// // GET - Retrieve all items
// app.get("/api/items", async (req, res) => {
//   try {
//     const items = await Item.find();
//     res.status(200).json(items);
//   } catch (err) {
//     console.error("Error retrieving items:", err.message);
//     res.status(500).json({ message: err.message });
//   }
// });

// // PUT - Update an item by ID
// app.put("/api/items/:id", async (req, res) => {
//   try {
//     const updatedItem = await Item.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true, runValidators: true } // Ensure updated data is validated
//     );
//     if (!updatedItem) {
//       return res.status(404).json({ message: "Item not found" });
//     }
//     res.status(200).json(updatedItem);
//   } catch (err) {
//     console.error("Error updating item:", err.message);
//     res.status(500).json({ message: err.message });
//   }
// });

// // DELETE - Delete an item by ID
// app.delete("/api/items/:id", async (req, res) => {
//   try {
//     const deletedItem = await Item.findByIdAndDelete(req.params.id);
//     if (!deletedItem) {
//       return res.status(404).json({ message: "Item not found" });
//     }
//     res.status(200).json({ message: "Item deleted successfully!" });
//   } catch (err) {
//     console.error("Error deleting item:", err.message);
//     res.status(500).json({ message: err.message });
//   }
// });

// // Root Route
// app.get("/", (req, res) => {
//   res.send("Welcome to the CRUD API");
// });

// // Start Server
// const PORT = process.env.PORT || 5001;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
