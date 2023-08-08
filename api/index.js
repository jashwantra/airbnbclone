const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const cookieParser = require("cookie-parser");
const User = require("./models/User");
const Place = require("./models/Place");
const Booking = require("./models/Booking");
const imageDownloader = require("image-downloader");
const multer = require("multer");
const fs = require("fs");

const app = express();

const bcryptNoOfSaltRounds = 10;
const jwtSecret = process.env.SECRET_KEY;

app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(__dirname + "/uploads"));

app.use(cors({
    credentials: true,
    origin: ["http://localhost:3000", "http://192.168.1.17:3000"],
}));

mongoose.connect(process.env.MONGO_URL);

app.get("/test", function (req, res) {
    res.json('test ok');
});

app.post("/register", async function (req, res) {
    const { name, email, password } = req.body;
    bcrypt.hash(password, bcryptNoOfSaltRounds, async function (err, hash) {
        try {
            const userDoc = await User.create({
                name: name,
                email: email,
                password: hash
            });
            res.json(userDoc);
        } catch (error) {
            res.status(422).json(error);
        }

    });
});

app.post("/login", async function (req, res) {
    const { email, password } = req.body;
    const userDoc = await User.findOne({ email: email });
    if (userDoc) {
        bcrypt.compare(password, userDoc.password, function (err, result) {
            if (result) {
                jwt.sign({ email: userDoc.email, id: userDoc._id }, jwtSecret, {}, function (error, token) {
                    if (err) throw err;
                    res.cookie('token', token, { secure: true, sameSite: "none" }).json(userDoc);
                });
            } else {
                res.status(422).json("pass not ok");
            }
        });
    } else {
        res.status(422).json("Not found");
    }
});

app.get("/profile", function (req, res) {
    const { token } = req.cookies;
    if (token) {
        jwt.verify(token, jwtSecret, {}, async function (err, userData) {
            if (err) {
                res.json(null);
            } else {
                const { name, email, _id } = await User.findById(userData.id);
                res.json({ name, email, _id });
            }
        });
    } else {
        res.json(null);
    }
});

app.post("/logout", function (req, res) {
    res.cookie('token', '').json(true);
});

app.post("/upload-by-link", async function (req, res) {
    const { link } = req.body;
    const newName = "photo" + Date.now() + ".jpg";
    try {
        await imageDownloader.image({ url: link, dest: __dirname + "/uploads/" + newName });
        res.json(newName);
    } catch (err) {
        res.json(null);
    }
});

const photosMiddleware = multer({ dest: "uploads/" });
app.post("/upload", photosMiddleware.array("photos", 100), async function (req, res) {
    const uploadedFiles = [];
    for (let i = 0; i < req.files.length; i++) {
        const { path, originalname } = req.files[i];
        const parts = originalname.split(".");
        const ext = parts[parts.length - 1];
        const newPath = path + "." + ext;
        fs.renameSync(path, newPath);
        uploadedFiles.push(newPath.replace("uploads\\", ""));
    }
    res.json(uploadedFiles);
});

app.post("/places", function (req, res) {
    const { token } = req.cookies;
    if (!token) {
        res.json(null);
    } else {
        const {
            title, address, addedPhotos, description,
            perks, extraInfo, checkIn, checkOut, maxGuests, price
        } = req.body;
        jwt.verify(token, jwtSecret, {}, async function (err, userData) {
            if (err) {
                res.json(null);
            } else {
                const placeDoc = await Place.create({
                    owner: userData.id,
                    title, address, photos: addedPhotos, description,
                    perks, extraInfo, checkIn, checkOut, maxGuests, price
                });
                res.json(placeDoc);
            }
        });
    }
});

app.get("/user-places", async function (req, res) {
    const { token } = req.cookies;
    if (token) {
        jwt.verify(token, jwtSecret, {}, async function (err, userData) {
            if (err) {
                res.json(null);
            };
            const foundPlaces = await Place.find({ owner: userData.id });
            res.json(foundPlaces);
        });
    } else {
        res.json(null);
    }
});

app.put("/places", async function (req, res) {
    const { token } = req.cookies;
    if (!token) {
        res.json(null);
    } else {
        const {
            id, title, address, addedPhotos, description,
            perks, extraInfo, checkIn, checkOut, maxGuests, price
        } = req.body;
        jwt.verify(token, jwtSecret, {}, async function (err, userData) {
            if (err) {
                res.json(null);
            } else {
                const placeDoc = await Place.findById(id);
                if (userData.id === placeDoc.owner.toString()) {
                    placeDoc.set({
                        title, address, photos: addedPhotos,
                        description, perks, extraInfo,
                        checkIn, checkOut, maxGuests, price
                    });
                    await placeDoc.save();
                    res.json("ok");
                } else {
                    res.json("not ok");
                }
            }
        });
    }
});

app.get("/places/:id", async function (req, res) {
    const { id } = req.params;
    res.json(await Place.findById(id));
});

app.get("/places", async function (req, res) {
    res.json(await Place.find());
});

app.post("/bookings", async function (req, res) {
    const { token } = req.cookies;
    if (!token) {
        res.json(null);
    } else {
        jwt.verify(token, jwtSecret, {}, async function (err, userData) {
            if (err) {
                res.json(null);
            } else {
                const { place, checkIn, checkOut,
                    numberOfGuests, name, phone, price } = req.body;
                Booking.create({
                    place, user: userData.id, checkIn, checkOut,
                    numberOfGuests, name, phone, price,
                }).then((doc) => {
                    res.json(doc);
                }).catch((err) => {
                    res.json(null);
                });
            }
        });
    }
});

app.get("/bookings", async function (req, res) {
    const { token } = req.cookies;
    if (!token) {
        res.json(null);
    } else {
        jwt.verify(token, jwtSecret, {}, async function (err, userData) {
            if (err) {
                res.json(null);
            } else {
                res.json(await Booking.find({ user: userData.id }).populate("place"));
            }
        });
    }
});

app.listen(4000, function () {
    console.log("Server started on PORT 4000.");
});
