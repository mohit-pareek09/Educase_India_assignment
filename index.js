const express = require('express');
const dotenv = require('dotenv');
const { initializeDatabase } = require('./config/db.config');
const userRouter=require("./routes/user.routes")
dotenv.config();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.use("/",userRouter);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  await initializeDatabase();
  console.log(`Server running on port ${PORT}`);
});