const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

const path = require('path');

// Load Env variables
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import Models for Seeding
const User = require('./models/User');
const Product = require('./models/Product');
const Flyer = require('./models/Flyer');
const Order = require('./models/Order');
const Message = require('./models/Message');
const Category = require('./models/Category');

const { MongoMemoryServer } = require('mongodb-memory-server');

// Connect to Database and Seed
let mongoServer;
const connectDB = async () => {
  try {
    let connStr = process.env.MONGO_URI;
    if (!connStr) {
      console.log('No MONGO_URI specified. Starting in-memory MongoDB server...');
      mongoServer = await MongoMemoryServer.create();
      connStr = mongoServer.getUri();
      console.log(`In-memory MongoDB started at: ${connStr}`);
    }
    await mongoose.connect(connStr);
    console.log('MongoDB Connected successfully.');

    // Seed Admin User
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      const admin = new User({
        name: 'HE Cafe Admin',
        email: 'admin@hecafe.com',
        password: 'admin123', // Will be hashed by User schema pre hook
        phone: '+94 70 408 4540',
        address: 'Colombo, Sri Lanka',
        role: 'admin'
      });
      await admin.save();
      console.log('Default Admin seeded: admin@hecafe.com / admin123');
    }

    // Seed Products
    const defaultProducts = [
      // Birthday Cakes
      { name: "Red Velvet Celebration Cake", image: "https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400", price: 4500, description: "A rich, moist red velvet cake layered with smooth cream cheese frosting. Perfect for celebrations.", category: "Birthday Cakes", stock: "Made to Order", status: "Active" },
      { name: "Chocolate Truffle Cake", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400", price: 3800, description: "Indulgent dark chocolate layers with silky ganache and chocolate truffle decoration.", category: "Birthday Cakes", stock: "Made to Order", status: "Active" },
      { name: "Vanilla Birthday Cake", image: "https://images.unsplash.com/photo-1535141192574-5d4897c13636?w=400", price: 3200, description: "Classic vanilla sponge with fluffy vanilla buttercream. Light, airy and perfect for any occasion.", category: "Birthday Cakes", stock: "Made to Order", status: "Active" },
      { name: "Premium Butterscotch Cake", image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400", price: 4100, description: "Moist sponge layered with rich butterscotch chips and caramel drizzle.", category: "Birthday Cakes", stock: "Made to Order", status: "Active" },

      // Wedding Cakes
      { name: "Strawberry Shortcake", image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400", price: 3600, description: "Fresh strawberries with whipped cream sponge. Light, fruity, and sweet.", category: "Wedding Cakes", stock: "Made to Order", status: "Active" },
      { name: "Royal Tiered Wedding Cake", image: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=400", price: 15000, description: "A magnificent 3-tiered cake featuring rich fondant lace detailing and vanilla cream fill.", category: "Wedding Cakes", stock: "Made to Order", status: "Active" },
      { name: "Classic White Lace Cake", image: "https://images.unsplash.com/photo-1522760859006-b9f30e51be1a?w=400", price: 9500, description: "Elegant buttercream frosting with delicate white sugar floral designs.", category: "Wedding Cakes", stock: "Made to Order", status: "Active" },
      { name: "Elegant Floral Sponge", image: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=400", price: 8200, description: "A gorgeous light sponge decorated with fresh edible flowers and vanilla glaze.", category: "Wedding Cakes", stock: "Made to Order", status: "Active" },

      // Cupcakes
      { name: "Assorted Cupcake Box (6)", image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400", price: 1800, description: "A delightful box of 6 assorted cupcakes — red velvet, chocolate, vanilla, and strawberry.", category: "Cupcakes", stock: "In Stock", status: "Active" },
      { name: "Red Velvet Swirl Cupcake", image: "https://images.unsplash.com/photo-1614707267537-b85acf00c4b8?w=400", price: 250, description: "Classic red velvet base topped with a swirl of cream cheese frosting.", category: "Cupcakes", stock: "In Stock", status: "Active" },
      { name: "Creamy Caramel Cupcake", image: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=400", price: 280, description: "Soft vanilla cupcake with a gooey caramel center and whipped caramel icing.", category: "Cupcakes", stock: "In Stock", status: "Active" },
      { name: "Double Chocolate Cupcake", image: "https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=400", price: 300, description: "Rich chocolate cake loaded with chocolate chips and finished with dark fudge frosting.", category: "Cupcakes", stock: "In Stock", status: "Active" },

      // Pastries
      { name: "Caramel Walnut Cake", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400", price: 4200, description: "Rich caramel layers with crunchy walnuts. Sweet and textured pastry masterpiece.", category: "Pastries", stock: "Made to Order", status: "Active" },
      { name: "French Butter Croissant", image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400", price: 350, description: "Flaky, buttery, golden French pastry baked fresh daily.", category: "Pastries", stock: "In Stock", status: "Active" },
      { name: "Chocolate Éclair", image: "https://images.unsplash.com/photo-1600431521340-491eca880813?w=400", price: 400, description: "Choux pastry filled with rich pastry cream and glazed with dark Belgian chocolate.", category: "Pastries", stock: "In Stock", status: "Active" },
      { name: "Blueberry Danish", image: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400", price: 450, description: "Laminated puff pastry filled with sweet cream cheese and fresh wild blueberries.", category: "Pastries", stock: "In Stock", status: "Active" },

      // Ingredients
      { name: "Premium Baking Flour 1kg", image: "https://images.unsplash.com/photo-1574085733277-851d9d856a3a?w=400", price: 450, description: "Premium quality all-purpose unbleached flour, ideal for cakes, breads, and biscuits.", category: "Ingredients", stock: "In Stock", status: "Active" },
      { name: "Organic Caster Sugar 1kg", image: "https://images.unsplash.com/photo-1581781868910-bf9260c6d376?w=400", price: 500, description: "Fine organic caster sugar, dissolves quickly and is perfect for light sponges and meringues.", category: "Ingredients", stock: "In Stock", status: "Active" },
      { name: "Pure Vanilla Extract 50ml", image: "https://images.unsplash.com/photo-1595475207225-428b62bda831?w=400", price: 1200, description: "100% pure vanilla extract made from choice Madagascar bourbon vanilla beans.", category: "Ingredients", stock: "In Stock", status: "Active" },
      { name: "Belgian Chocolate Chips 500g", image: "https://images.unsplash.com/photo-1548907040-4d42b52125b0?w=400", price: 1800, description: "Premium dark chocolate chips (54% cocoa) perfect for melting, baking, and decoration.", category: "Ingredients", stock: "In Stock", status: "Active" },

      // Baking Tools
      { name: "Professional Piping Bag Set", image: "https://images.unsplash.com/photo-1517433456452-f9633a875f6f?w=400", price: 1200, description: "Professional-grade piping bag set including 12 stainless steel nozzles and reusable bag.", category: "Baking Tools", stock: "In Stock", status: "Active" },
      { name: "Non-stick Cake Pan 8-inch", image: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=400", price: 1500, description: "Heavy-duty non-stick carbon steel cake pan with a removable loose base for easy release.", category: "Baking Tools", stock: "In Stock", status: "Active" },
      { name: "Silicone Spatula & Whisk Set", image: "https://images.unsplash.com/photo-1590794056226-79ef3a814c2c?w=400", price: 850, description: "Heat-resistant flexible silicone spatula paired with a sturdy stainless steel whisk.", category: "Baking Tools", stock: "In Stock", status: "Active" },
      { name: "Digital Kitchen Scale", image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400", price: 2200, description: "High-precision digital food scale with tare function, measuring units in grams and ounces.", category: "Baking Tools", stock: "In Stock", status: "Active" }
    ];

    for (const p of defaultProducts) {
      const exists = await Product.findOne({ name: p.name });
      if (!exists) {
        const newProduct = new Product(p);
        await newProduct.save();
      }
    }
    console.log('Default products seeded/verified.');

    // Seed Categories
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      const defaultCategories = [
        { name: "Birthday Cakes", image: "https://images.unsplash.com/photo-1535141192574-5d4897c13636?w=400" },
        { name: "Wedding Cakes", image: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=400" },
        { name: "Cupcakes", image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400" },
        { name: "Pastries", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400" },
        { name: "Ingredients", image: "https://images.unsplash.com/photo-1574085733277-851d9d856a3a?w=400" },
        { name: "Baking Tools", image: "https://images.unsplash.com/photo-1517433456452-f9633a875f6f?w=400" }
      ];
      await Category.insertMany(defaultCategories);
      console.log('Default categories seeded.');
    }

    // Seed Flyers
    const flyerCount = await Flyer.countDocuments();
    if (flyerCount === 0) {
      const defaultFlyers = [
        { title: "BIRTHDAY SPECIAL", subtitle: "20% OFF this weekend", emoji: "🎂", gradient: "linear-gradient(135deg,#D31F1B,#8B0000)", status: "Active", isBroadcast: true },
        { title: "WEDDING SEASON", subtitle: "Free consultation included", emoji: "💍", gradient: "linear-gradient(135deg,#1D1D1D,#444)", status: "Active", isBroadcast: false }
      ];
      await Flyer.insertMany(defaultFlyers);
      console.log('Default flyers seeded.');
    }

    // Seed Orders
    const orderCount = await Order.countDocuments();
    if (orderCount === 0) {
      const defaultOrders = [
        {
          orderId: "ORD-1042",
          customerName: "Priya Sharma",
          email: "priya@example.com",
          phone: "+94 77 123 4567",
          address: "No 45, Galle Road, Colombo 03",
          type: "Regular",
          items: [{ productId: "temp1", name: "Red Velvet Celebration Cake", emoji: "🎂", price: 5800, quantity: 1, size: "8 inch (serves 12-15)", flavour: "Red Velvet" }],
          subtotal: 5800,
          delivery: 0,
          tax: 290,
          total: 6090,
          status: "Processing"
        },
        {
          orderId: "ORD-1041",
          customerName: "Kasun Perera",
          email: "kasun@example.com",
          phone: "+94 76 987 6543",
          address: "No 12, Highlevel Road, Nugegoda",
          type: "Regular",
          items: [{ productId: "temp2", name: "Assorted Cupcake Box (6)", emoji: "🧁", price: 1800, quantity: 2, size: "Default", flavour: "Assorted" }],
          subtotal: 3600,
          delivery: 350,
          tax: 180,
          total: 4130,
          status: "Pending"
        },
        {
          orderId: "ORD-1040",
          customerName: "Nimal Fernando",
          email: "nimal@example.com",
          phone: "+94 70 456 7890",
          address: "No 88, Kandy Road, Kadawatha",
          type: "Custom",
          customDetails: { cakeType: "Wedding Cake", size: "Tiered / Custom", flavour: "Vanilla", frosting: "Fondant", message: "Congratulations!", deliveryDate: "2026-07-05", specialRequests: "Make it a 2-tier cake with silver ribbons." },
          items: [{ productId: "custom", name: "Custom Wedding Cake", emoji: "💍", price: 18500, quantity: 1, size: "Tiered / Custom", flavour: "Vanilla" }],
          subtotal: 18500,
          delivery: 0,
          tax: 925,
          total: 19425,
          status: "Delivered"
        }
      ];
      await Order.insertMany(defaultOrders);
      
      // Seed welcome messages for each order
      await Message.create([
        { orderId: "ORD-1042", sender: "admin", text: "Welcome to HE Cafe! We have received your order." },
        { orderId: "ORD-1041", sender: "admin", text: "Hello Kasun, your order is pending confirmation." },
        { orderId: "ORD-1040", sender: "admin", text: "Your custom order details look fantastic! We will get it ready." },
        { orderId: "ORD-1040", sender: "customer", text: "Thank you so much!" }
      ]);
      console.log('Default orders & messages seeded.');
    }

  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }
};

connectDB();

// API Routes Registration
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/flyers', require('./routes/flyers'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/categories', require('./routes/categories'));

// Base route
app.get('/', (req, res) => {
  res.send('HE Cafe API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
