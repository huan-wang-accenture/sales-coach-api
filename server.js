const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '$2b$10$rKqwBxZlLZJlGQ0p3mXDQOxCZqJxVZ5xHKQ5fKYZQqYZqYZqYZqYZ'; // Default: 'password123'

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static('public'));

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required. Please login first.'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }
    req.user = user;
    next();
  });
};

// Initial data (your sales coach items)
let items = [
  { id: 0, SKU: "10050", PACK: "BAG", SIZE: "50#", BRAND: "WESTCO", ITEM: "BUTTERMILK BISCUIT MIX", CATEGORY: "Cat 6 Mix Cookie-Biscuit-Pancake-Churro", PRICE: "212" },
  { id: 1, SKU: "10058", PACK: "BAG", SIZE: "50#", BRAND: "WESTCO", ITEM: "BISCUIT AND SCONE MIX S/O ", CATEGORY: "Cat 6 Mix Cookie-Biscuit-Pancake-Churro", PRICE: "203" },
  { id: 2, SKU: "10065", PACK: "BAG", SIZE: "30#", BRAND: "WESTCO", ITEM: "SCRUMPTIOUS SCONE MIX", CATEGORY: "Cat 6 Mix Cookie-Biscuit-Pancake-Churro", PRICE: "290" },
  { id: 3, SKU: "31566", PACK: "BAG", SIZE: "50#", BRAND: "WESTCO", ITEM: "ALL NATURAL SCONE MIX S/O", CATEGORY: "Cat 6 Mix Cookie-Biscuit-Pancake-Churro", PRICE: "277" },
  { id: 4, SKU: "10920", PACK: "BAG", SIZE: "25#", BRAND: "WESTCO", ITEM: "BUTTERMILK PANCAKE MIX", CATEGORY: "Cat 6 Mix Cookie-Biscuit-Pancake-Churro", PRICE: "30" },
  { id: 5, SKU: "39965", PACK: "BOX", SIZE: "50#", BRAND: "BAKEMA", ITEM: "NO TIME BREAD BASE", CATEGORY: "Cat 4 Mixes Bread Tortilla", PRICE: "126" },
  { id: 6, SKU: "30998", PACK: "BAG", SIZE: "50#", BRAND: "WESTCO", ITEM: "KOLACHE MIX GENUINE ", CATEGORY: "Cat 4 Mixes Bread Tortilla", PRICE: "12" },
  { id: 7, SKU: "12672", PACK: "BAG", SIZE: "50#", BRAND: "WESTCO", ITEM: "KOLACHE MIX  ORIGINAL  S/O", CATEGORY: "Cat 4 Mixes Bread Tortilla", PRICE: "19" },
  { id: 8, SKU: "30821", PACK: "BAG", SIZE: "50#", BRAND: "WESTCO", ITEM: "ENGLISH MUFFIN CONCENTRATE", CATEGORY: "Cat 4 Mixes Bread Tortilla", PRICE: "272" },
  { id: 9, SKU: "4474", PACK: "BOX", SIZE: "50#", BRAND: "CARAVN", ITEM: "DINNER ROLL #20 ", CATEGORY: "Cat 20 Caravan", PRICE: "97" },
  { id: 10, SKU: "12458", PACK: "CTN", SIZE: "50#", BRAND: "CARAVA", ITEM: "BREAD BASE  #14 TFF S/O", CATEGORY: "Cat 20 Caravan", PRICE: "223" },
  { id: 11, SKU: "6746", PACK: "CTN", SIZE: "50#", BRAND: "CARAVA", ITEM: "POTATO  FRESH BAKED  #10 BASE ", CATEGORY: "Cat 20 Caravan", PRICE: "240" },
  { id: 12, SKU: "16204", PACK: "CTN", SIZE: "50#", BRAND: "CARAVA", ITEM: "2X HEART OF RYE BASE", CATEGORY: "Cat 20 Caravan", PRICE: "11" },
  { id: 13, SKU: "16002", PACK: "CTN", SIZE: "50#", BRAND: "CARAVA", ITEM: "BLACK RUSSIAN PUMPRNICKEL ", CATEGORY: "Cat 20 Caravan", PRICE: "202" },
  { id: 14, SKU: "20315", PACK: "CTN", SIZE: "50#", BRAND: "CARAVA", ITEM: "HALF AND HALF DARK PUMPERNICKEL", CATEGORY: "Cat 20 Caravan", PRICE: "28" },
  { id: 15, SKU: "9976", PACK: "BOX", SIZE: "50#", BRAND: "WESTCO", ITEM: "BAGEL 5% BASE NB", CATEGORY: "Cat 4 Mixes Bread Tortilla", PRICE: "90" },
  { id: 16, SKU: "20519", PACK: "CTN", SIZE: "60#", BRAND: "CARAVA", ITEM: "BAGEL-EZE-5%", CATEGORY: "Cat 20 Caravan", PRICE: "294" },
  { id: 17, SKU: "12348", PACK: "CTN", SIZE: "3/15#", BRAND: "CARAVA", ITEM: "NY CINN RAISIN BAGEL", CATEGORY: "Cat 20 Caravan", PRICE: "161" },
  { id: 18, SKU: "12346", PACK: "CTN", SIZE: "5/10#", BRAND: "CARAVA", ITEM: "NY BEST BAGEL", CATEGORY: "Cat 20 Caravan", PRICE: "78" },
  { id: 19, SKU: "12347", PACK: "CTN", SIZE: "2/20#", BRAND: "CARAVA", ITEM: "GREAT GRAIN BAGEL BASE ", CATEGORY: "Cat 20 Caravan", PRICE: "227" },
  { id: 20, SKU: "16240", PACK: "CTN", SIZE: "3/15#", BRAND: "CARAVA", ITEM: "NY TRU-BLUE BAGEL  S/O ", CATEGORY: "Cat 20 Caravan", PRICE: "194" },
  { id: 21, SKU: "15025", PACK: "CSE", SIZE: "3/16#", BRAND: "CARAVA", ITEM: "SOFTEE PRETZEL MIX S/O ", CATEGORY: "Cat 20 Caravan", PRICE: "260" },
  { id: 22, SKU: "9969", PACK: "BOX", SIZE: "50#", BRAND: "WESTCO", ITEM: "SUTTER'S MILL SOUR DO 10%", CATEGORY: "Cat 4 Mixes Bread Tortilla", PRICE: "280" },
  { id: 23, SKU: "40021", PACK: "BAG", SIZE: "50#", BRAND: "BAKEMA", ITEM: "EXTRA SOUR DOUGH 10%", CATEGORY: "Cat 4 Mixes Bread Tortilla", PRICE: "10" },
  { id: 24, SKU: "15036", PACK: "CSE", SIZE: "50#", BRAND: "CARAVA", ITEM: "BIG '49ER", CATEGORY: "Cat 20 Caravan", PRICE: "206" },
  { id: 25, SKU: "16307", PACK: "CTN", SIZE: "50#", BRAND: "CARAVA", ITEM: "PACIFIC SOUR", CATEGORY: "Cat 20 Caravan", PRICE: "24" },
  { id: 26, SKU: "5576", PACK: "CTN", SIZE: "45#", BRAND: "CARAVA", ITEM: "ALL PURPOSE WHITE SOUR S/O ", CATEGORY: "Cat 20 Caravan", PRICE: "11" },
  { id: 27, SKU: "30125", PACK: "BAG", SIZE: "50#", BRAND: "TRIGAL", ITEM: "BOLILLO INTREGRAL 100% MIX", CATEGORY: "Cat 4 Mixes Bread Tortilla", PRICE: "190" },
  { id: 28, SKU: "39978", PACK: "BAG", SIZE: "50#", BRAND: "WESTCO", ITEM: "SQUAW BREAD MIX", CATEGORY: "Cat 4 Mixes Bread Tortilla", PRICE: "287" },
  { id: 29, SKU: "12358", PACK: "CTN", SIZE: "35#", BRAND: "CARAVA", ITEM: "INDIAN GRAIN BREAD BASE ", CATEGORY: "Cat 20 Caravan", PRICE: "58" },
  { id: 30, SKU: "39987", PACK: "BAG", SIZE: "50#", BRAND: "WESTCO", ITEM: "BAVARIAN GRAIN 50%", CATEGORY: "Cat 4 Mixes Bread Tortilla", PRICE: "175" },
  { id: 31, SKU: "12199", PACK: "CTN", SIZE: "50#", BRAND: "CARAVA", ITEM: "7 GRAIN BREAD MIX ", CATEGORY: "Cat 20 Caravan", PRICE: "167" },
  { id: 32, SKU: "16006", PACK: "CTN", SIZE: "50#", BRAND: "CARAVA", ITEM: "8 GRAIN BREAD MIX S/O", CATEGORY: "Cat 20 Caravan", PRICE: "72" },
  { id: 33, SKU: "12305", PACK: "CTN", SIZE: "50#", BRAND: "CARAVA", ITEM: "CRACK'N GOOD WHEAT BASE ", CATEGORY: "Cat 20 Caravan", PRICE: "148" },
  { id: 34, SKU: "10039", PACK: "CTN", SIZE: "50#", BRAND: "CARAVA", ITEM: "PRISTINE CRACK N GOOD WHEAT BREAD BASE S/O", CATEGORY: "Cat 20 Caravan", PRICE: "86" },
  { id: 35, SKU: "15032", PACK: "CSE", SIZE: "50#", BRAND: "CARAVA", ITEM: "EURO GRAIN BASE HALF N HALF ", CATEGORY: "Cat 20 Caravan", PRICE: "108" },
  { id: 36, SKU: "1537", PACK: "BOX", SIZE: "50#", BRAND: "CARAVA", ITEM: "HONEY WHEAT GRAIN BASE HALF & HALF ", CATEGORY: "Cat 20 Caravan", PRICE: "43" },
  { id: 37, SKU: "15028", PACK: "CSE", SIZE: "38#", BRAND: "CARAVA", ITEM: "HEARTLAND CRACKED WHEAT S/O", CATEGORY: "Cat 20 Caravan", PRICE: "114" },
  { id: 38, SKU: "31676", PACK: "BAG", SIZE: "24#", BRAND: "WESTCO", ITEM: "PIZZA CRUST MIX S/O ", CATEGORY: "Cat 4 Mixes Bread Tortilla", PRICE: "144" },
  { id: 39, SKU: "31768", PACK: "BAG", SIZE: "24#", BRAND: "CONCOR", ITEM: "PIZZA MIX S/O", CATEGORY: "Cat 4 Mixes Bread Tortilla", PRICE: "282" },
  { id: 40, SKU: "40009", PACK: "BAG", SIZE: "50#", BRAND: "WESTCO", ITEM: "ARTISAN BASE", CATEGORY: "Cat 4 Mixes Bread Tortilla", PRICE: "213" },
  { id: 41, SKU: "66074", PACK: "CTN", SIZE: "50#", BRAND: "CARAVN", ITEM: "HALF & HALF ARTISAN BREAD BASE S/O", CATEGORY: "Cat 20 Caravan", PRICE: "271" },
  { id: 42, SKU: "39994", PACK: "BAG", SIZE: "50#", BRAND: "WESTCO", ITEM: "SUNDRIED TOMATO BASE 50% S/O", CATEGORY: "Cat 4 Mixes Bread Tortilla", PRICE: "293" },
  { id: 43, SKU: "15555", PACK: "CTN", SIZE: "50#", BRAND: "CARAVA", ITEM: "CALIFORNIA SUNDRIED TOMATO BASE S/O ", CATEGORY: "Cat 20 Caravan", PRICE: "24" },
  { id: 44, SKU: "58425", PACK: "CTN", SIZE: "25#", BRAND: "CARAVA", ITEM: "TOMATO MEISTER S/O ", CATEGORY: "Cat 20 Caravan", PRICE: "214" },
  { id: 45, SKU: "31632", PACK: "BAG", SIZE: "50#", BRAND: "TRIGAL", ITEM: "BOLILLO MIX", CATEGORY: "Cat 4 Mixes Bread Tortilla", PRICE: "177" },
  { id: 46, SKU: "40027", PACK: "BOX", SIZE: "50#", BRAND: "WESTCO", ITEM: "PLUS GREAT CRUSTY BASE", CATEGORY: "Cat 4 Mixes Bread Tortilla", PRICE: "173" },
  { id: 47, SKU: "15055", PACK: "CSE", SIZE: "50#", BRAND: "CARAVA", ITEM: "DANUBE VII TFF NB", CATEGORY: "Cat 20 Caravan", PRICE: "197" },
  { id: 48, SKU: "16353", PACK: "CTN", SIZE: "50#", BRAND: "CARAVA", ITEM: "ITALIAN SLIPPER BREAD BASE", CATEGORY: "Cat 20 Caravan", PRICE: "233" },
  { id: 49, SKU: "20608", PACK: "CSE", SIZE: "50#", BRAND: "CARAVA", ITEM: "PANE LUCIANE BASE S/O ", CATEGORY: "Cat 20 Caravan", PRICE: "283" },
  { id: 50, SKU: "31811", PACK: "BAG", SIZE: "50#", BRAND: "DNCN HNZ", ITEM: "PROFESSIONAL WHITE CAKE MIX", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "76" },
  { id: 51, SKU: "9902", PACK: "BAG", SIZE: "50#", BRAND: "WESTCO", ITEM: "WHITE/GOLD VELVET CAKE MIX", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "71" },
  { id: 52, SKU: "9903", PACK: "BAG", SIZE: "50#", BRAND: "WESTCO", ITEM: "123 WHITE/YELLOW CAKE MIX", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "260" },
  { id: 53, SKU: "9912", PACK: "BAG", SIZE: "50#", BRAND: "WESTCO", ITEM: "EXTRA MOIST WHITE CAKE", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "289" },
  { id: 54, SKU: "39912", PACK: "BAG", SIZE: "50#", BRAND: "WESTCO", ITEM: "EXTRA RICH WHITE CAKE", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "73" },
  { id: 55, SKU: "9928", PACK: "BAG", SIZE: "50#", BRAND: "WESTCO", ITEM: "STERLING CLASSIC WHITE CAKE S/O", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "65" },
  { id: 56, SKU: "13010", PACK: "BAG", SIZE: "50#", BRAND: "WESTCO", ITEM: "HIGH ALTITUDE COMPLETE WHITE CAKE S/O", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "276" },
  { id: 57, SKU: "31751", PACK: "BAG", SIZE: "50#", BRAND: "WESTCO", ITEM: "MILE HIGH WHITE CAKE S/O ", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "94" },
  { id: 58, SKU: "31812", PACK: "BAG", SIZE: "50#", BRAND: "DNCN HNZ", ITEM: "PROFESSIONAL YELLLOW CAKE MIX", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "137" },
  { id: 59, SKU: "9903", PACK: "BAG", SIZE: "50#", BRAND: "WESTCO", ITEM: "123 WHITE/YELLOW CAKE MIX", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "229" },
  { id: 60, SKU: "9916", PACK: "BAG", SIZE: "50#", BRAND: "WESTCO", ITEM: "EXTRA MOIST FRENCH VANILLA CAKE MIX", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "35" },
  { id: 61, SKU: "39908", PACK: "BAG", SIZE: "50#", BRAND: "WESTCO", ITEM: "EXTRA RICH YELLOW CAKE MIX", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "174" },
  { id: 62, SKU: "31810", PACK: "BAG", SIZE: "50#", BRAND: "DNCN HNZ", ITEM: "PROFESSIONAL DEVILS FOOD CAKE", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "263" },
  { id: 63, SKU: "9905", PACK: "BAG", SIZE: "50#", BRAND: "WESTCO", ITEM: "DARK VELVET CHOC CAKE MIX", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "64" },
  { id: 64, SKU: "9906", PACK: "BAG", SIZE: "50#", BRAND: "WESTCO", ITEM: "123 CHOC DEVILS FOOD CAKE ", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "294" },
  { id: 65, SKU: "9914", PACK: "BAG", SIZE: "50#", BRAND: "WESTCO", ITEM: "EXTRA MOIST DEVILS FOOD CAKE MIX", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "152" },
  { id: 66, SKU: "9933", PACK: "BAG", SIZE: "30#", BRAND: "WESTCO", ITEM: "ROYAL DUTCH CAKE BASE", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "25" },
  { id: 67, SKU: "39914", PACK: "BAG", SIZE: "50#", BRAND: "WESTCO", ITEM: "FAT FREE MUFFIN MIX", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "12" },
  { id: 68, SKU: "12800", PACK: "BAG", SIZE: "50#", BRAND: "WESTCO", ITEM: "COMPLETE CHOC CAKE MX S/O ", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "147" },
  { id: 69, SKU: "9918", PACK: "BAG", SIZE: "50#", BRAND: "WESTCO", ITEM: "SUNSHINE SPONGE CAKE MIX  ", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "148" },
  { id: 70, SKU: "31104", PACK: "BAG", SIZE: "50#", BRAND: "TRIGAL", ITEM: "TRES LECHES CAKE CHOCOLATE ", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "299" },
  { id: 71, SKU: "34943", PACK: "BAG", SIZE: "50#", BRAND: "TRIGAL", ITEM: "TRES LECHES CAKE MIX", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "287" },
  { id: 72, SKU: "9923", PACK: "BAG", SIZE: "25#", BRAND: "WESTCO", ITEM: "ANGEL FOOD CAKE \"MAGIC\" ", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "148" },
  { id: 73, SKU: "39926", PACK: "BAG", SIZE: "50#", BRAND: "WESTCO", ITEM: "14K TEA CAKE", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "58" },
  { id: 74, SKU: "31712", PACK: "BAG", SIZE: "50#", BRAND: "WESTCO", ITEM: "RED VELVET CAKE MIX", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "50" },
  { id: 75, SKU: "31598", PACK: "BAG", SIZE: "30#", BRAND: "WESTCO", ITEM: "COMPLETE CARROT CAKE W/O NUTS", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "31" },
  { id: 76, SKU: "11962", PACK: "BAG", SIZE: "30#", BRAND: "WESTCO", ITEM: "INSTANT CHEESECAKE MIX", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "198" },
  { id: 77, SKU: "15017", PACK: "BOX", SIZE: "50#", BRAND: "CARAVA", ITEM: "YOGURT CHOC CAKE BASE", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "267" },
  { id: 78, SKU: "58374", PACK: "CTN", SIZE: "50#", BRAND: "CARAVA", ITEM: "YOGURT CAKE BASE ", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "92" },
  { id: 79, SKU: "1641", PACK: "BAG", SIZE: "50#", BRAND: "CARAVA", ITEM: "SPICE COOKIE & CAKE MIX", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "20" },
  { id: 80, SKU: "9910", PACK: "BAG", SIZE: "30#", BRAND: "WESTCO", ITEM: "PUD'N-CREME CAKE MIX", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "13" },
  { id: 81, SKU: "10087", PACK: "BAG", SIZE: "50#", BRAND: "WESTCO", ITEM: "CREME CAKE MIX", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "59" },
  { id: 82, SKU: "30249", PACK: "BAG", SIZE: "50#", BRAND: "WESTCO", ITEM: "ULTRA RICH VANILLA CRéME CAKE MIX", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "299" },
  { id: 83, SKU: "31574", PACK: "BAG", SIZE: "30#", BRAND: "WESTCO", ITEM: "CLASSIC CREME CAKE MIX", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "180" },
  { id: 84, SKU: "31591", PACK: "BAG", SIZE: "50#", BRAND: "WESTCO", ITEM: "CLASSIC CREME CAKE MIX", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "249" },
  { id: 85, SKU: "11644", PACK: "BAG", SIZE: "50#", BRAND: "WESTCO", ITEM: "ULTRARICH CREME CAKE MIX", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "280" },
  { id: 86, SKU: "30843", PACK: "BAG", SIZE: "50#", BRAND: "WESTCO", ITEM: "ALL NATURAL CREME CAKE MX", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "240" },
  { id: 87, SKU: "20808", PACK: "BAG", SIZE: "50#", BRAND: "WESTCO", ITEM: "GREEK YOGURT CRéME CAKE MIX", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "216" },
  { id: 88, SKU: "11615", PACK: "BAG", SIZE: "25#", BRAND: "WESTCO", ITEM: "NO SUGAR ADDED CREME CAKE", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "12" },
  { id: 89, SKU: "9931", PACK: "BAG", SIZE: "30#", BRAND: "WESTCO", ITEM: "EXTRA MOIST MUFFIN MIX", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "196" },
  { id: 90, SKU: "10080", PACK: "BAG", SIZE: "30#", BRAND: "WESTCO", ITEM: "ADD WATER ONLY MUFFIN", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "208" },
  { id: 91, SKU: "10082", PACK: "BAG", SIZE: "30#", BRAND: "WESTCO", ITEM: "DELIGHTFUL MUFFIN MIX-LOW/FAT", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "132" },
  { id: 92, SKU: "10042", PACK: "BAG", SIZE: "30#", BRAND: "WESTCO", ITEM: "FAT FREE MUFFIN MIX", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "109" },
  { id: 93, SKU: "46479", PACK: "BAG", SIZE: "50#", BRAND: "WESTCO", ITEM: "D-LUX CREME CAKE", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "174" },
  { id: 94, SKU: "10046", PACK: "BAG", SIZE: "50#", BRAND: "WESTCO", ITEM: "QUICK KREME CAKE MIX", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "167" },
  { id: 95, SKU: "31469", PACK: "BAG", SIZE: "50#", BRAND: "WESTCO", ITEM: "HIGH ALTITUDE BASIC CREME CAKE S/O ", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "85" },
  { id: 96, SKU: "9921", PACK: "BAG", SIZE: "50#", BRAND: "WESTCO", ITEM: "VARIETY LOAF CAKE MIX S/O ", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "111" },
  { id: 97, SKU: "46829", PACK: "BAG", SIZE: "30#", BRAND: "WESTCO", ITEM: "STERLING PUDDING CAKE MIX S/O ", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "112" },
  { id: 98, SKU: "17820", PACK: "CSE", SIZE: "25#", BRAND: "KRUSTE", ITEM: "BASIC MUFFIN MIX ADD WATER ONLY", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "121" },
  { id: 99, SKU: "9961", PACK: "BAG", SIZE: "30#", BRAND: "WESTCO", ITEM: "CHOC PUD'N CREAM CAKE MIX", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "274" },
  { id: 100, SKU: "10074", PACK: "BAG", SIZE: "30#", BRAND: "WESTCO", ITEM: "IMPERIAL CHOC MUFFIN MIX", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "130" },
  { id: 101, SKU: "11608", PACK: "BAG", SIZE: "30#", BRAND: "WESTCO", ITEM: "CHOCOLATE CREAM CAKE MIX", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "139" },
  { id: 102, SKU: "31606", PACK: "BAG", SIZE: "30#", BRAND: "WESTCO", ITEM: "CLASSIC CHOC CREME CAKE", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "255" },
  { id: 103, SKU: "11616", PACK: "BAG", SIZE: "25#", BRAND: "WESTCO", ITEM: "NO SUGAR ADDED CHOCOLATE CREME CAKE", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "17" },
  { id: 104, SKU: "9950", PACK: "BAG", SIZE: "40#", BRAND: "WESTCO", ITEM: "BRAN MUFFIN MIX", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "164" },
  { id: 105, SKU: "9952", PACK: "BAG", SIZE: "30#", BRAND: "WESTCO", ITEM: "4-BRAN MUFFIN", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "279" },
  { id: 106, SKU: "9962", PACK: "BAG", SIZE: "50#", BRAND: "WESTCO", ITEM: "OAT BRAN MUFFIN MIX", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "295" },
  { id: 107, SKU: "48268", PACK: "BAG", SIZE: "30#", BRAND: "WESTCO", ITEM: "GOURMET HONEY BRAN MUFFIN", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "100" },
  { id: 108, SKU: "9946", PACK: "BAG", SIZE: "30#", BRAND: "WESTCO", ITEM: "HARVEST BRAN MUFFIN ", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "252" },
  { id: 109, SKU: "31816", PACK: "BAG", SIZE: "30#", BRAND: "WESTCO", ITEM: "CORN MUFFIN MIX", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "259" },
  { id: 110, SKU: "9949", PACK: "BAG", SIZE: "30#", BRAND: "WESTCO", ITEM: "CORN BREAD & MUFFIN MIX", CATEGORY: "Cat 3 Mixes, Muffin, Cake", PRICE: "11" },
  { id: 111, SKU: "48235", PACK: "BAG", SIZE: "50#", BRAND: "WESTCO", ITEM: "EXTRA MOIST BROWNIE MIX", CATEGORY: "Cat 5 Mix Brownie", PRICE: "291" },
  { id: 112, SKU: "48240", PACK: "BAG", SIZE: "50#", BRAND: "WESTCO", ITEM: "GOURMET BROWNIE MIX", CATEGORY: "Cat 5 Mix Brownie", PRICE: "250" },
  { id: 113, SKU: "31584", PACK: "BAG", SIZE: "50#", BRAND: "WESTCO", ITEM: "ALL NATURAL BROWNIE MIX", CATEGORY: "Cat 5 Mix Brownie", PRICE: "106" },
  { id: 114, SKU: "31473", PACK: "BAG", SIZE: "50#", BRAND: "WESTCO", ITEM: "E'ZE SPREAD BROWNIE NTF S/O", CATEGORY: "Cat 5 Mix Brownie", PRICE: "144" },
  { id: 115, SKU: "30118", PACK: "BAG", SIZE: "50#", BRAND: "WESTCO", ITEM: "ELITE BROWNIE MIX", CATEGORY: "Cat 5 Mix Brownie", PRICE: "275" },
  { id: 116, SKU: "90134", PACK: "EA", SIZE: "3KG", BRAND: "CACAOB", ITEM: "COCOA BUTTER DEODERIZED", CATEGORY: "Cat 48 Cocoa-Cocoa Butter", PRICE: "197" },
  { id: 117, SKU: "10133", PACK: "CSE", SIZE: "4/3KG", BRAND: "CACAOB", ITEM: "COCOA BUTTER DEODERIZED", CATEGORY: "Cat 48 Cocoa-Cocoa Butter", PRICE: "136" },
  { id: 118, SKU: "74731", PACK: "CSE", SIZE: "30#", BRAND: "CESTVI", ITEM: "DARK CHOCOLATE  COUVERTURE WAFER 54.5%", CATEGORY: "Cat 49 Branded Chocolate", PRICE: "234" },
  { id: 119, SKU: "76253", PACK: "CSE", SIZE: "30#", BRAND: "BARRYC", ITEM: "VAN LEER KENOSHA MILK CHOCOLATE WAFER 33%", CATEGORY: "Cat 50 Chocolate", PRICE: "28" },
  { id: 120, SKU: "74732", PACK: "CSE", SIZE: "30#", BRAND: "CESTVI", ITEM: "MILK CHOCOLATE COUVERTURE 32.6%", CATEGORY: "Cat 49 Branded Chocolate", PRICE: "129" },
  { id: 121, SKU: "90286", PACK: "CSE", SIZE: "30#", BRAND: "BARRYC", ITEM: "VAN LEER ULTIMATE WHITE COUVERTURE WAFER 31%", CATEGORY: "Cat 50 Chocolate", PRICE: "286" },
  { id: 122, SKU: "74733", PACK: "CES", SIZE: "30#", BRAND: "CESTVI", ITEM: "WHITE CHOCOLATE COUVERTURE 30.5%", CATEGORY: "Cat 49 Branded Chocolate", PRICE: "300" },
  { id: 123, SKU: "7509", PACK: "CSE", SIZE: "5/10#", BRAND: "CALBUT", ITEM: "VAN STEVER SEMI SWEET CHOCOLATE 52%", CATEGORY: "Cat 50 Chocolate", PRICE: "193" },
  { id: 124, SKU: "74737", PACK: "CSE", SIZE: "5/11#", BRAND: "CALBUT", ITEM: "811 DARK COUVERTURE BLOCK 54%", CATEGORY: "Cat 50 Chocolate", PRICE: "248" },
  { id: 125, SKU: "74762", PACK: "BAG", SIZE: "1/11#", BRAND: "CALBUT", ITEM: "811 DARK COUVERTURE CALLETS 54%", CATEGORY: "Cat 50 Chocolate", PRICE: "234" },
  { id: 126, SKU: "74763", PACK: "BAG", SIZE: "1/5.5#", BRAND: "CALBUT", ITEM: "811 DARK COUVERTURE CALLETS 54%", CATEGORY: "Cat 50 Chocolate", PRICE: "96" },
  { id: 127, SKU: "74738", PACK: "CSE", SIZE: "8/5.5#", BRAND: "CALBUT", ITEM: "811 DARK COUVERTURE CALLETS 54%", CATEGORY: "Cat 50 Chocolate", PRICE: "137" },
  { id: 128, SKU: "74760", PACK: "BOX", SIZE: "2/22#", BRAND: "CALBUT", ITEM: "811 DARK COUVERTURE CALLETS 54%", CATEGORY: "Cat 50 Chocolate", PRICE: "172" },
  { id: 129, SKU: "74768", PACK: "BAG", SIZE: "1/22#", BRAND: "CALBUT", ITEM: "811 DARK COUVERTURE CALLETS 54%", CATEGORY: "Cat 50 Chocolate", PRICE: "272" },
  { id: 130, SKU: "74739", PACK: "CSE", SIZE: "5/11#", BRAND: "CALBUT", ITEM: "823 MILK COUVERTURE BLOCK 33.6%", CATEGORY: "Cat 50 Chocolate", PRICE: "201" },
  { id: 131, SKU: "74764", PACK: "BAG", SIZE: "1/11#", BRAND: "CALBUT", ITEM: "823 MILK COUVERTURE BLOCK 33.6%", CATEGORY: "Cat 50 Chocolate", PRICE: "105" },
  { id: 132, SKU: "74765", PACK: "BAG", SIZE: "1/5.5#", BRAND: "CALBUT", ITEM: "823 MILK COUVERTURE CALLETS 33.6%", CATEGORY: "Cat 50 Chocolate", PRICE: "167" },
  { id: 133, SKU: "74740", PACK: "CSE", SIZE: "8/5.5#", BRAND: "CALBUT", ITEM: "823 MILK COUVERTURE CALLETS 33.6%", CATEGORY: "Cat 50 Chocolate", PRICE: "76" },
  { id: 134, SKU: "74741", PACK: "CSE", SIZE: "8/5.5#", BRAND: "CALBUT", ITEM: "W2 WHITE COUVERTURE CALLETS 28%", CATEGORY: "Cat 50 Chocolate", PRICE: "135" },
  { id: 135, SKU: "74766", PACK: "BAG", SIZE: "1/5.5#", BRAND: "CALBUT", ITEM: "W2 WHITE COUVERTURE CALLETS 28%", CATEGORY: "Cat 50 Chocolate", PRICE: "284" },
  { id: 136, SKU: "74759", PACK: "BOX", SIZE: "5/11#", BRAND: "CALBUT", ITEM: "W2 WHITE COUVERTURE BLOCK 28%", CATEGORY: "Cat 50 Chocolate", PRICE: "10" },
  { id: 137, SKU: "74767", PACK: "BAG", SIZE: "1/11#", BRAND: "CALBUT", ITEM: "W2 WHITE COUVERTURE BLOCK 28%", CATEGORY: "Cat 50 Chocolate", PRICE: "122" },
  { id: 138, SKU: "15150", PACK: "CSE", SIZE: "30#", BRAND: "BARRYC", ITEM: "VAN LEER MILK CHOC WAFER 31%", CATEGORY: "Cat 50 Chocolate", PRICE: "224" },
  { id: 139, SKU: "26755", PACK: "CSE", SIZE: "30#", BRAND: "BARRYC", ITEM: "VAN LEER CHOC SEMI SWEET WAFER 58%", CATEGORY: "Cat 50 Chocolate", PRICE: "73" },
  { id: 140, SKU: "8709", PACK: "CSE", SIZE: "5/10#", BRAND: "GUITTA", ITEM: "LUSTROUS CHOCOLATE COUVERTURE BLOCK ", CATEGORY: "Cat 50 Chocolate", PRICE: "179" },
  { id: 141, SKU: "10742", PACK: "CSE", SIZE: "25#", BRAND: "GUITTA", ITEM: "CHOCOLATE 'ETOILE DU PREMIRER 58% S/O", CATEGORY: "Cat 50 Chocolate", PRICE: "253" },
  { id: 142, SKU: "10753", PACK: "CSE", SIZE: "25#", BRAND: "GUITTA", ITEM: "CHOCOLATE WAFER CRéME FRANCAISE 31% S/O", CATEGORY: "Cat 50 Chocolate", PRICE: "277" },
  { id: 143, SKU: "74744", PACK: "CSE", SIZE: "4/11#", BRAND: "CACA0B", ITEM: "DARK EXTRA BITTER GUAYAQUIL PISTOLES 64%", CATEGORY: "Cat 50 Chocolate", PRICE: "294" },
  { id: 144, SKU: "74774", PACK: "BAG", SIZE: "1/11#", BRAND: "CACA0B", ITEM: "DARK EXTRA BITTER GUAYAQUIL PISTOLES 64%", CATEGORY: "Cat 50 Chocolate", PRICE: "144" },
  { id: 145, SKU: "8673", PACK: "BAR", SIZE: "10#", BRAND: "GUITTA", ITEM: "FRENCH VANILLA UPRIGHT 54%", CATEGORY: "Cat 50 Chocolate", PRICE: "274" },
  { id: 146, SKU: "8730", PACK: "BAG", SIZE: "50#", BRAND: "GUITTA", ITEM: "BITTERSWEET CHOCOLATE 54%", CATEGORY: "Cat 50 Chocolate", PRICE: "225" },
  { id: 147, SKU: "8681", PACK: "CTN", SIZE: "50#", BRAND: "GUITTA", ITEM: "DARKOTE  CHOCOLATE CHUNKS 51%", CATEGORY: "Cat 50 Chocolate", PRICE: "295" },
  { id: 148, SKU: "8680", PACK: "CTN", SIZE: "50#", BRAND: "GUITTA", ITEM: "WHITE SATIN RIBBON 31%", CATEGORY: "Cat 50 Chocolate", PRICE: "252" },
  { id: 149, SKU: "8696", PACK: "CTN", SIZE: "25#", BRAND: "GUITTA", ITEM: "CHOCOLATE LIQUOR WAFER 100%", CATEGORY: "Cat 50 Chocolate", PRICE: "179" },
  { id: 150, SKU: "8661", PACK: "BAR", SIZE: "11#", BRAND: "ASM", ITEM: "WHITE COATING", CATEGORY: "Cat 50 Chocolate", PRICE: "258" },
  { id: 151, SKU: "8662", PACK: "CSE", SIZE: "6/11#", BRAND: "ASM", ITEM: "WHITE COATING", CATEGORY: "Cat 50 Chocolate", PRICE: "141" },
  { id: 152, SKU: "8663", PACK: "BAR", SIZE: "11#", BRAND: "ASM", ITEM: "DARK COATING", CATEGORY: "Cat 50 Chocolate", PRICE: "216" },
  { id: 153, SKU: "8666", PACK: "CSE", SIZE: "6/11#", BRAND: "ASM", ITEM: "DARK COATING", CATEGORY: "Cat 50 Chocolate", PRICE: "207" },
  { id: 154, SKU: "8669", PACK: "BAR", SIZE: "11#", BRAND: "ASM", ITEM: "LIGHT MILK CHOC. COATING", CATEGORY: "Cat 50 Chocolate", PRICE: "140" },
  { id: 155, SKU: "8672", PACK: "CSE", SIZE: "6/11#", BRAND: "ASM", ITEM: "LIGHT MILK CHOC. COATING", CATEGORY: "Cat 50 Chocolate", PRICE: "51" },
  { id: 156, SKU: "74720", PACK: "CSE", SIZE: "3/11#", BRAND: "CESTVI", ITEM: "CHOCOLATE DARK COATING BLOCK 3/11#", CATEGORY: "Cat 50 Chocolate", PRICE: "99" },
  { id: 157, SKU: "74724", PACK: "BAR", SIZE: "1/11#", BRAND: "CESTVI", ITEM: "CHOCOLATE DARK COATING BLOCK 1/11#", CATEGORY: "Cat 50 Chocolate", PRICE: "239" },
  { id: 158, SKU: "74723", PACK: "CSE", SIZE: "3/11#", BRAND: "CESTVI", ITEM: "CHOCOLATE WHITE COATING BLOCK 3/11#", CATEGORY: "Cat 50 Chocolate", PRICE: "87" },
  { id: 159, SKU: "74726", PACK: "BAR", SIZE: "1/11#", BRAND: "CESTVI", ITEM: "CHOCOLATE WHITE COATING BLOCK 1/11#", CATEGORY: "Cat 50 Chocolate", PRICE: "66" },
  { id: 160, SKU: "74725", PACK: "BAR", SIZE: "1/11#", BRAND: "CALBUT", ITEM: "CHOCOLATE MILK COATING BLOCK 1/11#", CATEGORY: "Cat 50 Chocolate", PRICE: "183" },
  { id: 161, SKU: "7506", PACK: "CSE", SIZE: "30#", BRAND: "BARRYC", ITEM: "BARRY CALLEBAUT MILK CHOC SNAPS COATING", CATEGORY: "Cat 50 Chocolate", PRICE: "265" },
  { id: 162, SKU: "7507", PACK: "CSE", SIZE: "30#", BRAND: "BARRYC", ITEM: "BARRY CALLEBAUT DARK CHOC SNAPS COATING", CATEGORY: "Cat 50 Chocolate", PRICE: "133" },
  { id: 163, SKU: "7505", PACK: "CSE", SIZE: "30#", BRAND: "BARRYC", ITEM: "BARRY CALLEBAUT WHITE CHOC SNAPS COATING", CATEGORY: "Cat 50 Chocolate", PRICE: "15" },
  { id: 164, SKU: "96754", PACK: "BOX", SIZE: "1/266 CT", BRAND: "BARRYC", ITEM: "CHOCOLATE BAKING BATONS", CATEGORY: "Cat 50 Chocolate", PRICE: "33" },
  { id: 165, SKU: "26754", PACK: "CSE", SIZE: "15/300 CT", BRAND: "BARRYC", ITEM: "CHOCOLATE BAKING BATONS", CATEGORY: "Cat 50 Chocolate", PRICE: "184" },
  { id: 166, SKU: "7500", PACK: "CTN", SIZE: "25#", BRAND: "GUITTA", ITEM: "DARK CHOCOLATE  APEELS COATING", CATEGORY: "Cat 50 Chocolate", PRICE: "142" },
  { id: 167, SKU: "8737", PACK: "CSE", SIZE: "25#", BRAND: "GUITTA", ITEM: "VANILLA APEELS COATING", CATEGORY: "Cat 50 Chocolate", PRICE: "179" },
  { id: 168, SKU: "8692", PACK: "BAR", SIZE: "10#", BRAND: "GUITTA", ITEM: "PATISSERIE COATING UPRIGHT ", CATEGORY: "Cat 50 Chocolate", PRICE: "174" },
  { id: 169, SKU: "8732", PACK: "BAR", SIZE: "10#", BRAND: "GUITTA", ITEM: "WHITE UPRIGHT PASTEL COAT", CATEGORY: "Cat 50 Chocolate", PRICE: "24" },
  { id: 170, SKU: "8683", PACK: "CTN", SIZE: "25#", BRAND: "GUITTA", ITEM: "MILK CHOCOLATE APEELS COATING", CATEGORY: "Cat 50 Chocolate", PRICE: "260" },
  { id: 171, SKU: "74704", PACK: "CSE", SIZE: "30#", BRAND: "CESTVI", ITEM: "CHOC. WHITE CHUNKS 600 CT", CATEGORY: "Cat 49 Branded Chocolate", PRICE: "222" },
  { id: 172, SKU: "74705", PACK: "CSE", SIZE: "30#", BRAND: "CESTVI", ITEM: "CHOC CHUNKS SEMI SWEET 600CT", CATEGORY: "Cat 49 Branded Chocolate", PRICE: "80" },
  { id: 173, SKU: "7544", PACK: "CSE", SIZE: "30#", BRAND: "CESTVI", ITEM: "WHITE CHUNKS 300CT S/O ", CATEGORY: "Cat 49 Branded Chocolate", PRICE: "34" },
  { id: 174, SKU: "74719", PACK: "CSE", SIZE: "30#", BRAND: "CESTVI", ITEM: "WHITE CHOC CHIPS 1000 CT", CATEGORY: "Cat 49 Branded Chocolate", PRICE: "89" },
  { id: 175, SKU: "74706", PACK: "CSE", SIZE: "30#", BRAND: "CESTVI", ITEM: "CHOC CHIP SEMI SWT 1M CT", CATEGORY: "Cat 49 Branded Chocolate", PRICE: "119" },
  { id: 176, SKU: "74707", PACK: "CSE", SIZE: "30#", BRAND: "CESTVI", ITEM: "CHOC CHIP SEMI SWT 4M CT", CATEGORY: "Cat 49 Branded Chocolate", PRICE: "217" },
  { id: 177, SKU: "7517", PACK: "CSE", SIZE: "30#", BRAND: "BARRYC", ITEM: "WHITE CHOC CHIPS 4000 CT", CATEGORY: "Cat 50 Chocolate", PRICE: "74" },
  { id: 178, SKU: "7530", PACK: "CSE", SIZE: "30#", BRAND: "BARRYC", ITEM: "CHOC CHIPS 4000 CT S/S ", CATEGORY: "Cat 50 Chocolate", PRICE: "205" },
  { id: 179, SKU: "22122", PACK: "CSE", SIZE: "30#", BRAND: "BARRYC", ITEM: "CHOC CHIP S/S 10M", CATEGORY: "Cat 50 Chocolate", PRICE: "112" },
  { id: 180, SKU: "7513", PACK: "CSE", SIZE: "30#", BRAND: "BARRYC", ITEM: "SEMI SWEET CHOC 1000 CT", CATEGORY: "Cat 50 Chocolate", PRICE: "101" },
  { id: 181, SKU: "7511", PACK: "CSE", SIZE: "50#", BRAND: "BARRYC", ITEM: "SEMI SWEET CHOC CHIPS 1000 CT", CATEGORY: "Cat 50 Chocolate", PRICE: "151" },
  { id: 182, SKU: "7512", PACK: "CSE", SIZE: "30#", BRAND: "BARRYC", ITEM: "SEMI SWEET CHOC 2000 CT", CATEGORY: "Cat 50 Chocolate", PRICE: "215" },
  { id: 183, SKU: "7576", PACK: "CTN", SIZE: "50#", BRAND: "BARRYC", ITEM: "COMPOUND FLAVORED CHIP 4M", CATEGORY: "Cat 50 Chocolate", PRICE: "65" },
  { id: 184, SKU: "61181", PACK: "CSE", SIZE: "50#", BRAND: "AMBROS", ITEM: "CHOC LIQUOR PCS NATURAL  100% 1000CT", CATEGORY: "Cat 50 Chocolate", PRICE: "82" },
  { id: 185, SKU: "8694", PACK: "CSE", SIZE: "25#", BRAND: "GUITTA", ITEM: "WHITE COOKIE DROPS 900 CT", CATEGORY: "Cat 50 Chocolate", PRICE: "177" },
  { id: 186, SKU: "8691", PACK: "BOX", SIZE: "25#", BRAND: "GUITTA", ITEM: "WHITE COOKIE DROP 700 CT ", CATEGORY: "Cat 50 Chocolate", PRICE: "224" },
  { id: 187, SKU: "8693", PACK: "BOX", SIZE: "25#", BRAND: "GUITTA", ITEM: "COOKIE DROP 1000 CT ", CATEGORY: "Cat 50 Chocolate", PRICE: "205" },
  { id: 188, SKU: "8676", PACK: "CSE", SIZE: "50#", BRAND: "GUITTA", ITEM: "COOKIE DROPS 1000 CT  S/O ", CATEGORY: "Cat 50 Chocolate", PRICE: "115" },
  { id: 189, SKU: "8690", PACK: "CTN", SIZE: "25#", BRAND: "GUITTA", ITEM: "COOKIE DROP 2000 CT ", CATEGORY: "Cat 50 Chocolate", PRICE: "214" },
  { id: 190, SKU: "8695", PACK: "CSE", SIZE: "50#", BRAND: "GUITTA", ITEM: "COOKIE DROP 4000 CT ", CATEGORY: "Cat 50 Chocolate", PRICE: "157" },
  { id: 191, SKU: "8682", PACK: "CSE", SIZE: "25#", BRAND: "GUITTA", ITEM: "CHOC COOKIE DROP 4M SS ", CATEGORY: "Cat 50 Chocolate", PRICE: "204" },
  { id: 192, SKU: "8679", PACK: "CTN", SIZE: "25#", BRAND: "GUITTA", ITEM: "MILK CHOC CHIP 350 CT ", CATEGORY: "Cat 50 Chocolate", PRICE: "40" },
  { id: 193, SKU: "8725", PACK: "CSE", SIZE: "25#", BRAND: "NESTLE", ITEM: "WHITE MORSELS-900 CT", CATEGORY: "Cat 50 Chocolate", PRICE: "114" },
  { id: 194, SKU: "8718", PACK: "CSE", SIZE: "25#", BRAND: "NESTLE", ITEM: "SEMI-SWEET MORSELS 900CT", CATEGORY: "Cat 50 Chocolate", PRICE: "284" },
  { id: 195, SKU: "7518", PACK: "CSE", SIZE: "50#", BRAND: "BARRYC", ITEM: "COCOA DUTCH 22/24%", CATEGORY: "Cat 48 Cocoa-Cocoa Butter", PRICE: "34" },
  { id: 196, SKU: "21109", PACK: "BAG", SIZE: "50#", BRAND: "BARRYC", ITEM: "COCOA DUTCH RED/BLK 10/12", CATEGORY: "Cat 48 Cocoa-Cocoa Butter", PRICE: "260" },
  { id: 197, SKU: "8613", PACK: "BAG", SIZE: "50#", BRAND: "BARRYC", ITEM: "COCOA  NATURAL 10/12  S/O", CATEGORY: "Cat 48 Cocoa-Cocoa Butter", PRICE: "257" },
  { id: 198, SKU: "74746", PACK: "CSE", SIZE: "6/2.2#", BRAND: "CACAOB", ITEM: "COCOA EXTRA BRUTE, DUTCHED 22-24%", CATEGORY: "Cat 48 Cocoa-Cocoa Butter", PRICE: "22" }
];

