import "dotenv/config";
import express, { response } from "express";
import cors from "cors";
import {createClient} from "@supabase/supabase-js"

// if (process.env.NODE_ENV !== "production") {
//   dotenv.config({ path: ".env" });
// }
console.log(meta.env.VITE_SUPABASE_URL);
const PORT = process.env.PORT || 5050;
const app = express();

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY);

async function signUpNewUser() {
  const { data, error } = await supabase.auth.signUp({
    email: 'valid.email@supabase.io',
    password: 'example-password',
    options: {
      emailRedirectTo: '/about',
    },
  })
}


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
  

  

    
    
    //start Express server
    app.listen(PORT, ()=> {
      console.log(`Server listening on port ${PORT}`);
    });