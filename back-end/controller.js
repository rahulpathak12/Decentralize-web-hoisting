const express = require("express");
const cors = require("cors"); // Import CORS package
const { create } = require("ipfs-http-client");
// const fileUpload = require("express-fileupload");
const axios = require("axios");

const ipfs = create({ host: "127.0.0.1", port: "5001", protocol: "http" });

const app = express();
const { registerUser, loginUser, uploadFile } = require("./connectToNetwork");
app.use(cors()); // Enable CORS for all routes
app.use(express.json());
// Enable files upload
// app.use(
//   fileUpload({
//     useTempFiles: true,
//     tempFileDir: "/tmp/",
//   })
// );

// Registration API
app.post("/register", async (req, res) => {
  try {
    const { username, firstName, lastName, email, password } = req.body;
    await registerUser(username, firstName, lastName, email, password);
    res.status(200).json({ message: "Registration successful" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Login API
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await loginUser(username, password);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload File API
app.post("/upload", async (req, res) => {
  try {
    const { username, url } = req.body;

    // Fetch the website content
    const response = await axios.get(url);
    const websiteContent = response.data;

    // Upload website content to IPFS
    const fileAdded = await ipfs.add(Buffer.from(websiteContent));
    const cid = fileAdded.cid.toString();

    await uploadFile(username, cid);
    res.status(200).json({ message: "Website uploaded successfully", cid });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
