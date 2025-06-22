import express from "express";
import cors from "cors";
import fs from "fs";
import { nanoid } from "nanoid";
const app = express();

const PORT = 3000;
const FILE = "./messages.json";

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Load existing messages
function loadMessages() {
  try {
    const data = fs.readFileSync(FILE, "utf-8");
    return JSON.parse(data || "{}"); // fallback to empty object
  } catch (err) {
    return {}; // return empty object on read/parse failure
  }
}

// Save message
function saveMessages(messages) {
  fs.writeFileSync(FILE, JSON.stringify(messages, null, 2));
}

// POST /api/schedule
app.post("/api/schedule", (req, res) => {
  const { phone, message, schedule } = req.body;
  const code = nanoid(6).toUpperCase();
  const messages = loadMessages();

  messages[code] = { phone, message, schedule, status: "⏳ Pending" };
  saveMessages(messages);

  res.json({ code });
});

// GET /api/track/:code
app.get("/api/track/:code", (req, res) => {
  const code = req.params.code.toUpperCase();
  const messages = loadMessages();

  if (messages[code]) {
    const msg = messages[code];
    res.json({
      found: true,
      phoneMasked: msg.phone.slice(0, 3) + "****" + msg.phone.slice(-2),
      messagePreview: msg.message.slice(0, 30),
      schedule: msg.schedule,
      status: msg.status,
    });
  } else {
    res.json({ found: false });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// GET /track/:code (used by track.html page)
app.get("/track/:code", (req, res) => {
  const code = req.params.code.toUpperCase();
  const messages = loadMessages();

  if (messages[code]) {
    const msg = messages[code];
    res.json({
      message: msg.message,
      time: msg.schedule,
      phone: msg.phone,
      status: msg.status,
    });
  } else {
    res.status(404).json({ error: "Message not found" });
  }
});
