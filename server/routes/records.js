import express from "express";

// This will help us connect to the database
import db from "../db/connection.js";
import { formatDate } from "../utils/utilFunctions.js";
// This help convert the id from string to ObjectId for the _id.
import { ObjectId } from "mongodb";
import { authJwt } from "../middleware/authJwt.js";
import { collectionPokemonName, collectionUserAccounts, routerCards, routerUserAccounts } from "../utils/wideVariables.js";
// router is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
import TCGdex from '@tcgdex/sdk'

const router = express.Router();
const tcgdex = new TCGdex("en");


router.get("/getAllUsers", async(req,res) => {
  let collection = await db.collection(collectionUserAccounts);
  let results = await collection.find({}).toArray();
  res.send(results).status(200);
})
router.get("/getAllCards", async(req,res) => {
  let collection = await db.collection(collectionPokemonName);
  let results = await collection.find({}).toArray();
  res.send(results).status(200);
})


// this route will give you access of another user's "tcgidNo" and "tcgIdName"
router.get("/getPokemonTradeInfo", async (req,res)=> {

})

// router to get list of all sets
router.get("/getSetNamesInfo",async(req,res)=> {
  let results = await tcgdex.fetchSets('tcgp');
  res.send(results).status(200);
})

// router to get rarities
router.get("/getRarities",async(req,res)=> {
    let cardSets = await tcgdex.fetchSets('tcgp');
    // const allSets = await getNamesOfAllSets();
    const ids = cardSets.map(set => set.id);
    // remove P-A
    const filterId = ids.filter(set => set != "P-A") 
    // console.log(filterId)
    // will store all cards from loop
    const allCards = []
    let setNo = 5
    // let currentSetCards = await tcgdex.fetchCards(allSets[setNo]);
    // fs.writeFileSync("set"+setNo+".json", JSON.stringify(currentSetCards, null, 2), "utf8");
    
    for(let i=0;i<filterId.length; i++){
      let currentSetCards = await tcgdex.fetchCards(filterId[i]);
      allCards.push(currentSetCards);
    }

    const allCardsFullInfo = []

    // for (let i=0;i<4;i++){
      for (let i=0;i<allCards.length;i++){
      let currentSet = allCards[i];
      for(let r=0;r<currentSet.length;r++){

        const card = await tcgdex.fetchCard(allCards[i][r].id);
        allCardsFullInfo.push(card);
      } 
    }
    
      // const card = await tcgdex.fetchCard(allCards[0][0].id);
  
  
  
// res.send(card).status(200);
res.send(allCardsFullInfo).status(200);
})

// router to get list of all sets from tcgdex
router.get("/getCardsFromTcgDex",async(req,res)=> {
  let cardSets = await tcgdex.fetchSets('tcgp');
    // const allSets = await getNamesOfAllSets();
    const ids = cardSets.map(set => set.id);
    // remove P-A
    const filterId = ids.filter(set => set != "P-A") 
    // console.log(filterId)
    // will store all cards from loop
    const allCards = []
    let setNo = 5
    // let currentSetCards = await tcgdex.fetchCards(allSets[setNo]);
    // fs.writeFileSync("set"+setNo+".json", JSON.stringify(currentSetCards, null, 2), "utf8");
    
    for(let i=0;i<filterId.length; i++){
      let currentSetCards = await tcgdex.fetchCards(filterId[i]);
      allCards.push(currentSetCards);
    }
    // console.log(allCards.flat(Infinity).length)
    // console.log(allCards.length)
    // fs.writeFileSync("tcg-pocket-cards2.json", JSON.stringify(allCards, null, 2), "utf8");
  
  res.send(allCards).status(200);
})




// This section will help you get a list of all the records.
router.get("/", async (req, res) => {
  let collection = await db.collection(collectionPokemonName);
  let results = await collection.find({}).toArray();
  res.send(results).status(200);
});

// This section will help you get a single record by id
router.get("/:id", async (req, res) => {
  let collection = await db.collection(collectionPokemonName);
  let query = { _id: new ObjectId(req.params.id) };
  let result = await collection.findOne(query);
  
  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
});


// This section will help you create a new record.
router.post("/", async (req, res) => {
  try {
    let newDocument = {
      name: req.body.name,
      position: req.body.position,
      level: req.body.level,
    };
    let collection = await db.collection(collectionPokemonName);
    let result = await collection.insertOne(newDocument);
    res.send(result).status(204);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding record");
  }
});

// Account creation