// API Info endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Sales Coach API',
    version: '1.0.0',
    authentication: 'Required - Use POST /api/login to get access token',
    endpoints: {
      login: 'POST /api/login - Get access token (username, password)',
      items: 'GET /api/items - Get all items (requires auth)',
      itemBySku: 'GET /api/items/sku/:sku - Get item by SKU (requires auth)',
      itemById: 'GET /api/items/:id - Get item by ID (requires auth)',
      categories: 'GET /api/categories - Get all categories (requires auth)',
      itemsByCategory: 'GET /api/items/category/:category - Get items by category (requires auth)',
      search: 'GET /api/items/search?q=query - Search items (requires auth)',
      create: 'POST /api/items - Create new item (requires auth)',
      update: 'PUT /api/items/:id - Update item (requires auth)',
      delete: 'DELETE /api/items/:id - Delete item (requires auth)'
    }
  });
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: 'Username and password are required'
    });
  }

  // Validate credentials
  if (username !== ADMIN_USERNAME) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }

  const passwordMatch = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
  if (!passwordMatch) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }

  // Generate JWT token
  const token = jwt.sign(
    { username: username },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    success: true,
    message: 'Login successful',
    token: token,
    expiresIn: '24h'
  });
});

// GET all items
app.get('/api/items', authenticateToken, (req, res) => {
  res.json({
    success: true,
    count: items.length,
    data: items
  });
});

