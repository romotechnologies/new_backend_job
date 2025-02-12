import mongoose from "mongoose";

const ConfigureDB = async () => {
  try {
    const db = await mongoose.connect(process.env.MONGO_URL);
    console.log("connected to db", db.connections[0].name);
  } catch (err) {
    console.log(err);
  }
};

export default ConfigureDB;
