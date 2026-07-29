require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Feedback = require('../models/Feedback');
const FeatureRequest = require('../models/FeatureRequest');
const { analyzeSentiment } = require('./aiHelpers');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Create admin if missing
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@feedback.com';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        username: process.env.ADMIN_USERNAME || 'admin',
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD || 'Admin@123',
        role: 'admin',
      });
      console.log(`✅ Admin created: ${adminEmail}`);
    } else {
      console.log('Admin already exists, skipping creation.');
    }

    // Create a demo user
    let demoUser = await User.findOne({ email: 'demo@feedback.com' });
    if (!demoUser) {
      demoUser = await User.create({
        username: 'demo_user',
        email: 'demo@feedback.com',
        password: 'Demo@123',
        role: 'user',
      });
      console.log('✅ Demo user created: demo@feedback.com / Demo@123');
    }

    // Seed feature requests if none
    const existing = await FeatureRequest.countDocuments();
    if (existing === 0) {
      const samples = [
        {
          title: 'Add Dark Mode',
          description: 'Please add a beautiful dark mode theme for late-night use. It would be amazing and reduce eye strain significantly.',
          category: 'UI/UX',
          votes: 234,
          status: 'reviewed',
          createdBy: demoUser._id,
        },
        {
          title: 'Mobile App Support',
          description: 'Native iOS and Android apps would be a great addition to access the portal on the go.',
          category: 'Feature',
          votes: 187,
          status: 'pending',
          createdBy: demoUser._id,
        },
        {
          title: 'Slack Integration',
          description: 'Integrate with Slack to receive real-time notifications when new feedback is submitted.',
          category: 'Integration',
          votes: 156,
          status: 'pending',
          createdBy: demoUser._id,
        },
        {
          title: 'Export to CSV',
          description: 'Allow admins to export feedback and feature request data to CSV for analysis.',
          category: 'Feature',
          votes: 98,
          status: 'implemented',
          createdBy: admin._id,
        },
        {
          title: 'Multi-language Support',
          description: 'Support for Telugu, Hindi, Tamil, Spanish, and French to reach a wider audience.',
          category: 'Feature',
          votes: 142,
          status: 'pending',
          createdBy: demoUser._id,
        },
      ];

      for (const s of samples) {
        s.sentiment = analyzeSentiment(`${s.title} ${s.description}`);
      }
      await FeatureRequest.insertMany(samples);
      console.log(`✅ Seeded ${samples.length} feature requests.`);
    }

    // Seed feedback if none
    const feedbackCount = await Feedback.countDocuments();
    if (feedbackCount === 0) {
      const feedbacks = [
        {
          title: 'Great Product!',
          description: 'I absolutely love using this portal. The interface is clean and intuitive.',
          category: 'General',
          createdBy: demoUser._id,
        },
        {
          title: 'Slow loading on dashboard',
          description: 'The admin dashboard takes a while to load when there are many feedback entries.',
          category: 'Performance',
          createdBy: demoUser._id,
        },
        {
          title: 'Login button not working on Safari',
          description: 'The login button does not respond on Safari browser version 15.',
          category: 'Bug',
          createdBy: demoUser._id,
        },
      ];
      for (const f of feedbacks) {
        f.sentiment = analyzeSentiment(`${f.title} ${f.description}`);
      }
      await Feedback.insertMany(feedbacks);
      console.log(`✅ Seeded ${feedbacks.length} feedback entries.`);
    }

    console.log('\n🎉 Seeding completed successfully!');
    console.log(`\n🔐 Admin login -> email: ${adminEmail}  password: ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
    console.log(`👤 Demo login  -> email: demo@feedback.com  password: Demo@123\n`);
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
};

seed();
