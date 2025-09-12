import { BaseAgent } from "./base-agent";
import { SiteStructure, SiteContent } from "@/types/agents";

export class MiloCopywritingAgent extends BaseAgent {
  constructor() {
    super("Milo", "Content and Copywriting Specialist");
  }

  async generateContent(
    structure: SiteStructure,
    businessInfo: {
      businessName: string;
      industry: string;
      description: string;
      targetAudience: string;
    }
  ): Promise<SiteContent> {
    const content: SiteContent = {};

    for (const section of structure.sections) {
      content[section.id] = await this.generateSectionContent(
        section,
        businessInfo
      );
    }

    return content;
  }

  private async generateSectionContent(
    section: any,
    businessInfo: any
  ): Promise<any> {
    const contentGenerators: Record<string, (section: any, info: any) => any> = {
      hero: this.generateHeroContent,
      services: this.generateServicesContent,
      about: this.generateAboutContent,
      menu: this.generateMenuContent,
      testimonials: this.generateTestimonialsContent,
      contact: this.generateContactContent,
      "case-studies": this.generateCaseStudiesContent,
      team: this.generateTeamContent,
      featured: this.generateFeaturedContent,
      categories: this.generateCategoriesContent,
      reservations: this.generateReservationsContent,
    };

    const generator = contentGenerators[section.type] || this.generateGenericContent;
    return generator.call(this, section, businessInfo);
  }

  private generateHeroContent(section: any, info: any): any {
    const headlines: Record<string, string> = {
      restaurant: `Experience Culinary Excellence at ${info.businessName}`,
      "e-commerce": `Discover Amazing Products at ${info.businessName}`,
      consulting: `Transform Your Business with ${info.businessName}`,
      default: `Welcome to ${info.businessName}`,
    };

    const subheadlines: Record<string, string> = {
      restaurant: "Where every meal is a celebration of flavor and tradition",
      "e-commerce": "Quality products, unbeatable prices, delivered to your door",
      consulting: "Strategic solutions for sustainable growth and success",
      default: "Your trusted partner for exceptional service",
    };

    return {
      headline: headlines[info.industry.toLowerCase()] || headlines.default,
      subheadline: subheadlines[info.industry.toLowerCase()] || subheadlines.default,
      cta: this.generateCTA(info.industry),
      secondaryCta: "Learn More",
    };
  }

  private generateServicesContent(section: any, info: any): any {
    const industryServices: Record<string, any[]> = {
      restaurant: [
        {
          name: "Fine Dining Experience",
          description: "Immerse yourself in our elegant atmosphere with carefully crafted dishes prepared by our award-winning chefs.",
          features: ["Seasonal menu", "Wine pairing", "Private dining rooms"],
        },
        {
          name: "Express Takeout & Delivery",
          description: "Enjoy restaurant-quality meals in the comfort of your home with our convenient ordering system.",
          features: ["Online ordering", "30-minute pickup", "Free delivery on orders over $50"],
        },
        {
          name: "Event Catering",
          description: "Make your special occasions memorable with our professional catering services.",
          features: ["Custom menus", "Full-service staff", "Equipment rental"],
        },
      ],
      "e-commerce": [
        {
          name: "Premium Product Selection",
          description: "Carefully curated products from trusted brands, ensuring quality and value in every purchase.",
          features: ["Quality guarantee", "Brand authenticity", "Expert curation"],
        },
        {
          name: "Fast & Secure Shipping",
          description: "Get your orders delivered quickly and safely with our reliable shipping partners.",
          features: ["Same-day processing", "Package tracking", "Secure packaging"],
        },
        {
          name: "24/7 Customer Support",
          description: "Our dedicated support team is always here to help with your questions and concerns.",
          features: ["Live chat", "Email support", "Phone assistance"],
        },
      ],
      consulting: [
        {
          name: "Strategic Planning",
          description: "Develop comprehensive strategies aligned with your business goals and market opportunities.",
          features: ["Market analysis", "Goal setting", "Roadmap development"],
        },
        {
          name: "Process Optimization",
          description: "Streamline operations and improve efficiency with our proven methodologies.",
          features: ["Workflow analysis", "Automation solutions", "Performance metrics"],
        },
        {
          name: "Leadership Development",
          description: "Empower your team with skills and knowledge to drive organizational success.",
          features: ["Executive coaching", "Team workshops", "Skills assessment"],
        },
      ],
      default: [
        {
          name: "Core Service",
          description: "Our primary offering delivers exceptional value and results for your needs.",
          features: ["Feature 1", "Feature 2", "Feature 3"],
        },
        {
          name: "Premium Service",
          description: "Enhanced solutions with additional features and priority support.",
          features: ["All core features", "Priority support", "Advanced options"],
        },
        {
          name: "Enterprise Solution",
          description: "Comprehensive packages designed for large-scale operations.",
          features: ["Custom solutions", "Dedicated account manager", "SLA guarantee"],
        },
      ],
    };

    return {
      intro: `Discover how ${info.businessName} can help you achieve your goals`,
      items: industryServices[info.industry.toLowerCase()] || industryServices.default,
    };
  }