router.post(`/${routerUserAccounts}`,async (req,res) => {
  try{
    const currentDate = formatDate(Date.now())
    let newUser = {
      name: req.body.name,
      lastLogIn: currentDate,
      email:req.body.email,
      password:req.body.password,
      discordId:req.body.discordId,
      accounts:[
      ]
    };
    // res.send(req.body.accounts[0].tcgIdNo).status(500)

    // this maps all the accounts inside to the newUser Object
    req.body.accounts.map((currentAccount,idx) => {
        newUser.accounts.push(
          {
            
            tcgIdNo:req.body.accounts[idx].tcgIdNo,
            tcgIdName:req.body.accounts[idx].tcgIdName,
            cardTrades:{
              cardsWanted:[],
              cardsForTrade:[],
            }

        }
      )
    })
    let collection = await db.collection(collectionUserAccounts);
    let emailClash =await collection.findOne({email:newUser.email})
    let usernameClash =await collection.findOne({name:newUser.name})

    if(!emailClash && !usernameClash) {
      res.status(200).send("user can be created");
      let result = await collection.insertOne(newUser);
      res.send(result).status(204);
      
    }else if(usernameClash){
      res.status(400).send("username exists");

    }
    
    else if(emailClash){
      res.status(400).send("email exists");
    }
    

  
  }catch(err){
    console.error(err);
    res.status(500).send("Error adding user");
  }
});

//get user

// This section will help you update a record by id.
router.patch("/:id", async (req, res) => {
  try {
    const query = { _id: new ObjectId(req.params.id) };
    const updates = {
      $set: {
        name: req.body.name,
        position: req.body.position,
        level: req.body.level,
      },
    };

    res.send(result).status(200);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating record");
  }
});

// patch account and submit new cards

// takes an array with 

// [cardswanted(1card id, quantity, language)
//   cardsForTrade(1card id, quantity, language)

// ]

// routes/users.js (or wherever your user routes live)

// router.patch("/users/:userId/trades", (req, res) => {
/**
 * PATCH /record/accounts/:userId/cardsDeal
 * Body:
 * {
 *   "list": "cardsWanted" | "cardsForTrade",
 *   "card": { "language": "en", "id": "sv1-1" },
 *   "delta": 1 | -1 (integer, non-zero)
 * }
 *
 * Behavior:
 * - owner is taken from :userId (ignores any owner from client)
 * - if (id+language+owner) exists -> $inc quantity by delta
 * - if no match and delta > 0 -> push new entry with quantity=delta
 * - if no match and delta <= 0 -> 409 error
 * - does NOT auto-remove when quantity <= 0 (next step)
 */
// routes/users.js

/**
 * PATCH /record/accounts/:userId/cardsDeal
 * Body: {
 *   list: "cardsWanted" | "cardsForTrade",
 *   card: { language: "en"|"ja"|..., id: "sv1-1" },
 *   delta: integer (e.g. 1 or -1, non-zero)
 * }
 *
 * Rules added:
 * - Owner is :userId (ignore owner in body).
 * - If delta > 0 (adding) and the *other* list is empty, REFUSE (409).
 * - If matching (id+language+owner) exists → $inc quantity by delta.
 * - If no match and delta > 0 → $push new with quantity = delta.
 * - If no match and delta < 0 → 409 conflict.
 * - If delta < 0 and quantity drops to <= 0 → auto-remove that array entry.
 */

// ---- helpers ----
function hasItems(arr) {
  return Array.isArray(arr) && arr.length > 0;

}


// Resolve incoming cardIdRaw → logicalId ("A1-001")
// Accepts either "A1-001" or a 24-hex Mongo _id string from `records`


// at top: import { ObjectId } from "mongodb";

async function resolveLogicalCardId(db, cardIdRaw) {
  const raw = String(cardIdRaw || "").trim();
  if (!raw) return null;

  const recs = db.collection("records");
  const isHex24 = /^[0-9a-fA-F]{24}$/.test(raw);

  // a) If it looks like a Mongo _id, try both ObjectId and string _id
  if (isHex24) {
    // try as ObjectId(_id)
    try {
      const byObjId = await recs.findOne({ _id: new ObjectId(raw) }, { projection: { id: 1 } });
      if (byObjId?.id) return String(byObjId.id).trim();
    } catch (_) {
      /* ignore bad ObjectId */
    }
    // try as string _id
    const byStringId = await recs.findOne({ _id: raw }, { projection: { id: 1 } });
    if (byStringId?.id) return String(byStringId.id).trim();
  }

  // b) Otherwise, if caller already sent logical id, just return it
  //    Also cover case where caller sent hex but it actually lives in the 'id' field.
  const byLogical = await recs.findOne({ id: raw }, { projection: { id: 1 } });
  if (byLogical?.id) return String(byLogical.id).trim();

  // c) fall through
  return raw || null;
}