// GET all unique categories
app.get('/api/categories', authenticateToken, (req, res) => {
  const categories = [...new Set(items.map(item => item.CATEGORY))].sort();
  res.json({
    success: true,
    count: categories.length,
    data: categories
  });
});

// GET item by ID
app.get('/api/items/:id', authenticateToken, (req, res) => {
  const item = items.find(i => i.id === parseInt(req.params.id));
  if (item) {
    res.json({
      success: true,
      data: item
    });
  } else {
    res.status(404).json({
      success: false,
      error: 'Item not found'
    });
  }
});

// GET item by SKU
app.get('/api/items/sku/:sku', authenticateToken, (req, res) => {
  const item = items.find(i => i.SKU === req.params.sku);
  if (item) {
    res.json({
      success: true,
      data: item
    });
  } else {
    res.status(404).json({
      success: false,
      error: 'Item not found'
    });
  }
});

// GET items by category
app.get('/api/items/category/:category', authenticateToken, (req, res) => {
  const categoryItems = items.filter(i => 
    i.CATEGORY.toLowerCase() === decodeURIComponent(req.params.category).toLowerCase()
  );
  res.json({
    success: true,
    count: categoryItems.length,
    data: categoryItems
  });
});

// GET search items
app.get('/api/items/search', authenticateToken, (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({
      success: false,
      error: 'Query parameter "q" is required'
    });
  }

  const results = items.filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(query.toLowerCase())
    )
  );

  res.json({
    success: true,
    count: results.length,
    query: query,
    data: results
  });
});

