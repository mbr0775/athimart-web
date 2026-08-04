// config/categories.ts

export interface ProductSubcategory {
  /**
   * Must match the sub_category value stored in Supabase.
   */
  name: string;

  /**
   * SEO-friendly URL segment.
   */
  slug: string;

  /**
   * Short text used on category cards and navigation sections.
   */
  shortDescription: string;

  /**
   * Longer, unique introductory content for the subcategory page.
   */
  description: string;

  /**
   * Suggested page title without the "| AthiMart" suffix.
   */
  seoTitle: string;

  /**
   * Unique meta description for the subcategory page.
   */
  metaDescription: string;
}

export interface ProductCategory {
  /**
   * Must match the category value stored in Supabase.
   */
  name: string;

  /**
   * SEO-friendly URL segment.
   */
  slug: string;

  /**
   * Short text used on homepage and category cards.
   */
  shortDescription: string;

  /**
   * Longer, unique introductory content for the category page.
   */
  description: string;

  /**
   * Suggested page title without the "| AthiMart" suffix.
   */
  seoTitle: string;

  /**
   * Unique meta description for the category page.
   */
  metaDescription: string;

  subcategories: ProductSubcategory[];
}

export const productCategories: ProductCategory[] = [
  {
    name: "Digital Products",
    slug: "digital-products",
    shortDescription:
      "Shop mobile devices, computers, electronics and useful technology accessories.",
    description:
      "Explore digital products for communication, work, education, entertainment and everyday use. Browse mobile phones, cameras, laptops, desktop computers, displays, storage devices, networking equipment and compatible accessories available through AthiMart.",
    seoTitle: "Digital Products and Electronics Online",
    metaDescription:
      "Shop mobile phones, computers, cameras, audio products, networking devices and technology accessories through the AthiMart marketplace.",
    subcategories: [
      {
        name: "Cameras",
        slug: "cameras",
        shortDescription:
          "Cameras and photography equipment for personal and professional use.",
        description:
          "Browse cameras and photography equipment for travel, events, content creation, security and professional work. Compare product specifications, image features, compatibility and seller information before choosing a camera.",
        seoTitle: "Cameras and Photography Equipment",
        metaDescription:
          "Browse cameras and photography equipment for personal, creative and professional use through AthiMart.",
      },
      {
        name: "Mobiles",
        slug: "mobiles",
        shortDescription:
          "Mobile phones for communication, entertainment and everyday use.",
        description:
          "Explore mobile phones across different brands, storage capacities, screen sizes, camera systems and price ranges. Product pages provide specifications, availability, seller information and market-specific prices.",
        seoTitle: "Mobile Phones Online",
        metaDescription:
          "Compare mobile phones by brand, storage, camera, display, battery and price through the AthiMart marketplace.",
      },
      {
        name: "Chargers",
        slug: "chargers",
        shortDescription:
          "Charging adapters, cables and compatible charging accessories.",
        description:
          "Find wired and wireless chargers, power adapters, charging cables and compatible accessories for phones, tablets, computers and other supported electronic devices.",
        seoTitle: "Chargers and Charging Accessories",
        metaDescription:
          "Shop chargers, power adapters, charging cables and compatible mobile charging accessories through AthiMart.",
      },
      {
        name: "Power Banks",
        slug: "power-banks",
        shortDescription:
          "Portable power solutions for phones and compatible devices.",
        description:
          "Browse portable power banks with different battery capacities, charging ports, output levels and device compatibility. Compare specifications to find a suitable portable charging option.",
        seoTitle: "Power Banks and Portable Chargers",
        metaDescription:
          "Browse portable power banks and charging solutions for phones, tablets and compatible devices through AthiMart.",
      },
      {
        name: "Laptops",
        slug: "laptops",
        shortDescription:
          "Laptops for education, business, creative work and entertainment.",
        description:
          "Explore laptops for study, office work, software development, content creation, gaming and everyday computing. Compare processors, memory, storage, display specifications and other important features.",
        seoTitle: "Laptops for Work, Study and Everyday Use",
        metaDescription:
          "Compare laptops for education, business, creative work, gaming and everyday computing through AthiMart.",
      },
      {
        name: "Desktop Computers",
        slug: "desktop-computers",
        shortDescription:
          "Desktop computers for office, education, gaming and professional work.",
        description:
          "Browse desktop computers for home, education, business, gaming and professional workloads. Review processor, memory, storage, graphics and upgrade information on individual product pages.",
        seoTitle: "Desktop Computers and PCs",
        metaDescription:
          "Browse desktop computers and PCs for office work, education, gaming and professional use through AthiMart.",
      },
      {
        name: "Monitors",
        slug: "monitors",
        shortDescription:
          "Computer displays for productivity, entertainment and gaming.",
        description:
          "Explore monitors with different screen sizes, resolutions, refresh rates, panel types and connection options. Compare specifications for office work, creative projects, entertainment and gaming.",
        seoTitle: "Computer Monitors and Displays",
        metaDescription:
          "Compare computer monitors by size, resolution, refresh rate and connectivity through the AthiMart marketplace.",
      },
      {
        name: "Keyboards",
        slug: "keyboards",
        shortDescription:
          "Wired, wireless and specialised keyboards for different uses.",
        description:
          "Browse keyboards for office work, study, gaming and professional computer setups. Explore wired, wireless, compact and full-size options with different layouts and features.",
        seoTitle: "Computer Keyboards",
        metaDescription:
          "Shop wired, wireless, compact and gaming keyboards for computer setups through AthiMart.",
      },
      {
        name: "Mice",
        slug: "mice",
        shortDescription:
          "Computer mice for productivity, everyday use and gaming.",
        description:
          "Explore wired and wireless computer mice for office work, education, design, gaming and everyday navigation. Compare connectivity, sensitivity, button configuration and compatibility.",
        seoTitle: "Computer Mice and Wireless Mice",
        metaDescription:
          "Browse wired, wireless and gaming computer mice for productivity and everyday use through AthiMart.",
      },
      {
        name: "Printers",
        slug: "printers",
        shortDescription:
          "Printers and printing equipment for home and business use.",
        description:
          "Browse printers for documents, photographs, education and office work. Compare printing technologies, connectivity, supported paper sizes, running requirements and available features.",
        seoTitle: "Printers for Home and Office",
        metaDescription:
          "Browse printers and printing equipment for home, education, office and business use through AthiMart.",
      },
      {
        name: "Networking Devices",
        slug: "networking-devices",
        shortDescription:
          "Routers, switches and equipment for network connectivity.",
        description:
          "Explore networking devices for homes, offices and businesses, including routers, switches, adapters and related equipment. Review connectivity standards and compatibility before purchasing.",
        seoTitle: "Networking Devices and Equipment",
        metaDescription:
          "Shop routers, switches, adapters and networking equipment for homes and businesses through AthiMart.",
      },
      {
        name: "Storage Devices",
        slug: "storage-devices",
        shortDescription:
          "Storage products for files, backups and data transfer.",
        description:
          "Browse internal and external storage products for documents, media, backups and data transfer. Compare capacity, connection type, format and compatibility on each product page.",
        seoTitle: "Storage Devices and Data Storage",
        metaDescription:
          "Browse storage devices for files, backups, media and data transfer through the AthiMart marketplace.",
      },
      {
        name: "Computer Accessories",
        slug: "computer-accessories",
        shortDescription:
          "Practical accessories for laptops, computers and workstations.",
        description:
          "Find computer accessories designed to improve connectivity, organisation, protection and productivity. Browse compatible products for desktop computers, laptops and workstation setups.",
        seoTitle: "Computer and Laptop Accessories",
        metaDescription:
          "Shop practical computer and laptop accessories for workstations, study and everyday use through AthiMart.",
      },
      {
        name: "Mobile Accessories",
        slug: "mobile-accessories",
        shortDescription:
          "Cases, cables, holders and accessories for mobile devices.",
        description:
          "Browse mobile accessories for charging, protection, connectivity, audio and everyday convenience. Check model compatibility and product specifications before placing an order.",
        seoTitle: "Mobile Phone Accessories",
        metaDescription:
          "Shop mobile phone cases, cables, holders, adapters and compatible accessories through AthiMart.",
      },
      {
        name: "Audio Devices",
        slug: "audio-devices",
        shortDescription:
          "Headphones, speakers, microphones and personal audio products.",
        description:
          "Explore audio devices for music, calls, recording, entertainment and content creation. Compare connectivity, battery life, sound features and compatibility across available products.",
        seoTitle: "Headphones, Speakers and Audio Devices",
        metaDescription:
          "Browse headphones, speakers, microphones and other personal audio devices through AthiMart.",
      },
      {
        name: "Gaming Accessories",
        slug: "gaming-accessories",
        shortDescription:
          "Accessories for computer, console and mobile gaming setups.",
        description:
          "Browse gaming accessories designed for control, communication, comfort and performance. Explore keyboards, mice, headsets, controllers and related products for compatible gaming systems.",
        seoTitle: "Gaming Accessories and Equipment",
        metaDescription:
          "Shop gaming keyboards, mice, headsets, controllers and compatible gaming accessories through AthiMart.",
      },
    ],
  },

  {
    name: "IT Solutions",
    slug: "it-solutions",
    shortDescription:
      "Find websites, mobile applications, software and digital business services.",
    description:
      "Discover IT solutions for businesses, organisations and entrepreneurs. AthiMart connects customers with website development, mobile applications, AI software, ecommerce systems, automation, cloud services, cybersecurity and technical consultation.",
    seoTitle: "IT Solutions and Digital Services",
    metaDescription:
      "Find website development, mobile apps, AI software, automation, cloud services and IT consultation through AthiMart.",
    subcategories: [
      {
        name: "Websites",
        slug: "websites",
        shortDescription:
          "Website design and development services for organisations and businesses.",
        description:
          "Explore website design and development services for company websites, portfolios, booking platforms, educational websites and other digital projects.",
        seoTitle: "Website Design and Development Services",
        metaDescription:
          "Find website design and development services for businesses, organisations and entrepreneurs through AthiMart.",
      },
      {
        name: "Mobile Apps",
        slug: "mobile-apps",
        shortDescription:
          "Mobile application design and development services.",
        description:
          "Find mobile application services for Android, iOS and cross-platform projects. Compare provider experience, project scope, technologies and support options.",
        seoTitle: "Mobile App Development Services",
        metaDescription:
          "Discover mobile application design and development services for Android, iOS and cross-platform projects.",
      },
      {
        name: "AI Software",
        slug: "ai-software",
        shortDescription:
          "Artificial intelligence software and practical AI solutions.",
        description:
          "Explore AI software for automation, analysis, customer support, content workflows and business processes. Product and service pages explain the intended use, features and delivery model.",
        seoTitle: "AI Software and Artificial Intelligence Solutions",
        metaDescription:
          "Explore AI software, automation tools and artificial intelligence solutions available through AthiMart.",
      },
      {
        name: "SaaS Products",
        slug: "saas-products",
        shortDescription:
          "Cloud-based software products for organisations and individuals.",
        description:
          "Browse software-as-a-service products for management, collaboration, communication, reporting and specialised business operations.",
        seoTitle: "SaaS Products and Cloud Software",
        metaDescription:
          "Browse cloud-based SaaS products for management, collaboration and business operations through AthiMart.",
      },
      {
        name: "E-commerce Systems",
        slug: "ecommerce-systems",
        shortDescription:
          "Online stores and ecommerce platform development services.",
        description:
          "Explore ecommerce systems for selling products and services online. Compare storefront, payment, inventory, order-management and administration features.",
        seoTitle: "Ecommerce Website and Store Development",
        metaDescription:
          "Find ecommerce website, online store and marketplace development services through AthiMart.",
      },
      {
        name: "Business Automation",
        slug: "business-automation",
        shortDescription:
          "Technology solutions for automating repetitive business processes.",
        description:
          "Discover business automation services for workflows, reporting, customer communication, data entry, order management and other recurring activities.",
        seoTitle: "Business Automation Solutions",
        metaDescription:
          "Explore business automation services for workflows, reporting, communication and repetitive operations.",
      },
      {
        name: "Chatbots",
        slug: "chatbots",
        shortDescription:
          "Chatbot solutions for support, sales and automated communication.",
        description:
          "Browse chatbot development services for websites, messaging platforms, customer support and automated enquiries. Review integrations and supported communication channels.",
        seoTitle: "Chatbot Development Services",
        metaDescription:
          "Find chatbot development services for customer support, sales and automated business communication.",
      },
      {
        name: "CRM Systems",
        slug: "crm-systems",
        shortDescription:
          "Customer relationship management systems for organisations.",
        description:
          "Explore CRM systems for managing customer information, enquiries, sales activities, follow-ups and service relationships.",
        seoTitle: "CRM Systems and Customer Management Software",
        metaDescription:
          "Browse CRM systems for customer information, sales activity, enquiries and business follow-ups.",
      },
      {
        name: "ERP Systems",
        slug: "erp-systems",
        shortDescription:
          "Enterprise software for connected business operations.",
        description:
          "Discover ERP systems for coordinating inventory, finance, procurement, sales, human resources and other organisational processes.",
        seoTitle: "ERP Systems and Business Management Software",
        metaDescription:
          "Explore ERP systems for connected inventory, finance, procurement, sales and organisational management.",
      },
      {
        name: "POS Systems",
        slug: "pos-systems",
        shortDescription:
          "Point-of-sale systems for shops and service businesses.",
        description:
          "Browse POS systems for recording sales, managing products, printing receipts and monitoring daily business activity.",
        seoTitle: "POS Systems for Retail and Business",
        metaDescription:
          "Find point-of-sale systems for product management, sales, receipts and daily business operations.",
      },
      {
        name: "UI/UX Design",
        slug: "ui-ux-design",
        shortDescription:
          "Interface and user-experience design for digital products.",
        description:
          "Find UI and UX design services for websites, mobile applications and software products. Compare portfolio work, design scope and expected deliverables.",
        seoTitle: "UI and UX Design Services",
        metaDescription:
          "Discover user-interface and user-experience design services for websites, applications and software.",
      },
      {
        name: "Backend Development",
        slug: "backend-development",
        shortDescription:
          "Server-side development for websites, apps and software systems.",
        description:
          "Explore backend development services for databases, authentication, business logic, integrations, administration systems and scalable applications.",
        seoTitle: "Backend Development Services",
        metaDescription:
          "Find backend development services for databases, authentication, business logic and scalable applications.",
      },
      {
        name: "API Development",
        slug: "api-development",
        shortDescription:
          "API design, development and system-integration services.",
        description:
          "Browse API development services for connecting applications, payment providers, databases, third-party services and internal business systems.",
        seoTitle: "API Development and Integration Services",
        metaDescription:
          "Discover API development and integration services for applications, databases and third-party platforms.",
      },
      {
        name: "Cloud Solutions",
        slug: "cloud-solutions",
        shortDescription:
          "Cloud infrastructure, deployment and digital platform services.",
        description:
          "Explore cloud solutions for application deployment, storage, databases, backups, scaling and infrastructure management.",
        seoTitle: "Cloud Solutions and Infrastructure Services",
        metaDescription:
          "Find cloud deployment, storage, database, backup and infrastructure services through AthiMart.",
      },
      {
        name: "Hosting Services",
        slug: "hosting-services",
        shortDescription:
          "Hosting services for websites, applications and digital platforms.",
        description:
          "Browse hosting services for websites, applications, databases and business platforms. Compare resources, support, security and deployment options.",
        seoTitle: "Website and Application Hosting Services",
        metaDescription:
          "Compare hosting services for websites, applications, databases and online business platforms.",
      },
      {
        name: "Cybersecurity",
        slug: "cybersecurity",
        shortDescription:
          "Cybersecurity assessments, protection and technical support.",
        description:
          "Explore cybersecurity services for identifying risks, improving access controls, protecting systems and supporting safer digital operations.",
        seoTitle: "Cybersecurity Services and Solutions",
        metaDescription:
          "Find cybersecurity assessments, protection services and technical security solutions through AthiMart.",
      },
      {
        name: "Maintenance Services",
        slug: "maintenance-services",
        shortDescription:
          "Ongoing maintenance for websites, applications and software systems.",
        description:
          "Find maintenance services for software updates, issue resolution, monitoring, backups, performance and ongoing technical support.",
        seoTitle: "Website and Software Maintenance Services",
        metaDescription:
          "Browse ongoing website, application and software maintenance services through AthiMart.",
      },
      {
        name: "IT Consultation",
        slug: "it-consultation",
        shortDescription:
          "Professional technology planning and consultation services.",
        description:
          "Connect with technology consultants for software planning, infrastructure, digital transformation, system selection and implementation guidance.",
        seoTitle: "IT Consultation and Technology Advisory",
        metaDescription:
          "Find IT consultation for software planning, digital transformation, infrastructure and system implementation.",
      },
    ],
  },

  {
    name: "AI Gadgets",
    slug: "ai-gadgets",
    shortDescription:
      "Discover smart wearables, connected devices and AI-enabled technology.",
    description:
      "Explore AI gadgets designed for communication, automation, monitoring, security, productivity and entertainment. Browse smart watches, smart glasses, intelligent cameras, robotics, wearables and connected home products.",
    seoTitle: "AI Gadgets and Smart Devices",
    metaDescription:
      "Shop smart watches, AI cameras, wearables, robotics, smart-home products and other AI gadgets through AthiMart.",
    subcategories: [
      {
        name: "Smart Watches",
        slug: "smart-watches",
        shortDescription:
          "Connected watches for notifications, activity tracking and daily use.",
        description:
          "Browse smart watches with communication, notification, activity and connected-device features. Compare display, battery, compatibility, sensors and available functions.",
        seoTitle: "Smart Watches and Wearable Technology",
        metaDescription:
          "Compare smart watches by display, battery, compatibility, activity features and available functions through AthiMart.",
      },
      {
        name: "Smart Glasses",
        slug: "smart-glasses",
        shortDescription:
          "Wearable glasses with connected and intelligent features.",
        description:
          "Explore smart glasses designed for connected experiences, audio, information access, photography or other wearable technology functions.",
        seoTitle: "Smart Glasses and Connected Eyewear",
        metaDescription:
          "Browse smart glasses and connected wearable eyewear with intelligent technology features through AthiMart.",
      },
      {
        name: "Smart Speakers",
        slug: "smart-speakers",
        shortDescription:
          "Connected speakers with voice and smart-device features.",
        description:
          "Find smart speakers for audio playback, voice interaction and compatible connected-home functions. Review connectivity and supported ecosystems.",
        seoTitle: "Smart Speakers and Voice Devices",
        metaDescription:
          "Shop smart speakers with audio, voice and connected-home features through the AthiMart marketplace.",
      },
      {
        name: "AI Cameras",
        slug: "ai-cameras",
        shortDescription:
          "Intelligent cameras for monitoring, security and content creation.",
        description:
          "Browse AI-enabled cameras for security, monitoring, photography and video. Compare detection features, connectivity, recording options and supported applications.",
        seoTitle: "AI Cameras and Intelligent Security Cameras",
        metaDescription:
          "Browse AI cameras for monitoring, security, photography and video through AthiMart.",
      },
      {
        name: "Robotics",
        slug: "robotics",
        shortDescription:
          "Consumer robots, educational robotics and automated devices.",
        description:
          "Explore robotics products for education, entertainment, home use and experimentation. Review intended use, controls, compatibility and product capabilities.",
        seoTitle: "Robotics and Automated Devices",
        metaDescription:
          "Discover consumer robots, educational robotics and automated devices through AthiMart.",
      },
      {
        name: "Smart Home Devices",
        slug: "smart-home-devices",
        shortDescription:
          "Connected technology for home automation and convenience.",
        description:
          "Browse smart-home devices for lighting, monitoring, security, energy management and everyday automation. Check compatibility with supported platforms before purchasing.",
        seoTitle: "Smart Home Devices and Home Automation",
        metaDescription:
          "Shop connected smart-home products for automation, lighting, monitoring and security through AthiMart.",
      },
      {
        name: "Wearables",
        slug: "wearables",
        shortDescription:
          "Wearable technology for communication, activity and productivity.",
        description:
          "Explore wearable devices for connected communication, activity tracking, productivity and everyday technology use.",
        seoTitle: "Wearable Technology and Connected Devices",
        metaDescription:
          "Browse wearable technology for communication, activity tracking and everyday connected use through AthiMart.",
      },
      {
        name: "Drones",
        slug: "drones",
        shortDescription:
          "Drones and accessories for photography, video and recreation.",
        description:
          "Browse drones for photography, videography, recreation and other permitted uses. Compare flight time, camera features, control range and included accessories.",
        seoTitle: "Drones and Drone Accessories",
        metaDescription:
          "Compare drones and compatible accessories for photography, video and recreation through AthiMart.",
      },
      {
        name: "Security Devices",
        slug: "security-devices",
        shortDescription:
          "Smart security products for homes, businesses and personal use.",
        description:
          "Explore security devices for monitoring, access control, alerts and connected protection. Review installation, compatibility and supported features.",
        seoTitle: "Smart Security Devices",
        metaDescription:
          "Browse smart security devices for homes, businesses, monitoring and access control through AthiMart.",
      },
    ],
  },

  {
    name: "Fitness Tech",
    slug: "fitness-tech",
    shortDescription:
      "Shop fitness trackers, workout equipment and recovery technology.",
    description:
      "Discover fitness technology for monitoring activity, supporting workouts and improving recovery routines. Browse fitness trackers, smart scales, gym equipment, massage devices, yoga accessories and sports watches.",
    seoTitle: "Fitness Technology and Workout Equipment",
    metaDescription:
      "Shop fitness trackers, smart scales, gym equipment, sports watches and recovery devices through AthiMart.",
    subcategories: [
      {
        name: "Fitness Trackers",
        slug: "fitness-trackers",
        shortDescription:
          "Wearable devices for activity, movement and workout tracking.",
        description:
          "Browse fitness trackers for recording movement, workouts and selected daily activity metrics. Compare compatibility, display, battery and tracking features.",
        seoTitle: "Fitness Trackers and Activity Bands",
        metaDescription:
          "Compare fitness trackers and activity bands by display, battery, compatibility and tracking features.",
      },
      {
        name: "Gym Equipment",
        slug: "gym-equipment",
        shortDescription:
          "Equipment and accessories for home and gym training.",
        description:
          "Explore gym equipment for strength, cardio, mobility and general training. Check dimensions, materials, weight capacity and intended use on each product page.",
        seoTitle: "Gym Equipment and Workout Accessories",
        metaDescription:
          "Browse gym equipment and workout accessories for strength, cardio and home training through AthiMart.",
      },
      {
        name: "Smart Scales",
        slug: "smart-scales",
        shortDescription:
          "Connected scales for measuring and tracking body metrics.",
        description:
          "Browse smart scales with connected applications and supported body-measurement features. Compare platform compatibility, user support and available measurements.",
        seoTitle: "Smart Scales and Connected Body Scales",
        metaDescription:
          "Compare smart scales with connected applications and body-measurement features through AthiMart.",
      },
      {
        name: "Massage Devices",
        slug: "massage-devices",
        shortDescription:
          "Massage products for relaxation and post-workout routines.",
        description:
          "Explore massage devices for relaxation and post-workout use. Review operating modes, attachments, power source and intended application before purchasing.",
        seoTitle: "Massage Devices and Recovery Equipment",
        metaDescription:
          "Browse massage devices and recovery equipment for relaxation and post-workout routines through AthiMart.",
      },
      {
        name: "Yoga Accessories",
        slug: "yoga-accessories",
        shortDescription:
          "Mats and accessories for yoga, stretching and mobility.",
        description:
          "Find yoga accessories for stretching, mobility, balance and home practice. Browse mats, supports and compatible training products.",
        seoTitle: "Yoga Accessories and Exercise Mats",
        metaDescription:
          "Shop yoga mats and accessories for stretching, mobility, balance and home practice through AthiMart.",
      },
      {
        name: "Sports Watches",
        slug: "sports-watches",
        shortDescription:
          "Watches designed for sport, outdoor and activity tracking.",
        description:
          "Explore sports watches for training, outdoor activities and selected performance tracking. Compare durability, battery, connectivity and supported activity modes.",
        seoTitle: "Sports Watches and Activity Watches",
        metaDescription:
          "Compare sports watches for training, outdoor activities and performance tracking through AthiMart.",
      },
      {
        name: "Recovery Devices",
        slug: "recovery-devices",
        shortDescription:
          "Technology products designed for rest and workout recovery.",
        description:
          "Browse recovery devices designed to support relaxation and post-exercise routines. Review intended use, available modes and operating instructions.",
        seoTitle: "Fitness Recovery Devices",
        metaDescription:
          "Browse fitness recovery devices for relaxation and post-workout routines through AthiMart.",
      },
    ],
  },

  {
    name: "Natural Essences",
    slug: "natural-essences",
    shortDescription:
      "Explore essential oils, oud, incense and fragrance products.",
    description:
      "Browse natural essences and fragrance products for personal use, gifting, atmosphere and aromatherapy. Discover essential oils, perfume oils, oud products, incense, bakhoor, diffusers and luxury fragrance gifts.",
    seoTitle: "Natural Essences, Oud and Fragrance Products",
    metaDescription:
      "Shop essential oils, perfume oils, oud, incense, bakhoor, diffusers and fragrance gifts through AthiMart.",
    subcategories: [
      {
        name: "Essential Oils",
        slug: "essential-oils",
        shortDescription:
          "Concentrated aromatic oils for fragrance and aromatherapy.",
        description:
          "Browse essential oils with different botanical sources, fragrance profiles and suggested uses. Product pages should clearly state ingredients, quantity and usage information.",
        seoTitle: "Essential Oils and Aromatic Oils",
        metaDescription:
          "Browse essential oils with different botanical sources, fragrance profiles and product sizes through AthiMart.",
      },
      {
        name: "Perfume Oils",
        slug: "perfume-oils",
        shortDescription:
          "Concentrated perfume oils in a range of fragrance styles.",
        description:
          "Explore concentrated perfume oils with floral, woody, fresh, spicy and traditional fragrance profiles. Compare quantity, notes, concentration and application information.",
        seoTitle: "Perfume Oils and Concentrated Fragrances",
        metaDescription:
          "Shop concentrated perfume oils in floral, woody, fresh, spicy and traditional fragrance profiles.",
      },
      {
        name: "Diffusers",
        slug: "diffusers",
        shortDescription:
          "Fragrance and essential-oil diffusers for indoor spaces.",
        description:
          "Browse diffusers for distributing fragrance in homes, workplaces and other indoor environments. Compare size, operating method and compatible fragrance products.",
        seoTitle: "Essential Oil and Fragrance Diffusers",
        metaDescription:
          "Browse fragrance and essential-oil diffusers for homes, workplaces and indoor spaces through AthiMart.",
      },
      {
        name: "Aromatherapy",
        slug: "aromatherapy",
        shortDescription:
          "Aromatic products for atmosphere and relaxation routines.",
        description:
          "Explore aromatherapy products for personal routines and indoor atmosphere. Review ingredients, product form, fragrance profile and safe-use information.",
        seoTitle: "Aromatherapy Products",
        metaDescription:
          "Explore aromatic oils, fragrance products and accessories for aromatherapy routines through AthiMart.",
      },
      {
        name: "Natural Extracts",
        slug: "natural-extracts",
        shortDescription:
          "Natural extracts and aromatic botanical products.",
        description:
          "Browse natural extracts and botanical products with clearly described sources, quantities, ingredients and intended applications.",
        seoTitle: "Natural Extracts and Botanical Products",
        metaDescription:
          "Browse natural extracts and aromatic botanical products with clear ingredient and product information.",
      },
      {
        name: "Spa Products",
        slug: "spa-products",
        shortDescription:
          "Fragrance and personal-care products for spa-style routines.",
        description:
          "Explore spa products for personal care, fragrance and relaxation routines. Product pages provide ingredient, quantity and usage information where available.",
        seoTitle: "Spa and Relaxation Products",
        metaDescription:
          "Browse spa products for personal care, fragrance and relaxation routines through AthiMart.",
      },
      {
        name: "Agarwood Products",
        slug: "agarwood-products",
        shortDescription:
          "Agarwood fragrance products and traditional aromatic items.",
        description:
          "Explore agarwood products with distinctive woody fragrance characteristics. Compare product form, origin information, quantity and seller descriptions.",
        seoTitle: "Agarwood Products and Fragrances",
        metaDescription:
          "Explore agarwood products and traditional woody fragrance items through AthiMart.",
      },
      {
        name: "Agarwood Oil",
        slug: "agarwood-oil",
        shortDescription:
          "Concentrated agarwood oils with rich fragrance profiles.",
        description:
          "Browse agarwood oil products with clearly described quantity, concentration, fragrance profile and origin information where available.",
        seoTitle: "Agarwood Oil and Oud Oil",
        metaDescription:
          "Browse agarwood oil and oud oil products with quantity, fragrance and seller information through AthiMart.",
      },
      {
        name: "Oud Perfume",
        slug: "oud-perfume",
        shortDescription:
          "Oud-based perfumes and concentrated fragrance products.",
        description:
          "Explore oud perfumes with woody, warm, smoky, sweet and traditional fragrance profiles. Compare fragrance notes, size and concentration.",
        seoTitle: "Oud Perfume and Oud Fragrances",
        metaDescription:
          "Shop oud perfumes and concentrated oud fragrances in a variety of scent profiles through AthiMart.",
      },
      {
        name: "Incense",
        slug: "incense",
        shortDescription:
          "Incense products for fragrance, atmosphere and traditional use.",
        description:
          "Browse incense products in different forms and fragrance profiles. Product pages describe quantity, ingredients and usage information where available.",
        seoTitle: "Incense and Home Fragrance Products",
        metaDescription:
          "Browse incense products for home fragrance, atmosphere and traditional use through AthiMart.",
      },
      {
        name: "Bakhoor",
        slug: "bakhoor",
        shortDescription:
          "Bakhoor fragrance products for homes and gatherings.",
        description:
          "Explore bakhoor blends with woody, floral, spicy and traditional fragrance profiles. Compare quantity, ingredients and recommended burning method.",
        seoTitle: "Bakhoor and Traditional Home Fragrance",
        metaDescription:
          "Shop bakhoor fragrance products for homes, gatherings and traditional aromatic use through AthiMart.",
      },
      {
        name: "Luxury Gifts",
        slug: "luxury-gifts",
        shortDescription:
          "Premium fragrance and essence products suitable for gifting.",
        description:
          "Browse premium fragrance collections, oud products, oils, incense and presentation sets suitable for celebrations and thoughtful gifts.",
        seoTitle: "Luxury Fragrance Gifts",
        metaDescription:
          "Browse premium fragrance, oud, perfume oil and incense gift products through AthiMart.",
      },
    ],
  },

  {
    name: "Fashion",
    slug: "fashion",
    shortDescription:
      "Shop clothing, footwear, bags, watches and fashion accessories.",
    description:
      "Explore fashion and lifestyle products for different styles, occasions and everyday needs. Browse men’s clothing, women’s clothing, shoes, bags, watches, jewellery and accessories from AthiMart sellers.",
    seoTitle: "Fashion, Clothing and Accessories Online",
    metaDescription:
      "Shop clothing, footwear, bags, watches, jewellery and fashion accessories through the AthiMart marketplace.",
    subcategories: [
      {
        name: "Men Clothing",
        slug: "men-clothing",
        shortDescription:
          "Clothing and everyday fashion products for men.",
        description:
          "Browse men’s clothing for casual, formal, traditional and everyday use. Product pages provide size, material, colour and care information where available.",
        seoTitle: "Men’s Clothing and Fashion",
        metaDescription:
          "Browse men’s clothing for casual, formal, traditional and everyday use through AthiMart.",
      },
      {
        name: "Women Clothing",
        slug: "women-clothing",
        shortDescription:
          "Clothing and fashion products for women.",
        description:
          "Explore women’s clothing for different styles, occasions and everyday wear. Review size, material, colour, fit and care information on each product page.",
        seoTitle: "Women’s Clothing and Fashion",
        metaDescription:
          "Shop women’s clothing for different styles, occasions and everyday wear through AthiMart.",
      },
      {
        name: "Shoes",
        slug: "shoes",
        shortDescription:
          "Footwear for casual, formal and active use.",
        description:
          "Browse shoes for casual wear, work, formal occasions, sport and everyday use. Compare available sizes, colours, materials and design details.",
        seoTitle: "Shoes and Footwear Online",
        metaDescription:
          "Browse casual, formal, sports and everyday footwear in available sizes and styles through AthiMart.",
      },
      {
        name: "Bags",
        slug: "bags",
        shortDescription:
          "Handbags, backpacks, travel bags and everyday bags.",
        description:
          "Explore bags for work, school, travel, shopping and everyday carrying. Review dimensions, compartments, materials, closures and available colours.",
        seoTitle: "Bags, Backpacks and Handbags",
        metaDescription:
          "Shop handbags, backpacks, travel bags and everyday carrying products through AthiMart.",
      },
      {
        name: "Watches",
        slug: "watches",
        shortDescription:
          "Watches for everyday, formal and lifestyle use.",
        description:
          "Browse watches in casual, formal, classic and modern designs. Compare movement, materials, dimensions, water-resistance information and available styles.",
        seoTitle: "Watches and Lifestyle Timepieces",
        metaDescription:
          "Browse watches for everyday, formal and lifestyle use through the AthiMart marketplace.",
      },
      {
        name: "Jewelry",
        slug: "jewelry",
        shortDescription:
          "Jewellery and decorative accessories for different occasions.",
        description:
          "Explore jewellery and decorative accessories in different designs, materials and styles. Product pages should clearly describe dimensions, materials and care guidance.",
        seoTitle: "Jewelry and Fashion Accessories",
        metaDescription:
          "Browse jewellery and decorative fashion accessories in different styles and materials through AthiMart.",
      },
      {
        name: "Accessories",
        slug: "accessories",
        shortDescription:
          "Fashion accessories that complement clothing and personal style.",
        description:
          "Find fashion accessories for everyday use, events, gifting and personal styling. Review material, size, colour and product-care information.",
        seoTitle: "Fashion Accessories Online",
        metaDescription:
          "Shop fashion accessories for everyday use, special occasions and personal styling through AthiMart.",
      },
    ],
  },

  {
    name: "Vehicles",
    slug: "vehicles",
    shortDescription:
      "Browse vehicles, vehicle parts, accessories and related services.",
    description:
      "Explore vehicle listings, motorbikes, bicycles, parts, accessories and related services available through AthiMart where permitted for the selected customer market.",
    seoTitle: "Vehicles, Parts and Accessories",
    metaDescription:
      "Browse cars, motorbikes, bicycles, vehicle parts, accessories and related services through AthiMart.",
    subcategories: [
      {
        name: "Cars",
        slug: "cars",
        shortDescription:
          "Car listings with vehicle and seller information.",
        description:
          "Browse car listings with details such as make, model, year, condition, mileage, transmission, fuel type, location and seller information where supplied.",
        seoTitle: "Cars for Sale and Vehicle Listings",
        metaDescription:
          "Browse car listings with make, model, condition, location and seller information through AthiMart.",
      },
      {
        name: "Motorbikes",
        slug: "motorbikes",
        shortDescription:
          "Motorbike listings and related products.",
        description:
          "Explore motorbike listings with make, model, condition, engine, mileage, location and seller details where available.",
        seoTitle: "Motorbikes and Motorcycle Listings",
        metaDescription:
          "Browse motorbike listings with model, condition, mileage, location and seller information through AthiMart.",
      },
      {
        name: "Bicycles",
        slug: "bicycles",
        shortDescription:
          "Bicycles for commuting, recreation and fitness.",
        description:
          "Browse bicycles for commuting, recreation, sport and fitness. Compare frame size, wheel size, gearing, materials and intended use.",
        seoTitle: "Bicycles for Commuting and Recreation",
        metaDescription:
          "Browse bicycles for commuting, recreation, sport and fitness through AthiMart.",
      },
      {
        name: "Vehicle Parts",
        slug: "vehicle-parts",
        shortDescription:
          "Replacement and maintenance parts for compatible vehicles.",
        description:
          "Find vehicle parts for repair, replacement and routine maintenance. Product pages should clearly identify supported makes, models, years and part numbers.",
        seoTitle: "Vehicle Parts and Replacement Components",
        metaDescription:
          "Browse replacement and maintenance parts for compatible cars and motorbikes through AthiMart.",
      },
      {
        name: "Vehicle Accessories",
        slug: "vehicle-accessories",
        shortDescription:
          "Accessories for vehicle comfort, protection and convenience.",
        description:
          "Browse accessories for vehicle interiors, exteriors, organisation, protection, entertainment and everyday convenience.",
        seoTitle: "Vehicle Accessories",
        metaDescription:
          "Shop vehicle accessories for comfort, organisation, protection and convenience through AthiMart.",
      },
      {
        name: "Services",
        slug: "services",
        shortDescription:
          "Maintenance and other services related to vehicles.",
        description:
          "Discover vehicle-related services for inspection, maintenance, repair, cleaning and other permitted needs. Service pages should clearly state coverage, location and terms.",
        seoTitle: "Vehicle Services",
        metaDescription:
          "Discover vehicle maintenance, inspection, repair and related services available through AthiMart.",
      },
    ],
  },

  {
    name: "Real Estate",
    slug: "real-estate",
    shortDescription:
      "Explore houses, apartments, land, rentals and commercial properties.",
    description:
      "Browse property listings and real-estate services, including houses, apartments, land, commercial property and rentals where available for the selected AthiMart market.",
    seoTitle: "Property and Real Estate Listings",
    metaDescription:
      "Browse houses, apartments, land, commercial property, rentals and property services through AthiMart.",
    subcategories: [
      {
        name: "Houses",
        slug: "houses",
        shortDescription:
          "Houses listed for sale, rent or other available arrangements.",
        description:
          "Browse house listings with location, property type, bedrooms, bathrooms, land size, floor area, condition and seller or agent information where supplied.",
        seoTitle: "Houses and Residential Property Listings",
        metaDescription:
          "Browse house listings with location, size, rooms, condition and seller information through AthiMart.",
      },
      {
        name: "Apartments",
        slug: "apartments",
        shortDescription:
          "Apartment listings with location and property details.",
        description:
          "Explore apartment listings with details such as location, floor area, bedrooms, bathrooms, facilities, condition and availability.",
        seoTitle: "Apartments and Apartment Listings",
        metaDescription:
          "Browse apartment listings with location, size, rooms, facilities and availability through AthiMart.",
      },
      {
        name: "Land",
        slug: "land",
        shortDescription:
          "Land listings for residential, agricultural and commercial purposes.",
        description:
          "Browse land listings with location, extent, access, intended use, services and ownership information where provided by the seller.",
        seoTitle: "Land and Property Listings",
        metaDescription:
          "Browse land listings for residential, agricultural and commercial purposes through AthiMart.",
      },
      {
        name: "Commercial Property",
        slug: "commercial-property",
        shortDescription:
          "Shops, offices and other commercial property listings.",
        description:
          "Explore commercial properties for retail, office, hospitality, storage and other business uses. Compare location, floor area, facilities and listing terms.",
        seoTitle: "Commercial Property Listings",
        metaDescription:
          "Browse shops, offices and commercial properties with location, size and listing information through AthiMart.",
      },
      {
        name: "Rentals",
        slug: "rentals",
        shortDescription:
          "Residential and commercial properties available for rent.",
        description:
          "Find rental listings for houses, apartments, rooms and commercial spaces. Review rental period, deposit, location, facilities and listing conditions.",
        seoTitle: "Property Rentals",
        metaDescription:
          "Browse houses, apartments, rooms and commercial spaces available for rent through AthiMart.",
      },
      {
        name: "Property Services",
        slug: "property-services",
        shortDescription:
          "Services related to property management and transactions.",
        description:
          "Discover property-related services such as management, maintenance, consultation, valuation and other permitted professional support.",
        seoTitle: "Property and Real Estate Services",
        metaDescription:
          "Find property management, maintenance, consultation and other real-estate services through AthiMart.",
      },
    ],
  },
];

