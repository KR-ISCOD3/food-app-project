import express from "express";
import passport from "passport";
import session from "express-session";
import dotenv from "dotenv";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

dotenv.config();

const app = express();

// Middleware for session handling
app.use(
    session({
      secret: process.env.SESSION_SECRET, // Replace with your secret key
      resave: false,
      saveUninitialized: true,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      },
    })
  );

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport Configuration
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    (accessToken, refreshToken, profile, done) => {
        return done(null, profile);
    }
  )
);

// Serialize and deserialize user
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Routes
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/profile");
  }
);

app.get("/profile", (req, res) => {
    if (!req.user) return res.redirect("/");
    res.send(`
      <h1>Profile</h1>
      <p><strong>Name:</strong> ${req.user.displayName}</p>
      <p><strong>Email:</strong> ${req.user.emails[0].value}</p>
      <img src="${req.user.photos[0].value}" alt="Profile Picture" style="border-radius:50%;width:100px;height:100px;">
    `);
  });

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.send("Error logging out");
    res.redirect("/");
  });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
