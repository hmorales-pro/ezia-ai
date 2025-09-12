import { BaseAgent } from "./base-agent";
import { SiteStructure, DesignSystem, GeneratedHTML } from "@/types/agents";

export class LexSiteBuilderAgent extends BaseAgent {
  constructor() {
    super("Lex", "Site Structure and HTML Builder");
  }

  async buildSite(
    structure: SiteStructure,
    designSystem: DesignSystem,
    content: Record<string, any>
  ): Promise<GeneratedHTML> {
    const sections = await Promise.all(
      structure.sections.map((section) =>
        this.buildSection(section, designSystem, content[section.id])
      )
    );

    const navigation = this.buildNavigation(structure.navigation, designSystem);
    const footer = this.buildFooter(structure.businessName, designSystem);

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${structure.metadata.title}</title>
    <meta name="description" content="${structure.metadata.description}">
    <meta name="keywords" content="${structure.metadata.keywords.join(", ")}">
    
    <!-- Font Imports -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;700&family=Merriweather:wght@300;400;700&family=Open+Sans:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&family=Source+Sans+Pro:wght@300;400;600;700&display=swap" rel="stylesheet">
    
    <!-- Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    ${navigation}
    <main>
        ${sections.join("\n")}
    </main>
    ${footer}
    
    <script>
        // Smooth scrolling for navigation
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }

        // Form submission handler
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                alert('Thank you for your message! We will get back to you soon.');
                contactForm.reset();
            });
        }
    </script>