  private generateAboutContent(section: any, info: any): any {
    const stories: Record<string, string> = {
      restaurant: `Since our founding, ${info.businessName} has been dedicated to creating unforgettable dining experiences. Our passion for exceptional cuisine, combined with warm hospitality, has made us a beloved destination for food enthusiasts. Every dish tells a story of tradition, innovation, and the finest ingredients sourced locally and globally.`,
      "e-commerce": `${info.businessName} started with a simple vision: make online shopping easier, more affordable, and more enjoyable. Today, we're proud to serve thousands of satisfied customers who trust us for quality products and exceptional service. Our commitment to innovation and customer satisfaction drives everything we do.`,
      consulting: `With decades of combined experience, ${info.businessName} has helped countless organizations navigate complex challenges and achieve sustainable growth. Our team of experts brings diverse perspectives and proven methodologies to deliver results that exceed expectations. We're not just consultants; we're partners in your success.`,
      default: `${info.businessName} has been at the forefront of the ${info.industry} industry, setting standards for quality and service. Our journey is marked by continuous innovation, unwavering commitment to excellence, and deep relationships with our clients and community.`,
    };

    const missions: Record<string, string> = {
      restaurant: "To create extraordinary culinary experiences that bring people together and celebrate the art of fine dining.",
      "e-commerce": "To revolutionize online shopping by offering unparalleled selection, value, and customer service.",
      consulting: "To empower businesses with strategic insights and practical solutions that drive lasting transformation.",
      default: `To be the leading provider of ${info.industry} services, delivering exceptional value and building lasting partnerships.`,
    };

    const values = [
      { title: "Excellence", description: "We pursue the highest standards in everything we do" },
      { title: "Innovation", description: "We embrace change and continuously improve our offerings" },
      { title: "Integrity", description: "We operate with transparency and ethical principles" },
      { title: "Community", description: "We believe in giving back and supporting our local community" },
    ];

    return {
      story: stories[info.industry.toLowerCase()] || stories.default,
      mission: missions[info.industry.toLowerCase()] || missions.default,
      values,
      stats: this.generateStats(info.industry),
    };
  }

