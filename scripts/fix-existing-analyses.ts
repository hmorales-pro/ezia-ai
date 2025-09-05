// Script to update existing analyses to trigger a rerun
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Business } from '../models/Business';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function fixExistingAnalyses() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ezia');
    console.log('✅ Connected to MongoDB');

    // Find all businesses with old analysis structure
    const businesses = await Business.find({
      $or: [
        { 'market_analysis.target_audience': { $exists: true } },
        { 'marketing_strategy.positioning': { $exists: true } }
      ]
    });

    console.log(`\n📊 Found ${businesses.length} businesses with old analysis structure\n`);

    for (const business of businesses) {
      console.log(`🔧 Clearing analyses for: ${business.name} (${business.business_id})`);
      
      // Clear the old analyses to force a re-run
      await Business.updateOne(
        { _id: business._id },
        {
          $set: {
            market_analysis: null,
            marketing_strategy: null,
            competitor_analysis: null,
            website_prompt: null,
            agents_status: {
              market_analysis: 'pending',
              competitor_analysis: 'pending',
              marketing_strategy: 'pending',
              website_prompt: 'pending'
            }
          }
        }
      );
      
      console.log(`   ✅ Cleared old analyses and reset status to 'pending'`);
    }

    console.log('\n✨ All businesses updated. The analyses will need to be re-run.');
    console.log('💡 Users can re-run analyses from the business page by clicking on the "Relancer" button in the Agent Status card.');

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the fix
fixExistingAnalyses();