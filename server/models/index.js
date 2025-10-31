const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    console.log(`✓ MongoDB Atlas متصل: ${conn.connection.host}`);
    console.log(`✓ قاعدة البيانات: ${conn.connection.name}`);
  } catch (error) {
    console.error('خطأ في الاتصال بـ MongoDB Atlas:', error);
    process.exit(1);
  }
};

// Admin Schema
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// News Schema
const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  date: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Conversations Schema
const conversationsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  participants: [{ type: String, required: true }],
  content: { type: String, required: true },
  date: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Articles Schema
const articlesSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Palestine Schema
const palestineSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Gallery Schema
const gallerySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  images: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Family Tree Schema
const familyTreeSchema = new mongoose.Schema({
  patriarch: { type: String, required: true },
  generations: [{
    generation: { type: Number, required: true },
    members: [{ type: String, required: true }]
  }],
  updatedAt: { type: Date, default: Date.now }
});

// Contacts Schema
const contactsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['new', 'read', 'replied', 'archived'], 
    default: 'new' 
  },
  date: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create Models
const Admin = mongoose.model('Admin', adminSchema);
const News = mongoose.model('News', newsSchema);
const Conversations = mongoose.model('Conversations', conversationsSchema);
const Articles = mongoose.model('Articles', articlesSchema);
const Palestine = mongoose.model('Palestine', palestineSchema);
const Gallery = mongoose.model('Gallery', gallerySchema);
const FamilyTree = mongoose.model('FamilyTree', familyTreeSchema);
const Contacts = mongoose.model('Contacts', contactsSchema);

module.exports = {
  connectDB,
  Admin,
  News,
  Conversations,
  Articles,
  Palestine,
  Gallery,
  FamilyTree,
  Contacts
};