  private generateMenuContent(section: any, info: any): any {
    return {
      categories: [
        {
          name: "Appetizers",
          items: [
            { name: "Artisan Bruschetta", price: "$12", description: "Toasted bread with fresh tomatoes, basil, and garlic" },
            { name: "Calamari Fritti", price: "$14", description: "Crispy fried squid with zesty marinara sauce" },
            { name: "Cheese Board", price: "$18", description: "Selection of imported cheeses with accompaniments" },
          ],
        },
        {
          name: "Main Courses",
          items: [
            { name: "Grilled Salmon", price: "$28", description: "Atlantic salmon with lemon butter sauce and seasonal vegetables" },
            { name: "Ribeye Steak", price: "$42", description: "12oz prime cut with roasted potatoes and asparagus" },
            { name: "Vegetarian Risotto", price: "$24", description: "Creamy arborio rice with seasonal mushrooms and truffle oil" },
          ],
        },
        {
          name: "Desserts",
          items: [
            { name: "Tiramisu", price: "$10", description: "Classic Italian dessert with espresso and mascarpone" },
            { name: "Chocolate Lava Cake", price: "$12", description: "Warm chocolate cake with molten center, served with vanilla ice cream" },
            { name: "Seasonal Fruit Tart", price: "$11", description: "Fresh fruit on vanilla custard with buttery crust" },
          ],
        },
      ],
      specialNote: "All dishes are prepared fresh to order. Please inform us of any dietary restrictions.",
    };
  }

  private generateTestimonialsContent(section: any, info: any): any {
    const industryTestimonials: Record<string, any[]> = {
      restaurant: [
        {
          text: "The best dining experience we've had in years! The ambiance, service, and food were all exceptional. Can't wait to return!",
          author: "Sarah Johnson",
          role: "Food Critic, Local Times",
          rating: 5,
        },
        {
          text: "From the moment we walked in, we felt like VIPs. The chef's tasting menu was a culinary journey we'll never forget.",
          author: "Michael Chen",
          role: "Regular Customer",
          rating: 5,
        },
        {
          text: "Perfect for special occasions! The private dining room and personalized service made our anniversary unforgettable.",
          author: "Emily Rodriguez",
          role: "Anniversary Celebration",
          rating: 5,
        },
      ],
      "e-commerce": [
        {
          text: "Fast shipping, great prices, and excellent customer service. This is my go-to online store for everything!",
          author: "David Thompson",
          role: "Verified Buyer",
          rating: 5,
        },
        {
          text: "The product quality exceeded my expectations, and the return process was hassle-free. Highly recommend!",
          author: "Lisa Park",
          role: "Repeat Customer",
          rating: 5,
        },
        {
          text: "Best online shopping experience I've had. The website is easy to navigate and checkout is a breeze.",
          author: "James Wilson",
          role: "First-Time Buyer",
          rating: 5,
        },
      ],
      consulting: [
        {
          text: "Their strategic insights transformed our business. Revenue increased by 40% within six months of implementation.",
          author: "Robert Martinez",
          role: "CEO, Tech Innovations Inc.",
          rating: 5,
        },
        {
          text: "The team's expertise and dedication to our success was evident from day one. Worth every investment.",
          author: "Amanda Foster",
          role: "COO, Global Retail Corp",
          rating: 5,
        },
        {
          text: "They didn't just provide recommendations; they rolled up their sleeves and helped us execute. True partners.",
          author: "Christopher Lee",
          role: "Founder, StartUp Ventures",
          rating: 5,
        },
      ],
      default: [
        {
          text: "Outstanding service and exceptional results. They exceeded our expectations in every way.",
          author: "Client Name",
          role: "Position, Company",
          rating: 5,
        },
        {
          text: "Professional, reliable, and delivers on promises. Highly recommend their services.",
          author: "Customer Name",
          role: "Verified Client",
          rating: 5,
        },
        {
          text: "The best in the business! Their attention to detail and customer focus sets them apart.",
          author: "User Name",
          role: "Long-term Partner",
          rating: 5,
        },
      ],
    };

    return {
      items: industryTestimonials[info.industry.toLowerCase()] || industryTestimonials.default,
      callToAction: `Join thousands of satisfied ${info.targetAudience.toLowerCase()} who trust ${info.businessName}`,
    };
  }