// Look up records by `id: <cardId>` instead of `_id`
async function syncRecordsDelta({ cardId, userId, lang, delta }) {
  const recs = db.collection("records");
  const userLangPath = `tradeUsers.${userId}.${lang}`;
  const selector = { id: cardId };

  console.log("[syncRecordsDelta] START", { cardId, userId, lang, delta });

  try {
    // 0) ensure base doc exists
    const setOnInsert = { id: cardId, availableCards: 0, tradeUsers: {} };
    const upsertRes = await recs.updateOne(selector, { $setOnInsert: setOnInsert }, { upsert: true });
    console.log("[syncRecordsDelta] ensure base doc", upsertRes);

    // 1) apply delta
    const incRes = await recs.updateOne(
      selector,
      { $inc: { availableCards: delta, [userLangPath]: delta } }
    );
    console.log("[syncRecordsDelta] incRes", incRes);

    // 2) cleanup
    const unsetRes = await recs.updateOne(
      { ...selector, [userLangPath]: { $lte: 0 } },
      { $unset: { [userLangPath]: "" } }
    );
    const floorRes = await recs.updateOne(
      { ...selector, availableCards: { $lt: 0 } },
      { $set: { availableCards: 0 } }
    );
    console.log("[syncRecordsDelta] cleanup", { unsetRes, floorRes });

    console.log("[syncRecordsDelta] DONE ✅");
  } catch (err) {
    console.error("[syncRecordsDelta] ERROR ❌", err);
  }
}



// Update cards

// request comes with 

// TODO - for loop (outside of patch , sends :


// ^ this function is taking in the following object:
/*
{
  "list": "cardsForTrade",
  "card": { "language": "es", "id": "cardNameId" },
  "delta": 1
  }
  */

