const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const port = 8080;
const SECRET_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQyNTMzODE0LCJpYXQiOjE3NDI1MzM1MTQsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjU2ZjVjM2IzLTZhMWMtNDYwNy1iZDdhLTRkMzA0Y2NjYTAyNyIsInN1YiI6InVnY2V0MjIwNjkyQHJldmEuZWR1LmluIn0sImNvbXBhbnlOYW1lIjoiUHJhZHl1bW5hQUoiLCJjbGllbnRJRCI6IjU2ZjVjM2IzLTZhMWMtNDYwNy1iZDdhLTRkMzA0Y2NjYTAyNyIsImNsaWVudFNlY3JldCI6IlRGdWZLTHhudmpHZW10S1QiLCJvd25lck5hbWUiOiJQcmFkeXVtbm5hIEF2aW5hc2ggSmF2YWxhZ2kiLCJvd25lckVtYWlsIjoidWdjZXQyMjA2OTJAcmV2YS5lZHUuaW4iLCJyb2xsTm8iOiJSMjJFSjAxMyJ9.gGPFl_hgGf16zFa8GiWZh0JfAfw6YVntzw2OBx-7FhE"; // Change this to a strong secret key

app.use(bodyParser.json());
app.use(cors());


const users = [];

// Register a new user
app.post("/register", async (req, res) => {
    const { name, password } = req.body;
    if (!name || !password) {
        return res.status(400).json({ message: "Name and password are required" });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: users.length + 1, name, password: hashedPassword };

    users.push(newUser);
    res.status(201).json({ message: "User registered successfully" });
});

// Login user and return JWT token
app.post("/login", async (req, res) => {
    const { name, password } = req.body;
    const user = users.find((u) => u.name === name);

    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, name: user.name }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token });
});

// Middleware to authenticate JWT token
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded; // Store user info in request
        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
};

// Fetch all users (protected route)
app.get("/users", authenticate, (req, res) => {
    res.json({ users });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