/**
 * Find a category using its SEO URL slug.
 */
export function getCategoryBySlug(
  categorySlug: string
): ProductCategory | undefined {
  return productCategories.find(
    (category) => category.slug === categorySlug
  );
}

/**
 * Find a category using the exact category name stored in Supabase.
 */
export function getCategoryByName(
  categoryName: string
): ProductCategory | undefined {
  const normalizedName = categoryName.trim().toLowerCase();

  return productCategories.find(
    (category) => category.name.toLowerCase() === normalizedName
  );
}

/**
 * Find a subcategory using its category slug and subcategory slug.
 */
export function getSubcategoryBySlug(
  categorySlug: string,
  subcategorySlug: string
): ProductSubcategory | undefined {
  const category = getCategoryBySlug(categorySlug);

  return category?.subcategories.find(
    (subcategory) => subcategory.slug === subcategorySlug
  );
}

/**
 * Find a subcategory using the exact category and subcategory names
 * stored in Supabase.
 */
export function getSubcategoryByName(
  categoryName: string,
  subcategoryName: string
): ProductSubcategory | undefined {
  const category = getCategoryByName(categoryName);

  if (!category) {
    return undefined;
  }

  const normalizedSubcategoryName = subcategoryName
    .trim()
    .toLowerCase();

  return category.subcategories.find(
    (subcategory) =>
      subcategory.name.toLowerCase() === normalizedSubcategoryName
  );
}

/**
 * Create the canonical category URL.
 */
export function getCategoryPath(categorySlug: string): string {
  return `/category/${categorySlug}`;
}

/**
 * Create the canonical subcategory URL.
 */
export function getSubcategoryPath(
  categorySlug: string,
  subcategorySlug: string
): string {
  return `/category/${categorySlug}/${subcategorySlug}`;
}

/**
 * Parameters for:
 * app/(store)/category/[categorySlug]/page.tsx
 */
export function getCategoryStaticParams(): {
  categorySlug: string;
}[] {
  return productCategories.map((category) => ({
    categorySlug: category.slug,
  }));
}

/**
 * Parameters for:
 * app/(store)/category/[categorySlug]/[subcategorySlug]/page.tsx
 */
export function getSubcategoryStaticParams(): {
  categorySlug: string;
  subcategorySlug: string;
}[] {
  return productCategories.flatMap((category) =>
    category.subcategories.map((subcategory) => ({
      categorySlug: category.slug,
      subcategorySlug: subcategory.slug,
    }))
  );
}