// ^ Validation works with:
/*
req.user.id is the mongodb _id
check if it matches with the userID url sent from frontend 
if not it rejects request

*/
 
 
 router.patch(`/${routerUserAccounts}/:userId/${routerCards}`, authJwt, async (req, res) => {
   try {
    //  console.log(req)
     // userId info comes from authJwt
     // ^ tcgIdNo && card Selected && CardsWanted OR cardsForTrade && quantity && language
    const { userId } = req.params;
      const {tcgIdNo} = req.body || {};
    const { list, card } = req.body || {};
    let { delta } = req.body || {};
    const pokemonDb = db.collection("records");
    
    
    
    // --- auth: only self can modify
    if (req.user?.id !== userId) {
      return res.status(403).json({ code: "forbidden", message: "Can only modify your own trades" });
    }
    
    
    // --- validate
    if (!ObjectId.isValid(userId)) return res.status(400).json({ code: "bad_user_id", message: "Invalid userId" });
    const allowed = ["cardsWanted", "cardsForTrade"];
    if (!allowed.includes(list)) return res.status(400).json({ code: "bad_list", message: `list must be one of ${allowed.join(", ")}` });
    if (!card || !card.id || !card.language) {
      return res.status(400).json({ code: "bad_card", message: "card needs id and language" });
    }
    delta = parseInt(delta, 10);
    if (!Number.isFinite(delta) || delta === 0) {
      return res.status(400).json({ code: "bad_delta", message: "delta must be a non-zero integer (e.g., 1 or -1)" });
    }
    if (delta > 10) delta = 10;
    if (delta < -10) delta = -10;
    
    const ownerId = new ObjectId(userId);
    
    
    // --- fetch pre-state to detect activation transition later
    const preDoc = await db.collection("accounts").findOne(
      { _id: ownerId },
      // { projection: { "cardTrades.cardsWanted": 1, "cardTrades.cardsForTrade": 1 } }
    );
    if (!preDoc) return res.status(404).json({ code: "user_not_found", message: "No account with that id" });
    
    // ^ for loop (in user.accounts) to find
    // * each request to FIND account IN user that MATCHES tcgIdNo ,
    // console.log(preDoc)
    const currentUserAccount = preDoc.accounts.find(currentAccount => currentAccount.tcgIdNo === tcgIdNo)

/*
update this currentTcgIdNoCardUpdateObject with either 

 {
              "id": "A1-003",
              "language": {
                "en": 1,
                "es": 1
              },
              
              "quantity": 1,
              "owner": "tcgIdNo"
            }


            OR

            push new language into "language" and respective quantity

            OR

            update selected language quantity



*/
//   type language= {
  //     [l in Languages]:number;
  //   }
  
  // type newUserCardSubmission ={
    //   id:string,
    //   language:{},
    // }
    
    
    let languages = ["en" , "es" ,"fr" , "de", "it" , "pt", "jp" ,"kr", "ch"];
    let currentTcgIdNoCardUpdateObject = {
      
    }
    
    
    
    
    
    // check if user is adding to cardsforTrade or cardsWanted
    if(list == "cardsWanted"){
      // ^ goal - patch currentTcgIdNo with card and language with current quantity
      /*
      check IF card Is already there by checking IF id is already in objects 
      
      {
        tcgIdNo: '1340-2340',
        tcgIdName: 'idName',
        cardTrades: { cardsWanted: [], cardsForTrade: [] }  
        }
        */
       const isCardAlreadyInCardsWanted = currentUserAccount.cardTrades.cardsWanted.find(currentcard => currentcard.id ===card.id)
       //  if card is there, check for language,
       if(isCardAlreadyInCardsWanted){
        //  IS matching language is already there
        try{
          
          const isLangAlreadyInCard = isCardAlreadyInCardsWanted.language[language];
          // if its there, update quantity 
          if(isLangAlreadyInCard !== undefined){
            // if delta positive
           if(delta>0){
             //        then add  to quantity of selected card WITH matching id AND language
             
          }else{
            // ^          IF quantity of selected card after reducing is smaller than 0
            // remove card from tcgid account
            //            remove card from cardsWanted OR cardsForTrade
            //          ELSE
            //            then reduce to quantity of selected card WITH matching id AND language
           }
          //  ^IF matches 
          
          
        }
      }catch(err){
        
      }
      
      
      //  card is not in tcgId account
    }else if(!isCardAlreadyInCardsWanted){
        //  ^IF NOT, add a new card object to chosen (CardsWanted or cardsForTrade) with selected quantity
        console.log("card not ni cards wanted")
        try{
          // object hasn't been created yet, so there cannot be any kind of notation,
          // it has to be a new object with all the variables and their names
          // replace dot notations for square braket notations
          currentTcgIdNoCardUpdateObject['id'] =card.id;

          currentTcgIdNoCardUpdateObject['language']={};
          // add all languages to this card
          languages.forEach((currentLang,idx)=> {
            currentTcgIdNoCardUpdateObject['language'][currentLang]=0; 
            
          } )
          
          if(languages.includes(card.language)){
            // for example, request has "es", so it checks out, otherwise return false request
            currentTcgIdNoCardUpdateObject['language'][card.language]=delta; 

          }else{
            // cancels request, asks to return correct language in return
            return res.status(400).json({ code: "bad_delta", message: "language doesn't match one existent in Pokemon Pocket" });
          }


          currentTcgIdNoCardUpdateObject['tcgIdNo']=currentUserAccount.tcgIdNo,
          currentTcgIdNoCardUpdateObject['tcgIdName']=currentUserAccount.tcgIdName,
    
          
          
          
          
          console.log(currentTcgIdNoCardUpdateObject);


          // Specify card object push into database
          /*
          add currentTcgIdNoCardUpdateObject to mongodb
           updateOne
            filter - _id:ownerid
            {
            Q
            }

          */

          const insertNewCardInCardsWanted = await pokemonDb.updateOne(
            { _id: ownerId }
          )


         


        }catch(error){
          console.log(error)
        }
      // in this loop, it sets all to the delta, and after this is created this won't be called anymore


      }else{
        // card is already in the tcgId Account in CardsWanted
        // update
      }
    }

  }catch(error){
    
  }
  
  
  return res.status(201).json({message:``})
});
/*
 

  ^if its cardsForTrade
  for loop (in cards database) to find card from cardSelected
    IF there's an object in tradeUsers(loop) with matching tcgIDNo
      IF language is already there
        IF Quantity is positive
          Add to quantity
        IF quantity is negative
          IF current quantity is smaller
            remove language
            IF there's no languages left in current TCGIDNo object in current card in cards database
              remove TCGIDno object from current card
            
          




{
    "id": "A1-003",
    "language": "en",
    "quantity": 2,
    "tcgIdNo": "6915bdc1a03d8cdb3d287ac1"
}




*/

