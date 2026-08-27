export const MASTER_CMS_SECTIONS = [
  // 1. SITE-WIDE
  {
    sectionKey: 'sitewide.announcement',
    page: 'SITE-WIDE',
    title: 'Top Announcement Bar',
    subtitle: 'Global promo ticker, shipping thresholds, and coupon code highlights.',
    fieldsSchema: [
      { name: 'marqueeText', label: 'Announcement Banner Copy', type: 'text', helperText: 'e.g. Free shipping on all Gujarat farm orders above ₹499 • Use code WELCOME10 for 10% OFF!' },
      { name: 'buttonText', label: 'Action Button Label', type: 'text' },
      { name: 'buttonLink', label: 'Target URL Link', type: 'text' }
    ],
    defaultFields: {
      marqueeText: '🚚 Free shipping on all Gujarat farm orders above ₹499 • Use code WELCOME10 for 10% OFF!',
      buttonText: 'Order Now',
      buttonLink: '/shop'
    },
    fields: {
      marqueeText: '🚚 Free shipping on all Gujarat farm orders above ₹499 • Use code WELCOME10 for 10% OFF!',
      buttonText: 'Order Now',
      buttonLink: '/shop'
    },
    isEdited: false
  },
  {
    sectionKey: 'sitewide.header',
    page: 'SITE-WIDE',
    title: 'Navbar Brand, Logo & Menu Links',
    subtitle: 'Storefront logo, contact support phone, and top navigation menu links.',
    fieldsSchema: [
      { name: 'logoImage', label: 'Navbar Logo URL or Base64 (Optional)', type: 'image', helperText: 'Leave empty to use official high-res Nuva logo' },
      { name: 'brandName', label: 'Brand Name', type: 'text' },
      { name: 'brandSubtext', label: 'Brand Subtext', type: 'text' },
      { name: 'supportPhone', label: 'Support Hotline', type: 'text' },
      { name: 'navHome', label: 'Menu Link 1: Home', type: 'text' },
      { name: 'navAbout', label: 'Menu Link 2: About Dropdown', type: 'text' },
      { name: 'navBlog', label: 'Menu Link 3: Blog', type: 'text' },
      { name: 'navProducts', label: 'Menu Link 4: Products Dropdown', type: 'text' },
      { name: 'navContact', label: 'Menu Link 5: Contact Us', type: 'text' }
    ],
    defaultFields: {
      logoImage: '',
      brandName: 'Nuva',
      brandSubtext: 'NUTRITION',
      supportPhone: '+91 92277 25359',
      navHome: 'Home',
      navAbout: 'About',
      navBlog: 'Blog',
      navProducts: 'Products',
      navContact: 'Contact us'
    },
    fields: {
      logoImage: '',
      brandName: 'Nuva',
      brandSubtext: 'NUTRITION',
      supportPhone: '+91 92277 25359',
      navHome: 'Home',
      navAbout: 'About',
      navBlog: 'Blog',
      navProducts: 'Products',
      navContact: 'Contact us'
    },
    isEdited: false
  },

  // 2. HOME PAGE
  {
    sectionKey: 'home.hero',
    page: 'HOME PAGE',
    title: 'Hero Category Pills & Bestsellers',
    subtitle: 'Bestsellers badge tag, main headline, description paragraph, and category pills.',
    fieldsSchema: [
      { name: 'badgeTag', label: 'Top Badge Tag Text', type: 'text', helperText: 'e.g. HANDPICKED & MOST LOVED' },
      { name: 'headlineLine1', label: 'Headline Main Text', type: 'text', helperText: 'e.g. Nuva Bestsellers' },
      { name: 'subtitleParagraph', label: 'Subtitle Description Paragraph', type: 'textarea', helperText: 'e.g. 100% Certified Chemical-Free staples directly harvested...' },
      {
        name: 'categoryItems',
        label: '6 Hero Category Icons & Links',
        type: 'repeatable-group',
        subFields: [
          { name: 'title', label: 'Category Title', type: 'text' },
          { name: 'image', label: 'Illustration / Icon URL or Base64', type: 'text' },
          { name: 'link', label: 'Category Shop Link', type: 'text' }
        ]
      },
      {
        name: 'statisticCounters',
        label: 'Statistic Counters (4)',
        type: 'repeatable-group',
        subFields: [
          { name: 'number', label: 'Statistic Number', type: 'text' },
          { name: 'caption', label: 'Caption', type: 'text' }
        ]
      }
    ],
    defaultFields: {
      badgeTag: 'HANDPICKED & MOST LOVED',
      headlineLine1: 'Nuva Bestsellers',
      subtitleParagraph: '100% Certified Chemical-Free staples directly harvested from our verified chemical-free partner farms.',
      categoryItems: [
        { title: 'Fresh Produce', image: '', link: '/shop?category=Fresh%20Produce' },
        { title: 'Pulses & Lentils', image: '', link: '/shop?category=Pulses%20%26%20Lentils' },
        { title: 'Grains & Staples', image: '', link: '/shop?category=Grains%20%26%20Staples' },
        { title: 'Spices & Seasonings', image: '', link: '/shop?category=Spices%20%26%20Seasonings' },
        { title: 'Oils & Ghee', image: '', link: '/shop?category=Oils%20%26%20Ghee' },
        { title: 'Healthy Sweeteners', image: '', link: '/shop?category=Healthy%20Sweeteners' }
      ],
      statisticCounters: [
        { number: '60+', caption: 'Partner Gujarat Farms' },
        { number: '99.9%', caption: 'Residue & Pathogens Eliminated' },
        { number: '12-Hr', caption: 'Sunrise Harvest to Delivery' },
        { number: '12,400+', caption: 'Delighted Healthy Families' }
      ]
    },
    fields: {
      badgeTag: 'HANDPICKED & MOST LOVED',
      headlineLine1: 'Nuva Bestsellers',
      subtitleParagraph: '100% Certified Chemical-Free staples directly harvested from our verified chemical-free partner farms.',
      categoryItems: [
        { title: 'Fresh Produce', image: '', link: '/shop?category=Fresh%20Produce' },
        { title: 'Pulses & Lentils', image: '', link: '/shop?category=Pulses%20%26%20Lentils' },
        { title: 'Grains & Staples', image: '', link: '/shop?category=Grains%20%26%20Staples' },
        { title: 'Spices & Seasonings', image: '', link: '/shop?category=Spices%20%26%20Seasonings' },
        { title: 'Oils & Ghee', image: '', link: '/shop?category=Oils%20%26%20Ghee' },
        { title: 'Healthy Sweeteners', image: '', link: '/shop?category=Healthy%20Sweeteners' }
      ],
      statisticCounters: [
        { number: '60+', caption: 'Partner Gujarat Farms' },
        { number: '99.9%', caption: 'Residue & Pathogens Eliminated' },
        { number: '12-Hr', caption: 'Sunrise Harvest to Delivery' },
        { number: '12,400+', caption: 'Delighted Healthy Families' }
      ]
    },
    isEdited: false
  },
  {
    sectionKey: 'home.purity',
    page: 'HOME PAGE',
    title: 'Where Purity Grows Section',
    subtitle: 'Top headline, full-width soil background image, and cleanliness statement.',
    fieldsSchema: [
      { name: 'topHeadline', label: 'Top Bold Headline', type: 'textarea' },
      { name: 'sectionTitle', label: 'Centered Box Title', type: 'text' },
      { name: 'bodyText', label: 'Purity Commitment Body Text', type: 'textarea' },
      { name: 'footerTagline', label: 'Footer Tagline', type: 'text' },
      { name: 'bgImage', label: 'Soil Background Image URL or Base64 (leave empty for default)', type: 'image' }
    ],
    defaultFields: {
      topHeadline: "Proud to be India's 2nd to introduce Ozone -Wash freshness where purity meets innovation.",
      sectionTitle: 'Where Purity Grows',
      bodyText: 'At The Nuva, we don’t just supply produce we supply trust. We begin from the ground level, where we collaborate with local farms and international growers to source the best of Indian and exotic fruits and vegetables. The Nuva each fruit and vegetable are ozone-washed and a guarantees of cleanliness, freshness, and peace of mind.',
      footerTagline: 'Because health begins at home. And home begins with what you eat.',
      bgImage: ''
    },
    fields: {
      topHeadline: "Proud to be India's 2nd to introduce Ozone -Wash freshness where purity meets innovation.",
      sectionTitle: 'Where Purity Grows',
      bodyText: 'At The Nuva, we don’t just supply produce we supply trust. We begin from the ground level, where we collaborate with local farms and international growers to source the best of Indian and exotic fruits and vegetables. The Nuva each fruit and vegetable are ozone-washed and a guarantees of cleanliness, freshness, and peace of mind.',
      footerTagline: 'Because health begins at home. And home begins with what you eat.',
      bgImage: ''
    },
    isEdited: false
  },
  {
    sectionKey: 'home.farmers',
    page: 'HOME PAGE',
    title: 'Farmers Problem Solvers Section',
    subtitle: 'Tagline, uppercase heading, organic way of life paragraph, and farmer illustration.',
    fieldsSchema: [
      { name: 'smallTag', label: 'Small Category Tag', type: 'text' },
      { name: 'mainHeadline', label: 'Main Uppercase Headline', type: 'textarea' },
      { name: 'paragraphCopy', label: 'Paragraph Description', type: 'textarea' },
      { name: 'farmerIllustration', label: 'Farmer Artwork Image URL or Base64 (leave empty for default hand-drawn artwork)', type: 'image' }
    ],
    defaultFields: {
      smallTag: 'OUR WAY OF LIFE',
      mainHeadline: 'FARMERS ARE PROFESSIONAL PROBLEM SOLVERS',
      paragraphCopy: 'Organic Farming isn’t a type of farming but a way of life. Besides being workers of the soil, farmers believe in community strength and rely on the natural interconnection of species!',
      farmerIllustration: ''
    },
    fields: {
      smallTag: 'OUR WAY OF LIFE',
      mainHeadline: 'FARMERS ARE PROFESSIONAL PROBLEM SOLVERS',
      paragraphCopy: 'Organic Farming isn’t a type of farming but a way of life. Besides being workers of the soil, farmers believe in community strength and rely on the natural interconnection of species!',
      farmerIllustration: ''
    },
    isEdited: false
  },
  {
    sectionKey: 'home.regenerative',
    page: 'HOME PAGE',
    title: 'Regenerative Farming (4 Pillars)',
    subtitle: 'Section title and 4 illustrated sustainable agriculture pillars with icons and titles.',
    fieldsSchema: [
      { name: 'sectionTitle', label: 'Section Title', type: 'text' },
      {
        name: 'pillars',
        label: '4 Regenerative Farming Pillars',
        type: 'repeatable-group',
        subFields: [
          { name: 'title', label: 'Pillar Title', type: 'text' },
          { name: 'image', label: 'Icon / Illustration URL or Base64 (leave empty for default)', type: 'text' }
        ]
      }
    ],
    defaultFields: {
      sectionTitle: 'Regenerative Farming',
      pillars: [
        { title: 'Farm To Fork', image: '' },
        { title: 'Ozone Washed', image: '' },
        { title: 'Sustainable Packing', image: '' },
        { title: '100% Fresh', image: '' }
      ]
    },
    fields: {
      sectionTitle: 'Regenerative Farming',
      pillars: [
        { title: 'Farm To Fork', image: '' },
        { title: 'Ozone Washed', image: '' },
        { title: 'Sustainable Packing', image: '' },
        { title: '100% Fresh', image: '' }
      ]
    },
    isEdited: false
  },
  {
    sectionKey: 'home.video',
    page: 'HOME PAGE',
    title: 'Showcase Video Player',
    subtitle: 'Full-width cinematic showcase YouTube or MP4 video URL, poster thumbnail, and subtitles.',
    fieldsSchema: [
      { name: 'videoUrl', label: 'YouTube Embed/Watch URL or Video Source URL', type: 'video', helperText: 'e.g. https://youtu.be/wdf04OwoucA or direct MP4 URL' },
      { name: 'posterUrl', label: 'Poster / Thumbnail Image URL', type: 'image' },
      { name: 'badgeTitle', label: 'Top Badge Title', type: 'text' },
      { name: 'captionTitle', label: 'Overlay Caption Title', type: 'text' },
      { name: 'captionBody', label: 'Overlay Caption Body', type: 'textarea' }
    ],
    defaultFields: {
      videoUrl: 'https://www.youtube.com/embed/wdf04OwoucA?si=ADGaPsVx8Z_dSwBJ',
      posterUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1600&auto=format&fit=crop&q=80',
      badgeTitle: 'Regenerative Agriculture in Action',
      captionTitle: 'NATURALLY GROWN & HANDPICKED',
      captionBody: 'Nurturing our soils naturally without chemicals or pesticides, delivering nutrient-rich pure harvests.'
    },
    fields: {
      videoUrl: 'https://www.youtube.com/embed/wdf04OwoucA?si=ADGaPsVx8Z_dSwBJ',
      posterUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1600&auto=format&fit=crop&q=80',
      badgeTitle: 'Regenerative Agriculture in Action',
      captionTitle: 'NATURALLY GROWN & HANDPICKED',
      captionBody: 'Nurturing our soils naturally without chemicals or pesticides, delivering nutrient-rich pure harvests.'
    },
    isEdited: false
  },
  {
    sectionKey: 'home.uv_ozone',
    page: 'HOME PAGE',
    title: 'UV-Washed & Ozone-Safe Section',
    subtitle: 'Heading and 3-step purification image cards, titles, subtitles, and descriptions.',
    fieldsSchema: [
      { name: 'heading', label: 'Main Section Heading', type: 'text' },
      { name: 'step1_image', label: 'Step 1 Image URL (Fruit Bowl)', type: 'image', helperText: 'Image for Clean Water step' },
      { name: 'step1_title', label: 'Step 1 Title', type: 'text' },
      { name: 'step1_desc', label: 'Step 1 Description', type: 'textarea' },
      { name: 'step2_image', label: 'Step 2 Image URL (Produce Carrots)', type: 'image', helperText: 'Image for Pesticide-Free step' },
      { name: 'step2_title', label: 'Step 2 Title', type: 'text' },
      { name: 'step2_desc', label: 'Step 2 Description', type: 'textarea' },
      { name: 'step3_image', label: 'Step 3 Image URL (Certified Hygiene)', type: 'image', helperText: 'Image for Safe Hands step' },
      { name: 'step3_title', label: 'Step 3 Title', type: 'text' },
      { name: 'step3_subtitle', label: 'Step 3 Subtitle', type: 'text' },
      { name: 'step3_desc', label: 'Step 3 Description', type: 'textarea' }
    ],
    defaultFields: {
      heading: 'UV-Washed. RO-Purified. Ozone-Safe.',
      step1_image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=700&auto=format&fit=crop&q=80',
      step1_title: 'Because Clean Food Starts with Clean Water.',
      step1_desc: "The Nuva fruits and veggies go through a triple-cleaning process - first UV-washed, then rinsed with RO-purified water, and finally treated with ozone-safe methods. No tap water. No chemicals. Just a clean, honest start to food that's safe before it even reaches your hands.",
      step2_image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=700&auto=format&fit=crop&q=80',
      step2_title: 'No Harmful Pesticides. No Residue. Just Peace of Mind.',
      step2_desc: 'Because feeding your family should never come with fear. The Nuva gently cleanse every fruit and vegetable using UV light, RO-purified water, and ozone-safe methods - washing away harmful pesticide traces, not your trust. What reaches your home is more than just clean food — it’s care you can feel.',
      step3_image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=700&auto=format&fit=crop&q=80',
      step3_title: 'Safe Machines. Safer Hands.',
      step3_subtitle: 'Certified Hygiene. Everyday Care.',
      step3_desc: 'From farm to pack, every step follows certified processes and industry-approved hygiene standards. At The Nuva, we handle your produce the way you would - with clean tools, trusted systems, and the kind of care that feels like home.'
    },
    fields: {
      heading: 'UV-Washed. RO-Purified. Ozone-Safe.',
      step1_image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=700&auto=format&fit=crop&q=80',
      step1_title: 'Because Clean Food Starts with Clean Water.',
      step1_desc: "The Nuva fruits and veggies go through a triple-cleaning process - first UV-washed, then rinsed with RO-purified water, and finally treated with ozone-safe methods. No tap water. No chemicals. Just a clean, honest start to food that's safe before it even reaches your hands.",
      step2_image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=700&auto=format&fit=crop&q=80',
      step2_title: 'No Harmful Pesticides. No Residue. Just Peace of Mind.',
      step2_desc: 'Because feeding your family should never come with fear. The Nuva gently cleanse every fruit and vegetable using UV light, RO-purified water, and ozone-safe methods - washing away harmful pesticide traces, not your trust. What reaches your home is more than just clean food — it’s care you can feel.',
      step3_image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=700&auto=format&fit=crop&q=80',
      step3_title: 'Safe Machines. Safer Hands.',
      step3_subtitle: 'Certified Hygiene. Everyday Care.',
      step3_desc: 'From farm to pack, every step follows certified processes and industry-approved hygiene standards. At The Nuva, we handle your produce the way you would - with clean tools, trusted systems, and the kind of care that feels like home.'
    },
    isEdited: false
  },
  {
    sectionKey: 'home.instagram',
    page: 'HOME PAGE',
    title: 'Instagram & UGC Section',
    subtitle: 'Instagram handle, headline, follower callout, and button link.',
    fieldsSchema: [
      { name: 'handle', label: 'Instagram Handle', type: 'text' },
      { name: 'title', label: 'Section Title', type: 'text' },
      { name: 'subtitle', label: 'Follower Callout Subtext', type: 'textarea' },
      { name: 'buttonText', label: 'Follow Button Label', type: 'text' },
      { name: 'instagramUrl', label: 'Instagram Profile URL', type: 'text' }
    ],
    defaultFields: {
      handle: '@nuvanutrition',
      title: 'Follow our daily farm harvest on Instagram',
      subtitle: 'Join 24,000+ conscious food lovers witnessing sunrise harvests, cold ozone washing, and healthy recipes.',
      buttonText: 'Follow @nuvanutrition',
      instagramUrl: 'https://instagram.com'
    },
    fields: {
      handle: '@nuvanutrition',
      title: 'Follow our daily farm harvest on Instagram',
      subtitle: 'Join 24,000+ conscious food lovers witnessing sunrise harvests, cold ozone washing, and healthy recipes.',
      buttonText: 'Follow @nuvanutrition',
      instagramUrl: 'https://instagram.com'
    },
    isEdited: false
  },
  {
    sectionKey: 'home.certifications',
    page: 'HOME PAGE',
    title: 'Certifications & Trust Badges',
    subtitle: 'Section title and 4 certification badge logo images (FSSAI, GMP, HACCP, ISO 9001).',
    fieldsSchema: [
      { name: 'heading', label: 'Section Heading', type: 'text' },
      { name: 'cert1_image', label: 'Certification 1 Image URL (FSSAI)', type: 'image', helperText: 'FSSAI Logo URL or Base64' },
      { name: 'cert1_name', label: 'Certification 1 Name', type: 'text' },
      { name: 'cert2_image', label: 'Certification 2 Image URL (GMP Certified)', type: 'image', helperText: 'GMP Logo URL or Base64' },
      { name: 'cert2_name', label: 'Certification 2 Name', type: 'text' },
      { name: 'cert3_image', label: 'Certification 3 Image URL (HACCP Certified)', type: 'image', helperText: 'HACCP Logo URL or Base64' },
      { name: 'cert3_name', label: 'Certification 3 Name', type: 'text' },
      { name: 'cert4_image', label: 'Certification 4 Image URL (ISO 9001)', type: 'image', helperText: 'ISO Logo URL or Base64' },
      { name: 'cert4_name', label: 'Certification 4 Name', type: 'text' }
    ],
    defaultFields: {
      heading: 'Certifications',
      cert1_image: '',
      cert1_name: 'FSSAI',
      cert2_image: '',
      cert2_name: 'GMP Certified',
      cert3_image: '',
      cert3_name: 'HACCP Certified',
      cert4_image: '',
      cert4_name: 'ISO 9001'
    },
    fields: {
      heading: 'Certifications',
      cert1_image: '',
      cert1_name: 'FSSAI',
      cert2_image: '',
      cert2_name: 'GMP Certified',
      cert3_image: '',
      cert3_name: 'HACCP Certified',
      cert4_image: '',
      cert4_name: 'ISO 9001'
    },
    isEdited: false
  },
  {
    sectionKey: 'home.testimonials',
    page: 'HOME PAGE',
    title: 'Customer Testimonials Header',
    subtitle: 'Section title and eyebrow subtitle displayed above testimonial cards.',
    fieldsSchema: [
      { name: 'eyebrow', label: 'Eyebrow Subtitle', type: 'text' },
      { name: 'heading', label: 'Main Section Title', type: 'text' }
    ],
    defaultFields: {
      eyebrow: 'We care about our customer experience too',
      heading: 'Testimonials'
    },
    fields: {
      eyebrow: 'We care about our customer experience too',
      heading: 'Testimonials'
    },
    isEdited: false
  },
  {
    sectionKey: 'home.video_shopping',
    page: 'HOME PAGE',
    title: 'Video Shopping & Reels Section',
    subtitle: 'Top header title, badge pill tag, and sub-headline displayed above shoppable video reels.',
    fieldsSchema: [
      { name: 'topTitle', label: 'Top Section Header', type: 'text', helperText: 'e.g. Video shopping' },
      { name: 'badgeText', label: 'Badge Pill Tag', type: 'text', helperText: 'e.g. Shoppable Farm Feeds' },
      { name: 'headline', label: 'Main Headline', type: 'text', helperText: 'e.g. Watch, Learn & Buy Directly' }
    ],
    defaultFields: {
      topTitle: 'Video shopping',
      badgeText: 'Shoppable Farm Feeds',
      headline: 'Watch, Learn & Buy Directly'
    },
    fields: {
      topTitle: 'Video shopping',
      badgeText: 'Shoppable Farm Feeds',
      headline: 'Watch, Learn & Buy Directly'
    },
    isEdited: false
  },
  {
    sectionKey: 'home.blog',
    page: 'HOME PAGE',
    title: 'Journal & Stories Section',
    subtitle: 'Badge tag, H2 main headline, subtitle narrative, and CTA button label.',
    fieldsSchema: [
      { name: 'badgeText', label: 'Top Badge Tag', type: 'text', helperText: 'e.g. Nuva Journal & Insights' },
      { name: 'heading', label: 'H2 Main Headline', type: 'text', helperText: 'e.g. Stories from Soil to Health' },
      { name: 'subtitle', label: 'Subtitle Paragraph', type: 'textarea', helperText: 'e.g. Deep dives into sustainable farming, ancient nutritional wisdom, and clean eating practices.' },
      { name: 'linkText', label: 'View All Link Label', type: 'text', helperText: 'e.g. View All Articles' }
    ],
    defaultFields: {
      badgeText: 'Nuva Journal & Insights',
      heading: 'Stories from Soil to Health',
      subtitle: 'Deep dives into sustainable farming, ancient nutritional wisdom, and clean eating practices.',
      linkText: 'View All Articles'
    },
    fields: {
      badgeText: 'Nuva Journal & Insights',
      heading: 'Stories from Soil to Health',
      subtitle: 'Deep dives into sustainable farming, ancient nutritional wisdom, and clean eating practices.',
      linkText: 'View All Articles'
    },
    isEdited: false
  },

  // 3. ABOUT US
  {
    sectionKey: 'about.hero',
    page: 'ABOUT US',
    title: 'About Us Hero Banner',
    subtitle: 'Top header tag, page title, and mission summary.',
    fieldsSchema: [
      { name: 'tag', label: 'Top Tag', type: 'text' },
      { name: 'title', label: 'Page Title', type: 'text' },
      { name: 'subtitle', label: 'Mission Summary', type: 'textarea' }
    ],
    defaultFields: {
      tag: 'The Nuva Journey',
      title: 'Our Story',
      subtitle: 'From the deep soil of Gujarat farms to your dining table — how we are redefining food safety and regenerative agriculture.'
    },
    fields: {
      tag: 'The Nuva Journey',
      title: 'Our Story',
      subtitle: 'From the deep soil of Gujarat farms to your dining table — how we are redefining food safety and regenerative agriculture.'
    },
    isEdited: false
  },
  {
    sectionKey: 'about.story',
    page: 'ABOUT US',
    title: 'Founder Narrative & Mission',
    subtitle: 'Founder Aanshi Patel story, quote, and mission statement.',
    fieldsSchema: [
      { name: 'founderName', label: 'Founder Name', type: 'text' },
      { name: 'quoteHeadline', label: 'Quote Headline', type: 'text' },
      { name: 'storyText', label: 'Story Narrative', type: 'textarea' },
      { name: 'missionStatement', label: 'Mission Statement', type: 'textarea' }
    ],
    defaultFields: {
      founderName: 'Aanshi Patel',
      quoteHeadline: 'True nutrition begins where chemical shortcuts end.',
      storyText: 'My name is Aanshi Patel, and I come from a family of farmers in Gujarat, and I have seen first-hand the effort and challenges that go into producing a single yield. What concerned me even more was when I saw the unhygienic "cleaning" practices and how many hands the produce passed through before it reached you.',
      missionStatement: 'In shock and concern, I wanted to change it so that farmers get rewarded for their hard work and people receive fruits and vegetables that are truly clean. With this vision, I founded Nuva. Not just as a company, but as a promise. A promise not just to our customers, but to myself.'
    },
    fields: {
      founderName: 'Aanshi Patel',
      quoteHeadline: 'True nutrition begins where chemical shortcuts end.',
      storyText: 'My name is Aanshi Patel, and I come from a family of farmers in Gujarat, and I have seen first-hand the effort and challenges that go into producing a single yield. What concerned me even more was when I saw the unhygienic "cleaning" practices and how many hands the produce passed through before it reached you.',
      missionStatement: 'In shock and concern, I wanted to change it so that farmers get rewarded for their hard work and people receive fruits and vegetables that are truly clean. With this vision, I founded Nuva. Not just as a company, but as a promise. A promise not just to our customers, but to myself.'
    },
    isEdited: false
  },
  {
    sectionKey: 'about.facilities',
    page: 'ABOUT US',
    title: 'Our Facilities Section',
    subtitle: 'Where Tradition Meets Innovation narrative and Vadodara ozone facility copy.',
    fieldsSchema: [
      { name: 'badge', label: 'Top Small Badge', type: 'text' },
      { name: 'title', label: 'Section Title', type: 'text' },
      { name: 'narrative1', label: 'Paragraph 1', type: 'textarea' },
      { name: 'narrative2', label: 'Paragraph 2', type: 'textarea' }
    ],
    defaultFields: {
      badge: 'Infrastructure & Tech',
      title: 'Our Facilities: Where Tradition Meet Innovation',
      narrative1: 'To make sure our vision becomes reality, we established our modern facility in Vadodara. Our facility uses advanced ozone wash technology, cold chain storage and precision sorting systems.',
      narrative2: 'This perfect blend of traditional respect for nature and modern technological capabilities allows us to clean your produce without using any harsh chemicals.'
    },
    fields: {
      badge: 'Infrastructure & Tech',
      title: 'Our Facilities: Where Tradition Meet Innovation',
      narrative1: 'To make sure our vision becomes reality, we established our modern facility in Vadodara. Our facility uses advanced ozone wash technology, cold chain storage and precision sorting systems.',
      narrative2: 'This perfect blend of traditional respect for nature and modern technological capabilities allows us to clean your produce without using any harsh chemicals.'
    },
    isEdited: false
  },
  {
    sectionKey: 'about.sustainable_packaging',
    page: 'ABOUT US',
    title: 'Sustainable Packaging Section',
    subtitle: 'Zero plastic food-grade packaging narrative.',
    fieldsSchema: [
      { name: 'badge', label: 'Top Small Badge', type: 'text' },
      { name: 'title', label: 'Section Title', type: 'text' },
      { name: 'description', label: 'Eco Packaging Description', type: 'textarea' }
    ],
    defaultFields: {
      badge: 'Earth Friendly',
      title: 'Sustainable Packaging for a Greener Tomorrow',
      description: 'We believe clean food deserves clean packaging. All Nuva produce is packaged in 100% biodegradable kraft bags and breathable bio-containers that lock in natural moisture while eliminating single-use plastic waste.'
    },
    fields: {
      badge: 'Earth Friendly',
      title: 'Sustainable Packaging for a Greener Tomorrow',
      description: 'We believe clean food deserves clean packaging. All Nuva produce is packaged in 100% biodegradable kraft bags and breathable bio-containers that lock in natural moisture while eliminating single-use plastic waste.'
    },
    isEdited: false
  },
  {
    sectionKey: 'about.farmers_support',
    page: 'ABOUT US',
    title: 'Back to the Farmers Section',
    subtitle: 'Fair value and farmer empowerment statement.',
    fieldsSchema: [
      { name: 'badge', label: 'Top Small Badge', type: 'text' },
      { name: 'title', label: 'Section Title', type: 'text' },
      { name: 'description', label: 'Farmer Direct Value Statement', type: 'textarea' }
    ],
    defaultFields: {
      badge: 'Direct Fair-Value',
      title: 'Supporting Our Farmers – Giving Back Where It Matters',
      description: 'Farmers are the true backbone of our nation. By eliminating middlemen and trading directly at fair market rates, we empower farming families with predictable incomes, regenerative training, and soil-enriching bio-inputs.'
    },
    fields: {
      badge: 'Direct Fair-Value',
      title: 'Supporting Our Farmers – Giving Back Where It Matters',
      description: 'Farmers are the true backbone of our nation. By eliminating middlemen and trading directly at fair market rates, we empower farming families with predictable incomes, regenerative training, and soil-enriching bio-inputs.'
    },
    isEdited: false
  },

  // 4. B2B / COMMERCIAL
  {
    sectionKey: 'b2b.hero',
    page: 'B2B',
    title: 'B2B Hero Banner & Value Proposition',
    subtitle: 'Hero tag, headline, highlight text, description, background machinery image, and support phone.',
    fieldsSchema: [
      { name: 'tag', label: 'Top Tag', type: 'text' },
      { name: 'headline', label: 'Main Headline', type: 'text' },
      { name: 'highlightText', label: 'Highlight Headline Text', type: 'text' },
      { name: 'description', label: 'Hero Narrative Description', type: 'textarea' },
      { name: 'bgImage', label: 'Background Machinery Image URL', type: 'image' },
      { name: 'supportPhone', label: 'Support Phone Number', type: 'text' }
    ],
    defaultFields: {
      tag: 'Nuva B2B & Modern Commercial Kitchens',
      headline: 'India’s Cleanest',
      highlightText: 'Food Ecosystem',
      description: 'Ozone-Washed • UV-Cleaned • RO-Purified Produce for leading restaurants, cloud kitchens, hotels, and retail partners. Nuva delivers fresh, unpolished, zero-chemical fruits, gourmet exotics, and staples with verified hygiene.',
      bgImage: '/ozone-shield-machinery.png',
      supportPhone: '+91 92277 25359'
    },
    fields: {
      tag: 'Nuva B2B & Modern Commercial Kitchens',
      headline: 'India’s Cleanest',
      highlightText: 'Food Ecosystem',
      description: 'Ozone-Washed • UV-Cleaned • RO-Purified Produce for leading restaurants, cloud kitchens, hotels, and retail partners. Nuva delivers fresh, unpolished, zero-chemical fruits, gourmet exotics, and staples with verified hygiene.',
      bgImage: '/ozone-shield-machinery.png',
      supportPhone: '+91 92277 25359'
    },
    isEdited: false
  },
  {
    sectionKey: 'b2b.process',
    page: 'B2B',
    title: 'B2B Farm to Kitchen Process',
    subtitle: 'Process heading, narrative subtitle, and 4 pipeline step cards.',
    fieldsSchema: [
      { name: 'tag', label: 'Section Eyebrow Tag', type: 'text' },
      { name: 'heading', label: 'Main Section Title', type: 'text' },
      { name: 'description', label: 'Narrative Subtitle', type: 'textarea' },
      { name: 'step1_title', label: 'Step 1 Title', type: 'text' },
      { name: 'step1_desc', label: 'Step 1 Description', type: 'textarea' },
      { name: 'step2_title', label: 'Step 2 Title', type: 'text' },
      { name: 'step2_desc', label: 'Step 2 Description', type: 'textarea' },
      { name: 'step3_title', label: 'Step 3 Title', type: 'text' },
      { name: 'step3_desc', label: 'Step 3 Description', type: 'textarea' },
      { name: 'step4_title', label: 'Step 4 Title', type: 'text' },
      { name: 'step4_desc', label: 'Step 4 Description', type: 'textarea' }
    ],
    defaultFields: {
      tag: 'Transparency & Journey',
      heading: 'The Nuva Process: Farm to Kitchen',
      description: 'From the farmer sowing seeds with care, through automated multi-stage ozone wash tunnels, to clean kitchen delivery.',
      step1_title: 'Direct Farmer Sourcing',
      step1_desc: '"Every seed is a promise; a promise to feed." Partnering with local growers for high-nutrition soil harvests.',
      step2_title: 'Triple-Clean Purification',
      step2_desc: 'Automated conveyor tunnels with medical ozone (O₃), UV light baths, and RO micro-bubble rinse.',
      step3_title: 'Air-Dry & Safe Pack',
      step3_desc: 'Turbo air knife moisture removal and sustainable food-grade kraft packaging for zero contamination.',
      step4_title: 'Sunrise Kitchen Delivery',
      step4_desc: 'Ready-to-prep, sterile harvest batches delivered to culinary teams and modern households.'
    },
    fields: {
      tag: 'Transparency & Journey',
      heading: 'The Nuva Process: Farm to Kitchen',
      description: 'From the farmer sowing seeds with care, through automated multi-stage ozone wash tunnels, to clean kitchen delivery.',
      step1_title: 'Direct Farmer Sourcing',
      step1_desc: '"Every seed is a promise; a promise to feed." Partnering with local growers for high-nutrition soil harvests.',
      step2_title: 'Triple-Clean Purification',
      step2_desc: 'Automated conveyor tunnels with medical ozone (O₃), UV light baths, and RO micro-bubble rinse.',
      step3_title: 'Air-Dry & Safe Pack',
      step3_desc: 'Turbo air knife moisture removal and sustainable food-grade kraft packaging for zero contamination.',
      step4_title: 'Sunrise Kitchen Delivery',
      step4_desc: 'Ready-to-prep, sterile harvest batches delivered to culinary teams and modern households.'
    },
    isEdited: false
  },

  // 5. OZONE SHIELD
  {
    sectionKey: 'ozone.hero',
    page: 'OZONE SHIELD',
    title: 'Ozone Shield Header & Tech Overview',
    subtitle: 'Hero headline, scientific breakdown, and medical-grade aqueous ozone description.',
    fieldsSchema: [
      { name: 'title', label: 'Page Title', type: 'text' },
      { name: 'subtitle', label: 'Subtitle Description', type: 'textarea' },
      { name: 'pesticideReductionStat', label: 'Pesticide Reduction Percentage', type: 'text' }
    ],
    defaultFields: {
      title: 'Aqueous Ozone Technology (O₃)',
      subtitle: 'Nature’s most potent purifying agent. 3,000x faster than chlorine at neutralizing pesticide molecules and surface microbes without leaving any harmful chemical residue.',
      pesticideReductionStat: '99.98%'
    },
    fields: {
      title: 'Aqueous Ozone Technology (O₃)',
      subtitle: 'Nature’s most potent purifying agent. 3,000x faster than chlorine at neutralizing pesticide molecules and surface microbes without leaving any harmful chemical residue.',
      pesticideReductionStat: '99.98%'
    },
    isEdited: false
  },

  // 6. CSR INITIATIVES
  {
    sectionKey: 'csr.hero',
    page: 'CSR INITIATIVES',
    title: 'CSR ₹1 Agri-Tech Fund Pledge',
    subtitle: 'Pledge headline, contribution breakdown, and farmer support narrative.',
    fieldsSchema: [
      { name: 'headline', label: 'Pledge Headline', type: 'text' },
      { name: 'subheadline', label: 'Pledge Subheadline', type: 'textarea' },
      { name: 'fundPledgeAmount', label: 'Contribution Per Order', type: 'text' }
    ],
    defaultFields: {
      headline: '₹1 On Every Order Directly Empowers Gujarat Farmers',
      subheadline: 'We donate ₹1 from every single transaction into our Regenerative Agri-Tech Fund, providing living soil bio-fertilizers and solar drip irrigation to regional smallholder farmers.',
      fundPledgeAmount: '₹1 Per Order'
    },
    fields: {
      headline: '₹1 On Every Order Directly Empowers Gujarat Farmers',
      subheadline: 'We donate ₹1 from every single transaction into our Regenerative Agri-Tech Fund, providing living soil bio-fertilizers and solar drip irrigation to regional smallholder farmers.',
      fundPledgeAmount: '₹1 Per Order'
    },
    isEdited: false
  },

  // 7. BLOG
  {
    sectionKey: 'blog.hero',
    page: 'BLOG',
    title: 'Food & Health Articles & Cards',
    subtitle: 'Page title, tag cloud pills, and individual split-image article cards.',
    fieldsSchema: [
      { name: 'title', label: 'Blog Section Title', type: 'text', helperText: 'e.g. Food & Health' },
      { name: 'subtitle', label: 'Blog Header Subtext', type: 'textarea' },
      { name: 'tags', label: 'Filter Tags (Comma Separated)', type: 'textarea', helperText: 'Comma-separated list of filter tags' },
      { name: 'art1_title', label: 'Article 1 Title', type: 'text' },
      { name: 'art1_banner', label: 'Article 1 Banner Label', type: 'text' },
      { name: 'art1_left_img', label: 'Article 1 Left Image URL', type: 'image' },
      { name: 'art1_right_img', label: 'Article 1 Right Image URL', type: 'image' },
      { name: 'art1_excerpt', label: 'Article 1 Excerpt', type: 'textarea' },
      { name: 'art2_title', label: 'Article 2 Title', type: 'text' },
      { name: 'art2_banner', label: 'Article 2 Banner Label', type: 'text' },
      { name: 'art2_left_img', label: 'Article 2 Left Image URL', type: 'image' },
      { name: 'art2_right_img', label: 'Article 2 Right Image URL', type: 'image' },
      { name: 'art2_excerpt', label: 'Article 2 Excerpt', type: 'textarea' },
      { name: 'art3_title', label: 'Article 3 Title', type: 'text' },
      { name: 'art3_banner', label: 'Article 3 Banner Label', type: 'text' },
      { name: 'art3_left_img', label: 'Article 3 Left Image URL', type: 'image' },
      { name: 'art3_right_img', label: 'Article 3 Right Image URL', type: 'image' },
      { name: 'art3_excerpt', label: 'Article 3 Excerpt', type: 'textarea' }
    ],
    defaultFields: {
      title: 'Food & Health',
      subtitle: 'Deep dives on ozone washing science, Vedic A2 ghee traditions, stone-ground ancient grains, and clean eating tips.',
      tags: 'All articles, a2 cow ghee, amla, avocado, Ayurvedic medicine, bad food combination, Benefits of amla, chemical free, cinnamon powder, Citrus fruits, curd, eat smart, finger millet, finger millet benefits, Food, fresh turmeric, golden turmeric, haldi, Health, health benefits of ragi, indian population, khapli wheat, Lakadong turmeric, Nuva, nuva ghee, nuva the nuva, ozone wash fruits, ozone wash vegetable, ragi, ragi benefits, ragi finger millet, ragi millet recipes, ragi roti benefits, Recipe, tea, the nuva, the nuva cinnamon, the nuva haldi, the nuva ragi, the nuva turmeric, the nuvanuva nutrition, weight loss, weight loss sustainability, what is ragi',
      art1_title: 'How to Identify Pure Cow Ghee: 7 Things to Check',
      art1_banner: 'HOW TO IDENTIFY PURE COW GHEE: 7 THINGS TO CHECK',
      art1_left_img: 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=500&auto=format&fit=crop&q=80',
      art1_right_img: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=500&auto=format&fit=crop&q=80',
      art1_excerpt: "My dadi used to say a house without ghee in the dabba is not really running a kitchen at all. Growing up we'd get one spoon on hot dal...",
      art2_title: 'Avocado for Weight Management: What You Should Know',
      art2_banner: 'AVOCADO FOR WEIGHT MANAGEMENT: WHAT YOU SHOULD KNOW',
      art2_left_img: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500&auto=format&fit=crop&q=80',
      art2_right_img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80',
      art2_excerpt: 'When consumed in moderate amounts, avocado can be a great choice for a person trying to lose weight. The presence of good fat...',
      art3_title: '10 Science-Backed Health Benefits of Black Rice',
      art3_banner: '10 SCIENCE-BACKED HEALTH BENEFITS OF BLACK RICE',
      art3_left_img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80',
      art3_right_img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80',
      art3_excerpt: 'Black rice is not just an eye-catching version of plain white rice; it is also highly nutritious. This rice has its distinctive black color due to...'
    },
    fields: {
      title: 'Food & Health',
      subtitle: 'Deep dives on ozone washing science, Vedic A2 ghee traditions, stone-ground ancient grains, and clean eating tips.',
      tags: 'All articles, a2 cow ghee, amla, avocado, Ayurvedic medicine, bad food combination, Benefits of amla, chemical free, cinnamon powder, Citrus fruits, curd, eat smart, finger millet, finger millet benefits, Food, fresh turmeric, golden turmeric, haldi, Health, health benefits of ragi, indian population, khapli wheat, Lakadong turmeric, Nuva, nuva ghee, nuva the nuva, ozone wash fruits, ozone wash vegetable, ragi, ragi benefits, ragi finger millet, ragi millet recipes, ragi roti benefits, Recipe, tea, the nuva, the nuva cinnamon, the nuva haldi, the nuva ragi, the nuva turmeric, the nuvanuva nutrition, weight loss, weight loss sustainability, what is ragi',
      art1_title: 'How to Identify Pure Cow Ghee: 7 Things to Check',
      art1_banner: 'HOW TO IDENTIFY PURE COW GHEE: 7 THINGS TO CHECK',
      art1_left_img: 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=500&auto=format&fit=crop&q=80',
      art1_right_img: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=500&auto=format&fit=crop&q=80',
      art1_excerpt: "My dadi used to say a house without ghee in the dabba is not really running a kitchen at all. Growing up we'd get one spoon on hot dal...",
      art2_title: 'Avocado for Weight Management: What You Should Know',
      art2_banner: 'AVOCADO FOR WEIGHT MANAGEMENT: WHAT YOU SHOULD KNOW',
      art2_left_img: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500&auto=format&fit=crop&q=80',
      art2_right_img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80',
      art2_excerpt: 'When consumed in moderate amounts, avocado can be a great choice for a person trying to lose weight. The presence of good fat...',
      art3_title: '10 Science-Backed Health Benefits of Black Rice',
      art3_banner: '10 SCIENCE-BACKED HEALTH BENEFITS OF BLACK RICE',
      art3_left_img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80',
      art3_right_img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80',
      art3_excerpt: 'Black rice is not just an eye-catching version of plain white rice; it is also highly nutritious. This rice has its distinctive black color due to...'
    },
    isEdited: false
  },

  // 8. SHOP / CATALOG
  {
    sectionKey: 'shop.header',
    page: 'SHOP',
    title: 'Catalog Header & Tagline',
    subtitle: 'Pure Farm Catalog headline, filter descriptions, and harvest statements.',
    fieldsSchema: [
      { name: 'title', label: 'Catalog Heading', type: 'text' },
      { name: 'subtitle', label: 'Catalog Subtitle', type: 'textarea' }
    ],
    defaultFields: {
      title: 'Pure Farm Catalog',
      subtitle: 'Filter 100% chemical-free staples & ozone sanitized harvest batches.'
    },
    fields: {
      title: 'Pure Farm Catalog',
      subtitle: 'Filter 100% chemical-free staples & ozone sanitized harvest batches.'
    },
    isEdited: false
  },

  // 9. PRODUCT DETAIL
  {
    sectionKey: 'pdp.promo',
    page: 'PRODUCT DETAIL',
    title: '10% Welcome Discount & Guarantees',
    subtitle: 'Coupon code callout, delivery guarantee, and trust statements.',
    fieldsSchema: [
      { name: 'couponCode', label: 'Promo Coupon Code', type: 'text' },
      { name: 'couponHeadline', label: 'Coupon Callout Text', type: 'text' },
      { name: 'deliveryGuarantee', label: 'Delivery Guarantee Copy', type: 'text' }
    ],
    defaultFields: {
      couponCode: 'WELCOME10',
      couponHeadline: 'Use code WELCOME10 for extra 10% OFF at checkout!',
      deliveryGuarantee: 'Under 12-hr sunrise farm harvest directly dispatched'
    },
    fields: {
      couponCode: 'WELCOME10',
      couponHeadline: 'Use code WELCOME10 for extra 10% OFF at checkout!',
      deliveryGuarantee: 'Under 12-hr sunrise farm harvest directly dispatched'
    },
    isEdited: false
  },

  // 10. CSR INITIATIVES
  {
    sectionKey: 'cart.threshold',
    page: 'CART & CHECKOUT',
    title: 'Free-Shipping & Promo Callout',
    subtitle: 'Threshold value, delivery meter message, and coupon helper.',
    fieldsSchema: [
      { name: 'freeShippingThreshold', label: 'Free Shipping Threshold Amount (₹)', type: 'text' },
      { name: 'promoCodeText', label: 'Promo Coupon Helper Copy', type: 'text' },
      { name: 'satisfactionNotice', label: 'Satisfaction Guarantee Copy', type: 'textarea' }
    ],
    defaultFields: {
      freeShippingThreshold: '499',
      promoCodeText: 'Use coupon WELCOME10 for 10% OFF your first farm order!',
      satisfactionNotice: '100% Freshness Guarantee: If any item arrives damaged, report within 24 hours for instant refund or replacement.'
    },
    fields: {
      freeShippingThreshold: '499',
      promoCodeText: 'Use coupon WELCOME10 for 10% OFF your first farm order!',
      satisfactionNotice: '100% Freshness Guarantee: If any item arrives damaged, report within 24 hours for instant refund or replacement.'
    },
    isEdited: false
  },

  // 11. CONTACT
  {
    sectionKey: 'contact.info',
    page: 'CONTACT',
    title: 'Processing Unit & Office Locations',
    subtitle: 'Anand processing unit, Vadodara office, and offline store details.',
    fieldsSchema: [
      { name: 'processingUnit', label: 'Processing Unit Address', type: 'textarea' },
      { name: 'mainOffice', label: 'Main Office Address', type: 'textarea' },
      { name: 'offlineStore', label: 'Offline Store Address', type: 'textarea' }
    ],
    defaultFields: {
      processingUnit: 'Kaival Society, Anand, Gujarat 388330',
      mainOffice: '4th Floor, Pancham Icon, Vasna Rd, beside D Mart Mall, Vadodara, Gujarat 390007',
      offlineStore: 'Shop No.184 Radhakrishna Flat , Productivity Road, Near Akota Garden, Vadodara, Gujarat 390020'
    },
    fields: {
      processingUnit: 'Kaival Society, Anand, Gujarat 388330',
      mainOffice: '4th Floor, Pancham Icon, Vasna Rd, beside D Mart Mall, Vadodara, Gujarat 390007',
      offlineStore: 'Shop No.184 Radhakrishna Flat , Productivity Road, Near Akota Garden, Vadodara, Gujarat 390020'
    },
    isEdited: false
  },

  // 12. FOOTER
  {
    sectionKey: 'footer.contact',
    page: 'FOOTER',
    title: 'Footer Contact & License',
    subtitle: 'Vadodara head office address, support phone, email, and copyright notice.',
    fieldsSchema: [
      { name: 'officeAddress', label: 'Vadodara Office Address', type: 'textarea' },
      { name: 'supportPhone', label: 'Support Hotline', type: 'text' },
      { name: 'supportEmail', label: 'Support Email', type: 'text' },
      { name: 'copyrightNotice', label: 'Copyright String', type: 'text' }
    ],
    defaultFields: {
      officeAddress: '4th floor, Pancham Icon, Vasna Rd, Kalyan Nagar, Diwalipura, Vadodara, Gujarat 390007',
      supportPhone: '+91 92277 25359',
      supportEmail: 'support@thenuva.com',
      copyrightNotice: '© 2026, Nuva Nutrition. Crafted By Spreadd'
    },
    fields: {
      officeAddress: '4th floor, Pancham Icon, Vasna Rd, Kalyan Nagar, Diwalipura, Vadodara, Gujarat 390007',
      supportPhone: '+91 92277 25359',
      supportEmail: 'support@thenuva.com',
      copyrightNotice: '© 2026, Nuva Nutrition. Crafted By Spreadd'
    },
    isEdited: false
  }
];
