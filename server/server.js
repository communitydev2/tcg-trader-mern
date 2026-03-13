import dotenv from "dotenv";
import express, { response } from "express";
import cors from "cors";
import records from "./routes/records.js";
// Import the SDK in ESM/TypeScript
import TCGdex from '@tcgdex/sdk'
import fs from "fs";
import auth from "./routes/auth.js";
import { deleteAllCardsForTrade, resetAvailableCards } from "./utils/utilFunctions.js";

// Instantiate the SDK with your preferred language
const tcgdex = new TCGdex("en");
const PORT = process.env.PORT || 5050;
const app = express();
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: "./config.env" });
}
// const getLocalizedCard = async (cardId) => {
  //   return await tcgdex.fetchCard(cardId);
  // };
  // console.log(await getLocalizedCard("A1-001"))
  
  // dotenv.config({ path: "./config.env" }); 
  // CORS Settings
  app.use(
    cors({
      origin:"http://localhost:5173",
      credentials:true,

    })
  );
  
  app.use(express.json({ limit: "50mb" }));                 // JSON
  app.use(express.urlencoded({ extended: true, limit: "50mb" })); // forms
  
  // Force fresh responses — prevents browsers/CDN from caching old data
  app.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  });
  

  
  // find 
  
  

  // (async () => {
    //   // Retrieve Furret from the Darkness Ablaze Set
    //   // const card = await tcgdex.card.get('swsh3-136');
    //   const card = await fetch('https://api.tcgdex.net/v2/en/sets/A1');
    //   const {cards} = await card.json();
    //   console.log(cards); // "Furret"
    // })();


    
    app.use("/record", records);
    app.use("/auth", auth);
    
    //start Express server
    app.listen(PORT, ()=> {
      console.log(`Server listening on port ${PORT}`);
    });