router.patch(`/${routerUserAccounts}/:userId/${routerCards}/previousFunction`, authJwt, async (req, res) => {
  try {
    const { userId } = req.params;
    const { list, card } = req.body || {};
    let { delta } = req.body || {};

console.log("[PATCH cardsDeal] REQUEST", {
      url: req.originalUrl,
      method: req.method,
      userParam: userId,
      authUser: req.user?.id,
      list,
      card,
      delta
    });

 

    // ✅ INSERT THIS HERE
    const cardIdRaw = card?.id;
    const logicalId = await resolveLogicalCardId(db, cardIdRaw);
    if (!logicalId) {
      return res.status(400).json({
        code: "bad_card_id",
        message: "Unknown card id. Send the card code (e.g., 'A1-001') or a valid records _id."
      });
    }

    const cardId = logicalId;  // <-- Use this everywhere below instead of card.id
    const lang = String(card.language).trim();
    console.log("[PATCH cardsDeal] resolved cardId:", cardId);
    // ✅ END INSERT

 

    // ... rest of patch continues

    // --- auth: only self can modify
    if (req.user?.id !== userId) {
      return res.status(403).json({ code: "forbidden", message: "Can only modify your own trades" });
    }

    // --- validate
    if (!ObjectId.isValid(userId)) return res.status(400).json({ code: "bad_user_id", message: "Invalid userId" });
    const allowed = ["cardsWanted", "cardsForTrade"];
    if (!allowed.includes(list)) return res.status(400).json({ code: "bad_list", message: `list must be one of ${allowed.join(", ")}` });
    if (!card || !card.id || !card.language) {
      return res.status(400).json({ code: "bad_card", message: "card needs id and language" });
    }
    delta = parseInt(delta, 10);
    if (!Number.isFinite(delta) || delta === 0) {
      return res.status(400).json({ code: "bad_delta", message: "delta must be a non-zero integer (e.g., 1 or -1)" });
    }
    if (delta > 10) delta = 10;
    if (delta < -10) delta = -10;

    const ownerId = new ObjectId(userId);
    // const cardId = String(card.id).trim();
    // const lang = String(card.language).trim();
    const targetPath = `cardTrades.${list}`;

    // --- fetch pre-state to detect activation transition later
    const preDoc = await db.collection("accounts").findOne(
      { _id: ownerId },
      { projection: { "cardTrades.cardsWanted": 1, "cardTrades.cardsForTrade": 1 } }
    );
    if (!preDoc) return res.status(404).json({ code: "user_not_found", message: "No account with that id" });

    console.log("[PATCH cardsDeal] PRE-STATE", {
  wantedCount: preDoc?.cardTrades?.cardsWanted?.length || 0,
  forTradeCount: preDoc?.cardTrades?.cardsForTrade?.length || 0,
  cardTrades: preDoc?.cardTrades
});

    const preHasWanted = hasItems(preDoc?.cardTrades?.cardsWanted);
    const preHasForTrade = hasItems(preDoc?.cardTrades?.cardsForTrade);
    const preActive = preHasWanted && preHasForTrade;

    // --- ACCOUNTS: try to $inc existing (id+language+owner)
    const incResult = await db.collection("accounts").updateOne(
      { _id: ownerId },
      { $inc: { [`${targetPath}.$[elem].quantity`]: delta } },
      {
        arrayFilters: [
          { "elem.id": cardId, "elem.language": lang, "elem.owner": ownerId }
        ]
      }
    );
    if (incResult.matchedCount === 0) {
      return res.status(404).json({ code: "user_not_found", message: "No account with that id" });
    }

    let action = null;
    let removed = false;

    if (incResult.modifiedCount > 0) {
      action = "inc";

      // If we decremented, auto-remove the element when qty <= 0
      if (delta < 0) {
        const pullResult = await db.collection("accounts").updateOne(
          { _id: ownerId },
          {
            $pull: {
              [targetPath]: {
                id: cardId,
                language: lang,
                owner: ownerId,
                quantity: { $lte: 0 }
              }
            }
          }
        );
        removed = pullResult.modifiedCount > 0;
      }
    } else {
      // No existing element matched
      if (delta > 0) {
        await db.collection("accounts").updateOne(
          { _id: ownerId },
          { $push: { [targetPath]: { id: cardId, language: lang, quantity: delta, owner: ownerId } } }
        );
        action = "pushed_new";
      } else {
        return res.status(409).json({
          ok: false,
          code: "no_match_to_decrement",
          message: "Cannot decrement: card not found for this id+language+owner in the selected list"
        });
      }
    }

    // --- fetch post-state to determine ACTIVE status
    const postDoc = await db.collection("accounts").findOne(
      { _id: ownerId },
      { projection: { "cardTrades.cardsWanted": 1, "cardTrades.cardsForTrade": 1 } }
    );


    
    const postHasWanted = hasItems(postDoc?.cardTrades?.cardsWanted);
    const postHasForTrade = hasItems(postDoc?.cardTrades?.cardsForTrade);
    const postActive = postHasWanted && postHasForTrade;

//     const preHasWanted = Array.isArray(preDoc?.cardTrades?.cardsWanted) && preDoc.cardTrades.cardsWanted.length > 0;
// const preHasForTrade = Array.isArray(preDoc?.cardTrades?.cardsForTrade) && preDoc.cardTrades.cardsForTrade.length > 0;
// const postHasWanted = Array.isArray(postDoc?.cardTrades?.cardsWanted) && postDoc.cardTrades.cardsWanted.length > 0;
// const postHasForTrade = Array.isArray(postDoc?.cardTrades?.cardsForTrade) && postDoc.cardTrades.cardsForTrade.length > 0;
// const preActive = preHasWanted && preHasForTrade;
// const postActive = postHasWanted && postHasForTrade;

console.log("[PATCH cardsDeal] ACTIVE-STATE", {
  preHasWanted,
  preHasForTrade,
  preActive,
  postHasWanted,
  postHasForTrade,
  postActive
});

    // --- RECORDS sync rules ---
    // Only when ACTIVE. While not active, we never touch 'records'.
    if (postActive) {
      if (list === "cardsForTrade") {
        // Normal path: mirror just this card's delta to records
        await syncRecordsDelta({ cardId, userId, lang, delta });
      } else if (!preActive && postActive) {
        // Activation achieved by adding first Wanted → backfill ALL existing cardsForTrade into records
        const stagedForTrade = postDoc?.cardTrades?.cardsForTrade || [];
        // Merge duplicates per (id,language) for safety
        const totals = new Map(); // key = id|lang, val = quantity sum
        for (const c of stagedForTrade) {
          if (!c || typeof c !== "object") continue;
          const idStr = String(c.id || "").trim();
          const lStr = String(c.language || "").trim();
          const qty = Number.isFinite(c.quantity) ? c.quantity : 0;
          if (!idStr || !lStr || qty <= 0) continue;
          const k = `${idStr}|${lStr}`;
          totals.set(k, (totals.get(k) || 0) + qty);
        }
        for (const [k, qty] of totals.entries()) {
          const [idStr, lStr] = k.split("|");
          await syncRecordsDelta({ cardId: idStr, userId, lang: lStr, delta: qty });
        }
      }
    }

    return res.status(200).json({
      ok: true,
      action,
      list,
      key: { id: cardId, language: lang, owner: userId },
      delta,
      removedOnZeroOrLess: removed,
      state: { preActive, postActive }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ code: "db_error", message: err.message });
  }
});






