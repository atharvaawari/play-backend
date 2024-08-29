import mongoose from "mongoose";
import { DB_NAME } from "../constants.js"

//process in a inbuilt function of nodejs

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/ ${DB_NAME}`)
        console.log(`\n MongoDB connected!! DB HOST: ${connectionInstance.connection.host}`);

    } catch (error) {
        console.log("MONGODB connection error", error);
        process.exit(1)
    }
}

export default connectDB


//make a project on mongoDB atlas
//genreate URI - copy to env file replace password remove forward slash '/'
//create Db file create connection Instance with async await
// import URI and DbName add to connection string
//handle errors
//export function and execute in the server index.js file

