const express = require("express");
const dotenv = require("dotenv").config();
const dbConnect = require("./config/database/dbConnect");
const { userRegister } = require("./controllers/user/userCntrl");
const { errorHandler, notFound } = require("./middlewares/error/errorHandler");
const userRoutes = require("./routes/user/userRoute");

dbConnect();

const app = express();
//middleware

app.use(express.json());

app.use("/api/users", userRoutes);

//error Handler
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`server is running on port ${PORT}`));