// This section will help you delete a record
router.delete("/:id",authJwt, async (req, res) => {
  try {
    const query = { _id: new ObjectId(req.params.id) };

    const collection = db.collection(collectionPokemonName);
    let result = await collection.deleteOne(query);

    res.send(result).status(200);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting record");
  }
});



// --- Bulk insert (POST /record/bulk) ---
const chunk = (arr, size) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

router.post("/bulk", async (req, res) => {
  try {
    // Accept either an array or { items: [...] }
    const items = Array.isArray(req.body) ? req.body : req.body?.items;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Send an array or { items: [...] }" });
    }

    // Tune batch size to your workload; 500–1000 is a good start
    const batches = chunk(items, 1000);
    const collection = db.collection(collectionPokemonName);

    let inserted = 0;
    const errors = [];

    for (const batch of batches) {
      try {
        const result = await collection.insertMany(batch, { ordered: false });
        const count = result.insertedCount ?? Object.keys(result.insertedIds || {}).length;
        inserted += count;
      } catch (e) {
        // Keep going on per-doc errors (e.g., duplicate key) and collect messages
        errors.push({ batchSize: batch.length, message: e.message });
      }
    }

    // 207 = Multi-Status (some successes, some failures)
    return res.status(errors.length ? 207 : 200).json({
      ok: true,
      inserted,
      batches: batches.length,
      errors,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});
// --- end bulk route ---


export default router;