// POST create new item
app.post('/api/items', authenticateToken, (req, res) => {
  const { SKU, PACK, SIZE, BRAND, ITEM, CATEGORY, PRICE } = req.body;

  // Validation
  if (!SKU || !ITEM || !CATEGORY || !PRICE) {
    return res.status(400).json({
      success: false,
      error: 'Required fields: SKU, ITEM, CATEGORY, PRICE'
    });
  }

  const newItem = {
    id: Math.max(...items.map(i => i.id), 0) + 1,
    SKU: SKU || '',
    PACK: PACK || '',
    SIZE: SIZE || '',
    BRAND: BRAND || '',
    ITEM: ITEM || '',
    CATEGORY: CATEGORY || '',
    PRICE: PRICE || ''
  };

  items.push(newItem);

  res.status(201).json({
    success: true,
    message: 'Item created successfully',
    data: newItem
  });
});

// PUT update item
app.put('/api/items/:id', authenticateToken, (req, res) => {
  const index = items.findIndex(i => i.id === parseInt(req.params.id));
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: 'Item not found'
    });
  }

  const { SKU, PACK, SIZE, BRAND, ITEM, CATEGORY, PRICE } = req.body;
  
  items[index] = {
    ...items[index],
    SKU: SKU !== undefined ? SKU : items[index].SKU,
    PACK: PACK !== undefined ? PACK : items[index].PACK,
    SIZE: SIZE !== undefined ? SIZE : items[index].SIZE,
    BRAND: BRAND !== undefined ? BRAND : items[index].BRAND,
    ITEM: ITEM !== undefined ? ITEM : items[index].ITEM,
    CATEGORY: CATEGORY !== undefined ? CATEGORY : items[index].CATEGORY,
    PRICE: PRICE !== undefined ? PRICE : items[index].PRICE
  };

  res.json({
    success: true,
    message: 'Item updated successfully',
    data: items[index]
  });
});