  private generateContactContent(section: any, info: any): any {
    return {
      headline: "Get in Touch",
      subheadline: `We'd love to hear from you. Reach out to ${info.businessName} today!`,
      form: {
        fields: [
          { name: "name", label: "Full Name", type: "text", required: true },
          { name: "email", label: "Email Address", type: "email", required: true },
          { name: "phone", label: "Phone Number", type: "tel", required: false },
          { name: "subject", label: "Subject", type: "text", required: true },
          { name: "message", label: "Your Message", type: "textarea", required: true },
        ],
        submitText: "Send Message",
        successMessage: "Thank you for your message! We'll get back to you within 24 hours.",
      },
      info: {
        address: "123 Business Street, Suite 100\nCity, State 12345",
        phone: "(555) 123-4567",
        email: `info@${info.businessName.toLowerCase().replace(/\s+/g, "")}.com`,
        hours: this.generateBusinessHours(info.industry),
      },
    };
  }

  private generateCaseStudiesContent(section: any, info: any): any {
    return {
      items: [
        {
          title: "Digital Transformation Success",
          client: "Fortune 500 Retail Company",
          challenge: "Outdated systems limiting growth and customer experience",
          solution: "Implemented comprehensive digital strategy and modern tech stack",
          results: ["200% increase in online sales", "50% reduction in operational costs", "Customer satisfaction up 35%"],
          testimonial: "The transformation exceeded all our expectations. A game-changer for our business.",
        },
        {
          title: "Market Expansion Strategy",
          client: "Regional Service Provider",
          challenge: "Limited market reach and stagnant growth",
          solution: "Developed targeted expansion strategy with phased implementation",
          results: ["Entered 5 new markets", "Revenue growth of 150%", "Market share increased by 40%"],
          testimonial: "Their strategic approach made our ambitious expansion goals achievable.",
        },
      ],
    };
  }

  private generateTeamContent(section: any, info: any): any {
    const roles: Record<string, any[]> = {
      restaurant: [
        { name: "Chef Alexandre Martin", role: "Executive Chef", bio: "Award-winning chef with 20 years of experience in Michelin-starred restaurants." },
        { name: "Sofia Rodriguez", role: "Restaurant Manager", bio: "Hospitality expert dedicated to creating memorable dining experiences." },
        { name: "James Chen", role: "Head Sommelier", bio: "Certified sommelier with expertise in wine pairing and collection curation." },
        { name: "Maria Anderson", role: "Pastry Chef", bio: "Creative pastry artist specializing in contemporary desserts." },
      ],
      "e-commerce": [
        { name: "David Kim", role: "CEO & Founder", bio: "E-commerce veteran with a passion for customer-centric innovation." },
        { name: "Sarah Thompson", role: "Head of Operations", bio: "Supply chain expert ensuring smooth delivery and customer satisfaction." },
        { name: "Mike Johnson", role: "Customer Success Director", bio: "Dedicated to providing exceptional support and building lasting relationships." },
        { name: "Emma Davis", role: "Product Curator", bio: "Trend spotter with an eye for quality and value in every product selection." },
      ],
      consulting: [
        { name: "Dr. Robert Williams", role: "Managing Partner", bio: "Strategy expert with 25 years of experience transforming businesses." },
        { name: "Lisa Chen", role: "Senior Consultant", bio: "Specializes in operational excellence and process optimization." },
        { name: "Mark Anderson", role: "Digital Transformation Lead", bio: "Technology strategist helping businesses navigate digital evolution." },
        { name: "Jennifer Martinez", role: "Client Success Manager", bio: "Ensures every client achieves their goals through personalized support." },
      ],
      default: [
        { name: "Team Member 1", role: "Leadership", bio: "Experienced professional driving innovation and excellence." },
        { name: "Team Member 2", role: "Operations", bio: "Ensuring smooth operations and exceptional service delivery." },
        { name: "Team Member 3", role: "Customer Relations", bio: "Building strong relationships and ensuring client satisfaction." },
        { name: "Team Member 4", role: "Innovation", bio: "Pushing boundaries and developing cutting-edge solutions." },
      ],
    };

    return {
      headline: "Meet Our Team",
      subheadline: "The talented individuals who make it all possible",
      members: roles[info.industry.toLowerCase()] || roles.default,
    };
  }

