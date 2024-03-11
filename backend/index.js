// server.js
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const axios = require("axios");
const cors = require("cors");
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5000;
app.use(cors({ origin: "*" }));
app.use(express.json());
io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});
const fetchWeatherData = async (latitude, longitude) => {
  try {
    const { data } = await axios.get(
      `http://api.weatherapi.com/v1/current.json?key=3b6a0591355b4791bed94354220907&q=${latitude},${longitude}&aqi=no`
    );

    const weatherData = {
      conditions: data?.current?.condition,
      temperature: data?.current?.temp_c,
      location: `${data?.location?.name}, ${data?.location?.region}, ${data?.location?.country}`,
    };

    return weatherData;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
};

setInterval(async () => {
  const weatherData = await fetchWeatherData();
  if (weatherData) {
    io.emit("weatherUpdate", weatherData);
  }
}, 30000); // Fetch and emit weather data every 30 seconds

app.post("/api/weather", async (req, res) => {
  const { latitude, longitude } = req.body;

  try {
    const weatherData = await fetchWeatherData(latitude, longitude);

    if (weatherData) {
      io.emit("weatherUpdate", weatherData);
      res.json(weatherData);
    } else {
      res.status(500).json({ message: "Error fetching weather data" });
    }
  } catch (error) {
    console.error("Error fetching weather data:", error);
    res.status(500).json({ message: "Error fetching weather data" });
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
