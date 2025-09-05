// Script to check analysis data in the database
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Business } from '../models/Business';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function checkAnalysisData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ezia');
    console.log('✅ Connected to MongoDB');

    // Find all businesses with completed analyses
    const businesses = await Business.find({
      'agents_status.market_analysis': 'completed'
    }).select('name business_id market_analysis marketing_strategy agents_status').lean();

    console.log(`\n📊 Found ${businesses.length} businesses with completed analyses\n`);

    for (const business of businesses) {
      console.log(`\n🏢 Business: ${business.name} (${business.business_id})`);
      console.log(`   Status: ${JSON.stringify(business.agents_status, null, 2)}`);
      
      if (business.market_analysis) {
        console.log('\n   📈 Market Analysis:');
        const keys = Object.keys(business.market_analysis as any);
        console.log(`      - Structure keys: ${keys.join(', ')}`);
        console.log(`      - Has executive_summary: ${!!(business.market_analysis as any).executive_summary}`);
        console.log(`      - Has market_overview: ${!!(business.market_analysis as any).market_overview}`);
        console.log(`      - Has pestel_analysis: ${!!(business.market_analysis as any).pestel_analysis}`);
        console.log(`      - Has swot_analysis: ${!!(business.market_analysis as any).swot_analysis}`);
      }
      
      if (business.marketing_strategy) {
        console.log('\n   🎯 Marketing Strategy:');
        const keys = Object.keys(business.marketing_strategy as any);
        console.log(`      - Structure keys: ${keys.slice(0, 5).join(', ')}...`);
        console.log(`      - Has executive_summary: ${!!(business.marketing_strategy as any).executive_summary}`);
        console.log(`      - Has brand_positioning: ${!!(business.marketing_strategy as any).brand_positioning}`);
      }
      
      console.log('\n   ---');
    }

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the check
checkAnalysisData();