// DELETE item
app.delete('/api/items/:id', authenticateToken, (req, res) => {
  const index = items.findIndex(i => i.id === parseInt(req.params.id));
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: 'Item not found'
    });
  }

  const deletedItem = items.splice(index, 1)[0];

  res.json({
    success: true,
    message: 'Item deleted successfully',
    data: deletedItem
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Sales Coach API running on port ${PORT}`);
  console.log(`📊 Managing ${items.length} items`);
  console.log(`🌐 CORS enabled for all origins`);
  console.log(`\nAPI Endpoints:`);
  console.log(`  GET    http://localhost:${PORT}/api/items`);
  console.log(`  GET    http://localhost:${PORT}/api/categories`);
  console.log(`  GET    http://localhost:${PORT}/api/items/:id`);
  console.log(`  GET    http://localhost:${PORT}/api/items/sku/:sku`);
  console.log(`  GET    http://localhost:${PORT}/api/items/category/:category`);
  console.log(`  GET    http://localhost:${PORT}/api/items/search?q=query`);
  console.log(`  POST   http://localhost:${PORT}/api/items`);
  console.log(`  PUT    http://localhost:${PORT}/api/items/:id`);
  console.log(`  DELETE http://localhost:${PORT}/api/items/:id`);
});

module.exports = app;