  private generateFeaturedContent(section: any, info: any): any {
    return {
      headline: "Featured This Month",
      items: [
        {
          name: "Premium Collection",
          description: "Handpicked items offering exceptional value and quality",
          price: "Starting at $49.99",
          image: "featured-1.jpg",
          badge: "Best Seller",
        },
        {
          name: "Limited Edition",
          description: "Exclusive products available for a limited time only",
          price: "From $79.99",
          image: "featured-2.jpg",
          badge: "Limited Time",
        },
        {
          name: "Customer Favorite",
          description: "Top-rated by our community of satisfied customers",
          price: "Only $39.99",
          image: "featured-3.jpg",
          badge: "Top Rated",
        },
      ],
    };
  }

  private generateCategoriesContent(section: any, info: any): any {
    return {
      headline: "Shop by Category",
      categories: [
        { name: "Electronics", count: 150, icon: "laptop" },
        { name: "Fashion", count: 280, icon: "tshirt" },
        { name: "Home & Garden", count: 120, icon: "home" },
        { name: "Sports & Outdoors", count: 95, icon: "running" },
      ],
    };
  }

  private generateReservationsContent(section: any, info: any): any {
    return {
      headline: "Reserve Your Table",
      subheadline: "Book your dining experience in advance",
      form: {
        confirmationMessage: "Your reservation has been confirmed! We'll send you an email with the details.",
        policies: [
          "Reservations are held for 15 minutes past the booking time",
          "For parties larger than 8, please call us directly",
          "Cancellations must be made at least 2 hours in advance",
        ],
      },
    };
  }

  private generateGenericContent(section: any, info: any): any {
    return {
      headline: section.title,
      content: `Welcome to the ${section.title} section of ${info.businessName}.`,
    };
  }

  private generateCTA(industry: string): string {
    const ctas: Record<string, string> = {
      restaurant: "Reserve a Table",
      "e-commerce": "Shop Now",
      consulting: "Schedule Consultation",
      default: "Get Started",
    };
    return ctas[industry.toLowerCase()] || ctas.default;
  }

  private generateStats(industry: string): any[] {
    const stats: Record<string, any[]> = {
      restaurant: [
        { value: "10+", label: "Years of Excellence" },
        { value: "50K+", label: "Happy Customers" },
        { value: "15", label: "Award-Winning Dishes" },
        { value: "98%", label: "Customer Satisfaction" },
      ],
      "e-commerce": [
        { value: "100K+", label: "Products Available" },
        { value: "500K+", label: "Happy Customers" },
        { value: "24/7", label: "Customer Support" },
        { value: "2-Day", label: "Average Delivery" },
      ],
      consulting: [
        { value: "500+", label: "Projects Completed" },
        { value: "$2B+", label: "Client Revenue Generated" },
        { value: "98%", label: "Client Retention" },
        { value: "25+", label: "Industry Awards" },
      ],
      default: [
        { value: "15+", label: "Years Experience" },
        { value: "1000+", label: "Satisfied Clients" },
        { value: "99%", label: "Success Rate" },
        { value: "24/7", label: "Support Available" },
      ],
    };
    return stats[industry.toLowerCase()] || stats.default;
  }

  private generateBusinessHours(industry: string): string {
    const hours: Record<string, string> = {
      restaurant: "Monday - Thursday: 11:30 AM - 10:00 PM\nFriday - Saturday: 11:30 AM - 11:00 PM\nSunday: 10:00 AM - 9:00 PM",
      "e-commerce": "24/7 Online\nCustomer Support: Monday - Friday 9:00 AM - 6:00 PM EST",
      consulting: "Monday - Friday: 9:00 AM - 6:00 PM\nSaturday: By Appointment\nSunday: Closed",
      default: "Monday - Friday: 9:00 AM - 5:00 PM\nSaturday - Sunday: Closed",
    };
    return hours[industry.toLowerCase()] || hours.default;
  }
}