</body>
</html>`;

    return {
      html,
      sections,
      metadata: structure.metadata,
    };
  }

  private buildNavigation(navItems: any[], designSystem: DesignSystem): string {
    return `
    <nav class="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
        <div class="container mx-auto px-4">
            <div class="flex justify-between items-center h-16">
                <div class="flex items-center">
                    <span class="text-2xl font-bold" style="color: var(--color-primary);">Logo</span>
                </div>
                
                <!-- Desktop Navigation -->
                <div class="hidden md:flex items-center space-x-8">
                    ${navItems
                      .map(
                        (item) => `
                        <a href="${item.href}" class="text-neutral-700 hover:text-primary transition-colors">
                            ${item.label}
                        </a>
                    `
                      )
                      .join("")}
                    <button class="btn">Get Started</button>
                </div>
                
                <!-- Mobile Menu Button -->
                <button id="mobile-menu-btn" class="md:hidden p-2">
                    <i class="fas fa-bars text-2xl"></i>
                </button>
            </div>
            
            <!-- Mobile Navigation -->
            <div id="mobile-menu" class="hidden md:hidden pb-4">
                ${navItems
                  .map(
                    (item) => `
                    <a href="${item.href}" class="block py-2 text-neutral-700">
                        ${item.label}
                    </a>
                `
                  )
                  .join("")}
                <button class="btn w-full mt-4">Get Started</button>
            </div>
        </div>
    </nav>`;
  }

  private async buildSection(
    section: any,
    designSystem: DesignSystem,
    content: any
  ): Promise<string> {
    const sectionBuilders: Record<string, (section: any, content: any) => string> = {
      hero: this.buildHeroSection.bind(this),
      services: this.buildServicesSection.bind(this),
      about: this.buildAboutSection.bind(this),
      menu: this.buildMenuSection.bind(this),
      testimonials: this.buildTestimonialsSection.bind(this),
      contact: this.buildContactSection.bind(this),
      "case-studies": this.buildCaseStudiesSection.bind(this),
      team: this.buildTeamSection.bind(this),
      featured: this.buildFeaturedSection.bind(this),
      categories: this.buildCategoriesSection.bind(this),
      reservations: this.buildReservationsSection.bind(this),
    };

    const builder = sectionBuilders[section.type] || this.buildGenericSection.bind(this);
    return builder(section, content || section.content);
  }

  private buildHeroSection(section: any, content: any): string {
    return `
    <section id="${section.id}" class="section relative min-h-screen flex items-center justify-center" style="padding-top: 80px;">
        <div class="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10"></div>
        <div class="container relative z-10 text-center">
            <h1 class="animate-fadeIn">${content.headline}</h1>
            <p class="text-xl text-neutral-600 mb-8 animate-slideUp" style="animation-delay: 0.2s;">
                ${content.subheadline}
            </p>
            <div class="flex gap-4 justify-center animate-slideUp" style="animation-delay: 0.4s;">
                <a href="#contact" class="btn">
                    ${content.cta} <i class="fas fa-arrow-right ml-2"></i>
                </a>
                <a href="#services" class="btn-secondary">
                    Learn More
                </a>
            </div>
        </div>
    </section>`;
  }

  private buildServicesSection(section: any, content: any): string {
    const services = content.items || [];
    return `
    <section id="${section.id}" class="section bg-neutral-50">
        <div class="container">
            <h2 class="text-center mb-12">${section.title}</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                ${services
                  .map(
                    (service: any, index: number) => `
                    <div class="card animate-slideUp" style="animation-delay: ${index * 0.1}s;">
                        <div class="text-center">
                            <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i class="fas fa-${this.getServiceIcon(service.name)} text-2xl text-primary"></i>
                            </div>
                            <h3 class="text-xl font-semibold mb-3">${service.name}</h3>
                            <p class="text-neutral-600">${service.description}</p>
                        </div>
                    </div>
                `
                  )
                  .join("")}
            </div>
        </div>
    </section>`;
  }

  private buildAboutSection(section: any, content: any): string {
    return `
    <section id="${section.id}" class="section">
        <div class="container">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div class="animate-slideIn">
                    <h2>${section.title}</h2>
                    <p class="text-lg text-neutral-600 mb-6">${content.story}</p>
                    <div class="bg-primary/5 p-6 rounded-lg">
                        <h4 class="text-primary mb-3">Our Mission</h4>
                        <p class="text-neutral-700">${content.mission}</p>
                    </div>
                </div>
                <div class="animate-slideUp">
                    <img src="https://picsum.photos/600/400" alt="About us" class="rounded-lg shadow-lg w-full">
                </div>
            </div>
        </div>
    </section>`;
  }

  private buildMenuSection(section: any, content: any): string {
    const categories = content.categories || [];
    return `
    <section id="${section.id}" class="section bg-neutral-50">
        <div class="container">
            <h2 class="text-center mb-8">${section.title}</h2>
            <div class="max-w-4xl mx-auto">
                <div class="flex flex-wrap justify-center gap-4 mb-8">
                    ${categories
                      .map(
                        (category: string, index: number) => `
                        <button class="px-6 py-2 rounded-full ${
                          index === 0 ? "bg-primary text-white" : "bg-white text-neutral-700"
                        } transition-all hover:shadow-md">
                            ${category}
                        </button>
                    `
                      )
                      .join("")}
                </div>
                <div class="grid gap-6">
                    ${this.generateMenuItems(3)}
                </div>
            </div>
        </div>
    </section>`;
  }

  private buildContactSection(section: any, content: any): string {
    return `
    <section id="${section.id}" class="section bg-neutral-900 text-white">
        <div class="container">
            <h2 class="text-center text-white mb-12">${section.title}</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
                <div class="animate-slideIn">
                    <h3 class="text-2xl mb-6">Get in Touch</h3>
                    <form id="contact-form" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium mb-2">Name</label>
                            <input type="text" class="form-input text-neutral-900" required>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2">Email</label>
                            <input type="email" class="form-input text-neutral-900" required>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2">Message</label>
                            <textarea class="form-input text-neutral-900" rows="4" required></textarea>
                        </div>
                        <button type="submit" class="btn w-full">Send Message</button>
                    </form>
                </div>
                <div class="animate-slideUp">
                    <h3 class="text-2xl mb-6">Contact Information</h3>
                    <div class="space-y-4">
                        <div class="flex items-start gap-4">
                            <i class="fas fa-map-marker-alt text-primary mt-1"></i>
                            <div>
                                <p class="font-medium">Address</p>
                                <p class="text-neutral-300">123 Business Street, Suite 100<br>City, State 12345</p>
                            </div>
                        </div>
                        <div class="flex items-start gap-4">
                            <i class="fas fa-phone text-primary mt-1"></i>
                            <div>
                                <p class="font-medium">Phone</p>
                                <p class="text-neutral-300">(555) 123-4567</p>
                            </div>
                        </div>
                        <div class="flex items-start gap-4">
                            <i class="fas fa-envelope text-primary mt-1"></i>
                            <div>
                                <p class="font-medium">Email</p>
                                <p class="text-neutral-300">info@example.com</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>`;
  }

  private buildTestimonialsSection(section: any, content: any): string {
    return `
    <section id="${section.id}" class="section">
        <div class="container">
            <h2 class="text-center mb-12">${section.title}</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                ${[1, 2, 3]
                  .map(
                    (i) => `
                    <div class="card text-center">
                        <div class="flex justify-center mb-4">
                            ${[...Array(5)].map(() => '<i class="fas fa-star text-warning"></i>').join("")}
                        </div>
                        <p class="text-neutral-600 mb-4">"Exceptional service and outstanding results. Highly recommended!"</p>
                        <p class="font-semibold">Customer ${i}</p>
                        <p class="text-sm text-neutral-500">Verified Client</p>
                    </div>
                `
                  )
                  .join("")}
            </div>
        </div>
    </section>`;
  }

  private buildCaseStudiesSection(section: any, content: any): string {
    return `
    <section id="${section.id}" class="section bg-neutral-50">
        <div class="container">
            <h2 class="text-center mb-12">${section.title}</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                ${[1, 2]
                  .map(
                    (i) => `
                    <div class="card overflow-hidden">
                        <img src="https://picsum.photos/400/300?random=${i}" alt="Case study ${i}" class="w-full h-48 object-cover">
                        <div class="p-6">
                            <h3 class="text-xl font-semibold mb-3">Project ${i}: Transformation Success</h3>
                            <p class="text-neutral-600 mb-4">Delivered 200% ROI through strategic implementation and optimization.</p>
                            <a href="#" class="text-primary font-medium hover:underline">Read Case Study →</a>
                        </div>
                    </div>
                `
                  )
                  .join("")}
            </div>
        </div>
    </section>`;
  }

  private buildTeamSection(section: any, content: any): string {
    return `
    <section id="${section.id}" class="section">
        <div class="container">
            <h2 class="text-center mb-12">${section.title}</h2>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                ${[1, 2, 3, 4]
                  .map(
                    (i) => `
                    <div class="text-center">
                        <img src="https://picsum.photos/200/200?random=${i}" alt="Team member ${i}" class="w-32 h-32 rounded-full mx-auto mb-4 object-cover">
                        <h4 class="font-semibold">Team Member ${i}</h4>
                        <p class="text-sm text-neutral-600">Position</p>
                    </div>
                `
                  )
                  .join("")}
            </div>
        </div>
    </section>`;
  }

  private buildFeaturedSection(section: any, content: any): string {
    return `
    <section id="${section.id}" class="section">
        <div class="container">
            <h2 class="text-center mb-12">Featured Products</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                ${[1, 2, 3]
                  .map(
                    (i) => `
                    <div class="card group cursor-pointer">
                        <img src="https://picsum.photos/300/200?random=${i}" alt="Product ${i}" class="w-full h-48 object-cover rounded-lg mb-4">
                        <h3 class="text-lg font-semibold mb-2">Featured Product ${i}</h3>
                        <p class="text-neutral-600 mb-4">High-quality product with exceptional features.</p>
                        <div class="flex justify-between items-center">
                            <span class="text-2xl font-bold text-primary">$99.99</span>
                            <button class="btn-secondary">View Details</button>
                        </div>
                    </div>
                `
                  )
                  .join("")}
            </div>
        </div>
    </section>`;
  }

  private buildCategoriesSection(section: any, content: any): string {
    return `
    <section id="${section.id}" class="section bg-neutral-50">
        <div class="container">
            <h2 class="text-center mb-12">Shop by Category</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                ${["Electronics", "Fashion", "Home & Garden", "Sports"]
                  .map(
                    (category, i) => `
                    <div class="bg-white rounded-lg p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
                        <div class="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-${this.getCategoryIcon(category)} text-3xl text-primary"></i>
                        </div>
                        <h3 class="font-semibold">${category}</h3>
                    </div>
                `
                  )
                  .join("")}
            </div>
        </div>
    </section>`;
  }

  private buildReservationsSection(section: any, content: any): string {
    return `
    <section id="${section.id}" class="section">
        <div class="container">
            <h2 class="text-center mb-12">Make a Reservation</h2>
            <div class="max-w-2xl mx-auto">
                <form class="card">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-medium mb-2">Date</label>
                            <input type="date" class="form-input" required>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2">Time</label>
                            <input type="time" class="form-input" required>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-medium mb-2">Number of Guests</label>
                            <select class="form-input" required>
                                <option>1-2 guests</option>
                                <option>3-4 guests</option>
                                <option>5-6 guests</option>
                                <option>7+ guests</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2">Seating Preference</label>
                            <select class="form-input">
                                <option>No preference</option>
                                <option>Indoor</option>
                                <option>Outdoor</option>
                                <option>Bar</option>
                            </select>
                        </div>
                    </div>
                    <div class="mb-4">
                        <label class="block text-sm font-medium mb-2">Special Requests</label>
                        <textarea class="form-input" rows="3" placeholder="Any dietary restrictions or special occasions?"></textarea>
                    </div>
                    <button type="submit" class="btn w-full">Reserve Table</button>
                </form>
            </div>
        </div>
    </section>`;
  }

  private buildGenericSection(section: any, content: any): string {
    return `
    <section id="${section.id}" class="section">
        <div class="container">
            <h2 class="text-center mb-12">${section.title}</h2>
            <div class="max-w-4xl mx-auto text-center">
                <p class="text-lg text-neutral-600">
                    ${JSON.stringify(content)}
                </p>
            </div>
        </div>
    </section>`;
  }

  private buildFooter(businessName: string, designSystem: DesignSystem): string {
    return `
    <footer class="bg-neutral-900 text-white py-12">
        <div class="container">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div>
                    <h3 class="text-xl font-bold mb-4">${businessName}</h3>
                    <p class="text-neutral-400">Your trusted partner in excellence.</p>
                </div>
                <div>
                    <h4 class="font-semibold mb-4">Quick Links</h4>
                    <ul class="space-y-2">
                        <li><a href="#services" class="text-neutral-400 hover:text-white">Services</a></li>
                        <li><a href="#about" class="text-neutral-400 hover:text-white">About</a></li>
                        <li><a href="#contact" class="text-neutral-400 hover:text-white">Contact</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-semibold mb-4">Legal</h4>
                    <ul class="space-y-2">
                        <li><a href="#" class="text-neutral-400 hover:text-white">Privacy Policy</a></li>
                        <li><a href="#" class="text-neutral-400 hover:text-white">Terms of Service</a></li>
                        <li><a href="#" class="text-neutral-400 hover:text-white">Cookie Policy</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-semibold mb-4">Follow Us</h4>
                    <div class="flex gap-4">
                        <a href="#" class="text-neutral-400 hover:text-white text-xl"><i class="fab fa-facebook"></i></a>
                        <a href="#" class="text-neutral-400 hover:text-white text-xl"><i class="fab fa-twitter"></i></a>
                        <a href="#" class="text-neutral-400 hover:text-white text-xl"><i class="fab fa-instagram"></i></a>
                        <a href="#" class="text-neutral-400 hover:text-white text-xl"><i class="fab fa-linkedin"></i></a>
                    </div>
                </div>
            </div>
            <div class="border-t border-neutral-800 pt-8 text-center">
                <p class="text-neutral-400">&copy; 2024 ${businessName}. All rights reserved. | Powered by Ezia Multi-Agent System</p>
            </div>
        </div>
    </footer>`;
  }

  private getServiceIcon(serviceName: string): string {
    const icons: Record<string, string> = {
      "Dine In": "utensils",
      "Takeout": "shopping-bag",
      "Catering": "users",
      "Strategy": "chess",
      "Implementation": "cogs",
      "Training": "graduation-cap",
      "Service 1": "star",
      "Service 2": "rocket",
      "Service 3": "shield-alt",
    };
    return icons[serviceName] || "circle";
  }

  private getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      "Electronics": "laptop",
      "Fashion": "tshirt",
      "Home & Garden": "home",
      "Sports": "running",
    };
    return icons[category] || "box";
  }

  private generateMenuItems(count: number): string {
    const items = [
      { name: "Signature Dish", price: "$24.99", description: "Our chef's special creation" },
      { name: "Classic Favorite", price: "$19.99", description: "Traditional recipe perfected" },
      { name: "Seasonal Special", price: "$22.99", description: "Fresh ingredients of the season" },
    ];

    return items
      .map(
        (item) => `
        <div class="bg-white p-6 rounded-lg flex justify-between items-start">
            <div class="flex-1">
                <h4 class="font-semibold text-lg mb-2">${item.name}</h4>
                <p class="text-neutral-600">${item.description}</p>
            </div>
            <span class="text-xl font-bold text-primary ml-4">${item.price}</span>
        </div>
    `
      )
      .join("");
  }
}