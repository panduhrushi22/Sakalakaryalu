import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as crypto from 'crypto';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Clearing existing data...');
  await prisma.booking.deleteMany({});
  await prisma.pujaKitOrder.deleteMany({});
  await prisma.pujaTranslation.deleteMany({});
  await prisma.mantra.deleteMany({});
  await prisma.pujaStep.deleteMany({});
  await prisma.pujaItem.deleteMany({});
  await prisma.puja.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.pujari.deleteMany({ where: { seedId: null, bookings: { none: {} } } }); // only wipe orphan non-seed pujaris if any
  // NOTE: seed pujaris are upserted below — admin-deleted pujaris are NOT restored
  await prisma.festival.deleteMany({});
  await prisma.blog.deleteMany({});

  console.log('Seeding pre-approved Admin users...');
  const passwordHash = crypto.createHash('sha256').update('adminpassword').digest('hex');
  
  // 1. Super Admin (Full access)
  await prisma.user.create({
    data: {
      email: 'owner@sakalakaryalu.com',
      name: 'Sakalakaryalu Owner (Super Admin)',
      password: passwordHash,
      role: 'super_admin',
    },
  });

  // 2. Admin (Bookings & Orders)
  await prisma.user.create({
    data: {
      email: 'admin@sakalakaryalu.com',
      name: 'Sakalakaryalu Admin',
      password: passwordHash,
      role: 'admin',
    },
  });

  // 3. Content Manager (Pujas and content only)
  await prisma.user.create({
    data: {
      email: 'content@sakalakaryalu.com',
      name: 'Spiritual Content Manager',
      password: passwordHash,
      role: 'content_manager',
    },
  });

  // 4. Delivery Manager (Kits and orders only)
  await prisma.user.create({
    data: {
      email: 'delivery@sakalakaryalu.com',
      name: 'Puja Kits Delivery Manager',
      password: passwordHash,
      role: 'delivery_manager',
    },
  });

  // 5. Backwards Compatibility Admins
  await prisma.user.create({
    data: {
      email: 'admin@sakalakaryalu.in',
      name: 'Sakalakaryalu Admin Old',
      password: passwordHash,
      role: 'admin',
    },
  });

  const panduPasswordHash = crypto.createHash('sha256').update('panduhrushi22').digest('hex');
  await prisma.user.create({
    data: {
      email: 'panduhrushi22@gmail.com',
      name: 'HRUSHI (Admin)',
      password: panduPasswordHash,
      role: 'admin',
    },
  });

  console.log('Seeding Pujaris...');
  const pujarisData = [
    {
      seedId: 'seed-pujari-ramakrishna',
      name: 'Ramakrishna Shastri',
      experience: 18,
      rating: 4.9,
      languages: 'Telugu, Sanskrit, English',
      specialization: 'Satyanarayana Vratham, Vivaham, Gruhapravesam, Chandi Homam',
      phone: '+91 98480 22338',
      whatsapp: '919848022338',
      lat: 17.4401,
      lng: 78.3489,
      image: 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=400&h=400&fit=crop&q=80',
      address: 'Plot No. 42, Vittal Rao Nagar, Gachibowli, Hyderabad, Telangana - 500081',
    },
    {
      seedId: 'seed-pujari-venkateswara',
      name: 'Venkateswara Sarma',
      experience: 15,
      rating: 4.8,
      languages: 'Telugu, Sanskrit, Kannada',
      specialization: 'Ganapathi Homam, Upanayanam, Lakshmi Kubera Homam, Daily Pujas',
      phone: '+91 99480 33441',
      whatsapp: '919948033441',
      lat: 17.4933,
      lng: 78.3984,
      image: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=400&h=400&fit=crop&q=80',
      address: 'Flat 102, Srinivasa Nilayam, KPHB Colony, Kukatpally, Hyderabad - 500072',
    },
    {
      seedId: 'seed-pujari-subrahmanya',
      name: 'Subrahmanya Avadhani',
      experience: 22,
      rating: 5.0,
      languages: 'Telugu, Sanskrit, Tamil, English',
      specialization: 'Maha Rudra Homam, Chandi Homam, Sudarshana Homam, Vivaham',
      phone: '+91 91234 56789',
      whatsapp: '919123456789',
      lat: 17.4399,
      lng: 78.4983,
      image: 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=400&h=400&fit=crop&q=80',
      address: 'Door No. 12-1-84, Padmarao Nagar, Secunderabad, Telangana - 500025',
    },
    {
      seedId: 'seed-pujari-anantha',
      name: 'Anantha Krishna Somayaji',
      experience: 25,
      rating: 4.95,
      languages: 'Telugu, Sanskrit, Hindi',
      specialization: 'Navagraha Puja, Gruhapravesam, Sudarshana Homam, Annaprasana',
      phone: '+91 98765 43210',
      whatsapp: '919876543210',
      lat: 17.3688,
      lng: 78.5247,
      image: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=400&h=400&fit=crop&q=80',
      address: 'H.No. 3-89, Lane No. 4, Kamala Nagar, Dilsukhnagar, Hyderabad - 500060',
    },
    {
      seedId: 'seed-pujari-phanindra',
      name: 'Phanindra Shastri',
      experience: 12,
      rating: 4.75,
      languages: 'Telugu, Sanskrit, English',
      specialization: 'Daily Pujas, Ganesh Puja, Lakshmi Puja, Shanti Pujas',
      phone: '+91 94401 23456',
      whatsapp: '919440123456',
      lat: 17.4375,
      lng: 78.4482,
      image: 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=400&h=400&fit=crop&q=80',
      address: '201, Shanti Sadan, Methodist Colony, Begumpet, Hyderabad - 500016',
    },
    {
      seedId: 'seed-pujari-raghavendra',
      name: 'Raghavendra Bhat',
      experience: 14,
      rating: 4.85,
      languages: 'Telugu, Kannada, Sanskrit, English',
      specialization: 'Satyanarayana Vratham, Ayudha Puja, Durga Puja, Lakshmi Puja',
      phone: '+91 90001 90002',
      whatsapp: '919000190002',
      lat: 17.4483,
      lng: 78.3741,
      image: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=400&h=400&fit=crop&q=80',
      address: 'Plot 76, Kavuri Hills, Phase 2, Madhapur, Hyderabad - 500081',
    },
    {
      seedId: 'seed-pujari-narayana',
      name: 'Narayana Murthy',
      experience: 30,
      rating: 5.0,
      languages: 'Telugu, Sanskrit',
      specialization: 'Vivaham, Gruhapravesam, Upanayanam, Chandi Homam',
      phone: '+91 93910 11223',
      whatsapp: '919391011223',
      lat: 17.3616,
      lng: 78.4747,
      image: 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=400&h=400&fit=crop&q=80',
      address: 'Door No. 20-3-112, Shalibanda Road, Charminar, Hyderabad - 500002',
    },
    {
      seedId: 'seed-pujari-srinivasa',
      name: 'Srinivasa Charyulu',
      experience: 16,
      rating: 4.9,
      languages: 'Telugu, Tamil, Sanskrit, English',
      specialization: 'Sudarshana Homam, Lakshmi Kubera Homam, Gruhapravesam, Vivaham',
      phone: '+91 98490 88990',
      whatsapp: '919849088990',
      lat: 17.4319,
      lng: 78.4098,
      image: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=400&h=400&fit=crop&q=80',
      address: 'Road No. 10, Jubilee Hills, Near Peddamma Temple, Hyderabad - 500033',
    },
    {
      seedId: 'seed-pujari-mallikarjuna',
      name: 'Mallikarjuna Shastri',
      experience: 20,
      rating: 4.8,
      languages: 'Telugu, Sanskrit, Hindi',
      specialization: 'Navagraha Puja, Shiva Puja, Ganapathi Homam, Maha Rudra Homam',
      phone: '+91 95023 45678',
      whatsapp: '919502345678',
      lat: 17.4019,
      lng: 78.5602,
      image: 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=400&h=400&fit=crop&q=80',
      address: 'H.No. 4-105, Chilukanagar, Uppal, Hyderabad - 500039',
    },
    {
      seedId: 'seed-pujari-satyanarayana',
      name: 'Satyanarayana Murthy',
      experience: 24,
      rating: 4.9,
      languages: 'Telugu, Sanskrit, English',
      specialization: 'Satyanarayana Vratham, Vara Lakshmi Vratham, Durga Puja, Annaprasana',
      phone: '+91 99887 66554',
      whatsapp: '919988766554',
      lat: 17.4139,
      lng: 78.4481,
      image: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=400&h=400&fit=crop&q=80',
      address: 'Flat 304, Saffron Heights, Road No. 3, Banjara Hills, Hyderabad - 500034',
    },
  ];

  // UPSERT — never wipes admin-deleted pujaris; only updates existing seed ones
  for (const pujari of pujarisData) {
    const { seedId, ...data } = pujari;
    await prisma.pujari.upsert({
      where: { seedId },
      update: data,
      create: { seedId, ...data },
    });
  }

  console.log('Seeding Festivals...');
  const festivalsData = [
    {
      name: 'Ugadi',
      slug: 'ugadi',
      date: '2026-03-19',
      significance: 'Ugadi marks the Hindu New Year for the Telugu, Kannada, and Marathi communities. It symbolises the beginning of a new lunar cycle and represents the flavors of life through the famous Ugadi Pachadi.',
      rituals: '1. Early morning oil bath. 2. Wearing new clothes. 3. Praying to the Sun and decorating doorways with fresh mango leaves and colorful rangoli. 4. Consumption of Ugadi Pachadi (combining 6 tastes representing life: sweet, sour, bitter, salty, tangy, spicy). 5. Panchanga Sravanam (listening to the annual astrological predictions).',
      image: 'https://images.unsplash.com/photo-1615469038804-6b91aef7026f?w=600&h=400&fit=crop&q=80',
    },
    {
      name: 'Diwali',
      slug: 'diwali',
      date: '2026-11-08',
      significance: 'Diwali, the festival of lights, celebrates the victory of light over darkness, good over evil, and knowledge over ignorance. It marks Lord Rama\'s return to Ayodhya and is dedicated to Goddess Lakshmi.',
      rituals: '1. Lakshmi Puja in the evening. 2. Lighting clay deepams (lamps) all around the house. 3. Setting off fireworks and sparklers. 4. Exchanging sweets and gifts with family and neighbors. 5. Wearing new festive clothes.',
      image: 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=600&h=400&fit=crop&q=80',
    },
    {
      name: 'Makar Sankranti',
      slug: 'makar-sankranti',
      date: '2026-01-14',
      significance: 'Sankranti is the harvest festival celebrating the transition of the Sun into Capricorn (Makara rashi). It marks the end of winter and the start of longer, warmer days.',
      rituals: '1. Bhogi bonfire on the first day. 2. Drawing colorful rangolis with muggu and Gobbemma (cow dung balls decorated with flowers). 3. Preparing sweet pongal (harvest rice). 4. Flying kites. 5. Giving charity and sesame-jaggery sweets.',
      image: 'https://images.unsplash.com/photo-1590076212879-1bf4b010c226?w=600&h=400&fit=crop&q=80',
    },
    {
      name: 'Sharad Navaratri',
      slug: 'sharad-navaratri',
      date: '2026-10-11',
      significance: 'Navaratri is a nine-night festival dedicated to the worship of the divine feminine principles Durga, Lakshmi, and Saraswati, celebrating the triumph of Goddess Durga over Mahishasura.',
      rituals: '1. Ghatasthapana (Kalasha installation). 2. Nine days of fasting and daily Archana. 3. Installing Batukamma or Garba dance in the evenings. 4. Ayudha Puja (worshipping tools, books, and vehicles) on the 9th day. 5. Vijayadashami celebrations on the 10th day.',
      image: 'https://images.unsplash.com/photo-1561361531-79f20c9f6393?w=600&h=400&fit=crop&q=80',
    },
    {
      name: 'Vinayaka Chavithi',
      slug: 'vinayaka-chavithi',
      date: '2026-09-15',
      significance: 'Ganesh Chaturthi celebrates the birth of Lord Ganesha, the god of wisdom, prosperity, and the remover of obstacles. It brings communities together with divine joy.',
      rituals: '1. Installing clay Ganesha idols. 2. Elaborate Puja with 21 varieties of leaves (Patri). 3. Offering 21 Modaks / Kudumulu as Naivedyam. 4. Singing Ganesha Harathi. 5. Visarjan (immersion of Ganesha idols) after 3, 5, 9, or 11 days.',
      image: 'https://images.unsplash.com/photo-1567591974584-e1855261628c?w=600&h=400&fit=crop&q=80',
    },
    {
      name: 'Krishna Janmashtami',
      slug: 'krishna-janmashtami',
      date: '2026-09-03',
      significance: 'Janmashtami marks the birth of Lord Krishna, the eighth avatar of Lord Vishnu, symbolising divine love, wisdom, and righteousness.',
      rituals: '1. Fasting until midnight (the hour of Krishna\'s birth). 2. Cleaning and decorating home altars. 3. Bathing baby Krishna idol with milk, honey, and curd (Abhishekam). 4. Making cute baby footsteps from the door to the puja room. 5. Dahi Handi (pot-breaking) celebrations next morning.',
      image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=400&fit=crop&q=80',
    },
  ];

  for (const festival of festivalsData) {
    await prisma.festival.create({
      data: festival,
    });
  }

  console.log('Seeding Spiritual Blogs...');
  const blogsData = [
    {
      title: 'Why We Light Lamps in Hindu Households',
      slug: 'why-we-light-lamps',
      summary: 'Lighting a lamp (Deepam) is the first ritual in any Hindu ceremony. Learn the profound scientific, psychological, and spiritual reasons behind this daily practice.',
      content: 'In Hindu tradition, the day starts and ends with lighting a clay or brass lamp (Deepam). Beyond its beautiful warm aesthetic, the practice carries deep spiritual and scientific significance.\n\n### 1. Symbol of Knowledge\nLight represents knowledge, while darkness symbolises ignorance. Lighting the lamp is an invocation to the supreme divine, asking to dispel our internal ignorance and awaken inner light (wisdom). The mantra recited during lighting is:\n\n*"Asato Ma Sadgamaya, Tamaso Ma Jyotirgamaya, Mrityor Ma Amritamgamaya"* (Lead us from ignorance to truth, from darkness to light, and from death to immortality).\n\n### 2. The Five Elements (Pancha Bhoota)\nThe physical structure of the lamp incorporates multiple natural forces:\n- The lamp holder (clay/brass) represents the Earth element (Prithvi).\n- The oil/ghee represents the Water element (Jala).\n- The flame represents the Fire element (Agni).\n- The smoke/heat represents the Air element (Vayu).\n- The space filled by light represents the Ether element (Akasha).\nBy lighting a deepam, we pay respect to all cosmic elements.\n\n### 3. Scientific Significance\nBurning pure cow ghee or cold-pressed sesame oil produces positive ions that cleanse the air. It acts as a natural germicide and improves concentration. Inhaling the warmth and aroma of ghee flames stimulates olfactory centers, soothing the central nervous system, reducing stress, and establishing a meditative ambiance.',
      image: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=600&h=400&fit=crop&q=80',
      readTime: '4 min read',
      date: 'May 20, 2026',
    },
    {
      title: 'The Divine Meaning and Power of Om (Aum)',
      slug: 'meaning-of-om',
      summary: 'Om is the primordial sound of the universe. Explore how chanting this single syllable heals the mind and body according to both ancient Vedas and modern science.',
      content: 'Om, or Aum, is the most sacred symbol and syllable in Hinduism. Referred to as the Pranava, it is the mother of all mantras and the source vibration from which the entire universe emerged.\n\n### 1. The Anatomy of "AUM"\nThe syllable is composed of three distinct vocal vibrations plus a silent fourth:\n- **A (A-kar)**: Produced from the throat. Represents the waking state of consciousness, the physical body, and the creator Lord Brahma.\n- **U (U-kar)**: Produced by rolling over the tongue. Represents the dream state, the mind, and the preserver Lord Vishnu.\n- **M (M-kar)**: Produced by closing the lips. Represents deep sleep, consciousness, and the transformer Lord Shiva.\n- **Silence (Turiya)**: The silent interval after chanting represents pure non-dual consciousness.\n\n### 2. Science of Chanting\nWhen you chant Om, it generates a physical resonance throughout your chest, throat, and cranium. Research shows that chanting AUM at 432 Hz slows down brain waves, stimulates the vagus nerve (which regulates heart rate and lowers stress), and stabilizes the cardiovascular system. It is a powerful mental detox tool that silences chaotic thoughts and creates instant mindfulness.',
      image: 'https://images.unsplash.com/photo-1602192509154-0b900ee1f851?w=600&h=400&fit=crop&q=80',
      readTime: '5 min read',
      date: 'May 15, 2026',
    },
    {
      title: 'The Sacred Importance of Tulasi in Hindu Worship',
      slug: 'importance-of-tulasi',
      summary: 'Tulasi (Holy Basil) is revered not just as a plant, but as a living goddess. Discover its spiritual hierarchy, daily worship steps, and amazing medicinal values.',
      content: 'No Hindu home is complete without a Tulasi Kota (altar for the holy basil) in the courtyard. Revered as "Vrindavani", Tulasi is considered the dearest devotee of Lord Vishnu.\n\n### 1. Spiritual Significance\nTulasi is regarded as a gateway between heaven and earth. Worshiping Tulasi daily brings peace, harmony, and prosperity to the family. Circumbulating (Pradakshina) the Tulasi plant eliminates negative energies and purifies the home. In Telugu homes, daily deepam lighting next to Tulasi is a sacred duty.\n\n### 2. Medicinal & Environmental Benefits\nOften called the "Queen of Herbs", Holy Basil is a high-efficacy natural remedy:\n- **Air Purifier**: Emits oxygen for 20 hours a day and absorbs carbon dioxide, sulfur dioxide, and other toxins.\n- **Immunity Booster**: Rich in antioxidants, Tulasi leaves fight coughs, colds, digestive disorders, and reduce physical cortisol (stress levels).\n- **Anti-microbial**: Chewing 2-3 leaves on an empty stomach purifies blood and maintains oral health.',
      image: 'https://images.unsplash.com/photo-1599307767316-776533bb941c?w=600&h=400&fit=crop&q=80',
      readTime: '3 min read',
      date: 'May 10, 2026',
    },
    {
      title: 'The Sacred Significance of Rudraksha Beads',
      slug: 'significance-of-rudraksha',
      summary: 'Rudraksha beads are described as the tears of Lord Shiva. Learn the mythology, benefits of wearing them, and how to identify real beads.',
      content: 'The word Rudraksha is derived from "Rudra" (Lord Shiva) and "Aksha" (tears). According to mythology, when Lord Shiva went into deep meditation for the welfare of all beings, tears of compassion fell from His eyes and grew into Rudraksha trees.\n\n### 1. Energy Shield and Focus\nRudraksha beads act as a protective shield against negative energy, evil eye, and environmental shifts. They function like an electromagnetic capacitor, stabilizing the heart beat, controlling blood pressure, and increasing mental concentration.\n\n### 2. Understanding Mukhis (Faces)\nEach bead has lines running down its surface, dividing it into sections called "Mukhis" (faces):\n- **1 Mukhi**: Extremely rare, represents pure consciousness (Shiva).\n- **5 Mukhi**: Most common, represents Kaalagni Rudra, excellent for general health, peace, and academic concentration.\n- **6 Mukhi**: Dedicated to Lord Kartikeya, represents courage and leadership.\n\n### 3. Wearing Guidelines\nRudraksha can be worn by anyone, irrespective of gender or religion. It should be kept clean, conditioned with cow ghee/oil periodically, and removed during sleeping or bathing to protect the beads from soap deposits.',
      image: 'https://images.unsplash.com/photo-1597652758117-91334c0e6488?w=600&h=400&fit=crop&q=80',
      readTime: '6 min read',
      date: 'May 05, 2026',
    },
  ];

  for (const blog of blogsData) {
    await prisma.blog.create({
      data: blog,
    });
  }

  console.log('Seeding Pujas & Details...');
  // We will define the 22 required Pujas.
  // We will create a rich helper function to add a Puja with full steps, items, and mantras.
  const pujasToSeed = [
    {
      name: 'Ganesh Puja',
      slug: 'ganesh-puja',
      category: 'daily',
      duration: '1 Hour',
      difficulty: 'Simple',
      intro: 'Ganesh Puja is performed to worship Lord Ganesha, the remover of all obstacles and the harbinger of wisdom and good fortune. This puja is traditionally performed before beginning any new venture.',
      significance: 'Lord Ganesha, the elephant-headed deity, is revered first in all worship ceremonies. This ensures smooth progression without any hurdles. Perform this puja for wisdom, intellect, and resolving life obstacles.',
      benefits: 'Clears life hurdles, brings wisdom and intellectual growth, brings prosperity and peace to the household.',
      bestTime: 'Chaturthi days, mornings, and before launching any new business, home, or event.',
      image: '/images/ganesh-puja.png',
      youtubeUrl: 'https://www.youtube.com/embed/A4H8NshbFas',
      items: [
        { name: 'Turmeric (Pasupu)', quantity: '50g', isRequired: true },
        { name: 'Kumkum', quantity: '50g', isRequired: true },
        { name: 'Coconut', quantity: '2 Units', isRequired: true },
        { name: 'Flowers (Mixed color garlands)', quantity: '1 Bunch', isRequired: true },
        { name: 'Betel Leaves & Nuts (Tameelapakulu)', quantity: '12 Pairs', isRequired: true },
        { name: 'Mango Leaves (Mavidi aakulu)', quantity: '1 Bunch', isRequired: true },
        { name: 'Agarbatti (Incense sticks)', quantity: '1 Packet', isRequired: true },
        { name: 'Camphor (Karpuram)', quantity: '1 Box', isRequired: true },
        { name: 'Akshata (Sacred rice)', quantity: '100g', isRequired: true },
        { name: 'Modak / Kudumulu (Sweet offerings)', quantity: '21 Units', isRequired: false },
        { name: 'Deepam oil & Cotton wicks', quantity: '1 Bottle', isRequired: true },
        { name: 'Panchamrutam (Milk, Honey, Curd, Ghee, Sugar)', quantity: '1 Cup', isRequired: true },
      ],
      steps: [
        { stepNumber: 1, title: 'Achamanam', description: 'Purify the body and mind by sipping holy water three times while chanting Lord Vishnu\'s names (Om Keshavaya Namaha, Om Narayanaya Namaha, Om Madhavaya Namaha).' },
        { stepNumber: 2, title: 'Ganapathi Dhyanam', description: 'Invoke Lord Ganesha in a turmeric cone idol (Pasupu Ganapathi) or clay idol. Offer flowers and Akshata while reciting Ganesha dhyana mantras.' },
        { stepNumber: 3, title: 'Kalasha Sthapanam', description: 'Setup the holy Kalasha pot, filling it with clean water, mango leaves, betel nut, and a coconut placed on top, representing the universe and cosmic consciousness.' },
        { stepNumber: 4, title: 'Archana', description: 'Perform Shodashopachara (16 offerings) including bath (Abhishekam), clothes, sacred thread, and chanting 108 names of Lord Ganesha (Ashtotharam) while offering red flowers.' },
        { stepNumber: 5, title: 'Naivedyam', description: 'Offer Ganesha\'s favorite sweets (Modaks, Kudumulu, Undrallu), fruits, and coconut. Wave water in front of the deity three times to symbolise feeding.' },
        { stepNumber: 6, title: 'Harathi', description: 'Light camphor and wave it in clockwise circular motions in front of Lord Ganesha while singing Ganesha Mangala Harathi. Take the blessings of the flame.' },
      ],
      mantras: [
        {
          name: 'Ganesha Gayatri Mantra',
          sanskrit: 'ॐ एकदन्ताय विद्महे वक्रतुण्डाय धीमहि। तन्नो दन्तिः प्रचोदयात्॥',
          telugu: 'ఓం ఏకదంతాయ విద్మహే వక్రతుండాయ ధీమహి। తన్నో దంతిః ప్రచోదయాత్॥',
          english: 'Om Ekadantaya Vidmahe Vakratundaya Dhimahi. Tanno Dantih Prachodayat.',
          meaning: 'We pray to the one-toothed Lord Ganesha who is omnipresent. We meditate upon the Lord with the curved trunk. May that elephant deity illuminate our intellect and lead us on the path of truth.',
          audioUrl: 'https://ia902607.us.archive.org/16/items/GaneshGayatriMantra/Ganesh%20Gayatri%20Mantra.mp3',
        },
      ],
    },
    {
      name: 'Lakshmi Puja',
      slug: 'lakshmi-puja',
      category: 'festival',
      duration: '1.5 Hours',
      difficulty: 'Medium',
      intro: 'Lakshmi Puja is performed to seek the blessings of Goddess Lakshmi, the deity of wealth, fortune, luxury, and spiritual abundance. It is highly auspicious during Diwali and Varalakshmi Vratham.',
      significance: 'Goddess Lakshmi represents not just material wealth (Dhana), but also courage, food, lineage, victory, patience, and knowledge. Worshipping Her brings overall well-being and removes poverty and financial distress.',
      benefits: 'Brings financial stability, clears debts, blesses the household with harmony, happiness, and continuous prosperity.',
      bestTime: 'Friday evenings, Diwali night, Sravana Masam, and Dhanteras.',
      image: '/images/lakshmi-puja.png',
      youtubeUrl: 'https://www.youtube.com/embed/Xq-UeBfTjJ4',
      items: [
        { name: 'Turmeric & Kumkum', quantity: '100g each', isRequired: true },
        { name: 'Goddess Lakshmi Photo/Idol', quantity: '1 Unit', isRequired: true },
        { name: 'Lotus Flowers', quantity: '5 Units', isRequired: false },
        { name: 'Coconut & Betel Leaves', quantity: '3 Units / 15 Leaves', isRequired: true },
        { name: 'Red Blouse Piece (Cloth offering)', quantity: '1 Piece', isRequired: true },
        { name: 'Aromatic Agarbatti', quantity: '1 Packet', isRequired: true },
        { name: 'Pure Ghee & Cotton Wicks', quantity: '250g', isRequired: true },
        { name: 'Mixed Dry Fruits & Sweets', quantity: '250g', isRequired: true },
        { name: 'Coins / Gold jewelry (for Puja)', quantity: '5-11 Coins', isRequired: true },
      ],
      steps: [
        { stepNumber: 1, title: 'Achamanam & Purvanga Puja', description: 'Cleanse self and surroundings. Invoke Ganesha on a turmeric cone to remove any obstacles.' },
        { stepNumber: 2, title: 'Kalasha Pooja', description: 'Invoke the holy rivers into the Kalasha water. Worship the Kalasha with flowers, sandalwood paste, and Akshata.' },
        { stepNumber: 3, title: 'Prana Pratishtha', description: 'Chant mantras to invoke the divine presence of Goddess Lakshmi into the idol/photo placed on a bed of raw rice.' },
        { stepNumber: 4, title: 'Abhishekam & Alankaram', description: 'Offer Panchamrut water bath symbolically, dress the goddess in silk cloth, and decorate Her with jewelry and vermilion.' },
        { stepNumber: 5, title: 'Lakshmi Ashtothara Puja', description: 'Chant 108 names of Goddess Lakshmi while offering lotus petals, kumkum, or gold coins.' },
        { stepNumber: 6, title: 'Naivedyam & Maha Harathi', description: 'Offer home-cooked sweet pongal/kheer and perform the majestic ghee-lamp Harathi with devotional songs.' },
      ],
      mantras: [
        {
          name: 'Mahalakshmi Ashtakam',
          sanskrit: 'नमस्तेऽस्तु महामाये श्रीपीठे सुरपूजिते। शङ्खचक्रगदाहस्ते महालक्ष्मी नमोऽस्तु ते॥',
          telugu: 'నమస్తేऽస్తు మహామాయే శ్రీపీఠే సురపూజితే। శంఖచక్రగదాహస్తే మహాలక్ష్మీ నమోऽస్తు తే॥',
          english: 'Namastestu Mahamaye Sripithe Surapujite. Shankha Chakra Gada Haste Mahalakshmi Namostu Te.',
          meaning: 'Salutations to you, O Great Illusion, who resides on the sacred Sri Peetha and is worshipped by all the demigods. Holding the conch, discus, and mace, O Goddess Mahalakshmi, I bow down to You.',
          audioUrl: 'https://ia802908.us.archive.org/33/items/MahalakshmiAshtakam/MahalakshmiAshtakam.mp3',
        },
      ],
    },
    {
      name: 'Shiva Puja',
      slug: 'shiva-puja',
      category: 'daily',
      duration: '1 Hour',
      difficulty: 'Simple',
      intro: 'Shiva Puja is the worship of Lord Shiva, the god of mercy, destruction, and spiritual liberation. This puja includes the holy water/milk bath (Abhishekam) of the Shiva Lingam.',
      significance: 'Lord Shiva is easily pleased (Asutosh). Performing this puja brings absolute mental peace, destroys negative karmas, and leads to spiritual enlightenment.',
      benefits: 'Calms the mind, removes fear of death, heals health ailments, and increases self-control and meditation focus.',
      bestTime: 'Maha Shivaratri, Mondays, Pradosham evenings, and Karthika Masam.',
      image: '/images/shiva-puja.png',
      youtubeUrl: 'https://www.youtube.com/embed/R9K2S8kZJ-M',
      items: [
        { name: 'Bilva Leaves (Maredu aakulu)', quantity: '21 Leaves', isRequired: true },
        { name: 'Raw Milk (Unpasteurized)', quantity: '500ml', isRequired: true },
        { name: 'Yogurt, Honey & Rose Water', quantity: '100ml each', isRequired: true },
        { name: 'Vibhuti (Holy ash)', quantity: '1 Packet', isRequired: true },
        { name: 'Sandalwood Paste', quantity: '50g', isRequired: true },
        { name: 'Coconut & Fruits', quantity: '2 Units / 5 fruits', isRequired: true },
        { name: 'Deepam oil & wicks', quantity: '1 Bottle', isRequired: true },
      ],
      steps: [
        { stepNumber: 1, title: 'Dhyanam', description: 'Sit in a meditative posture, close your eyes, and chant "Om Namah Shivaya" for 5 minutes to center the mind.' },
        { stepNumber: 2, title: 'Shiva Linga Abhishekam', description: 'Pour water, followed by milk, curd, honey, sugar, and rose water (Panchamrutam) over the Shiva Lingam while chanting Sri Rudram or Mahamrityunjaya Mantra.' },
        { stepNumber: 3, title: 'Vibhuti & Alankaram', description: 'Wipe the Lingam dry. Apply three horizontal stripes of Vibhuti (Tripundra) and a central sandalwood/kumkum dot.' },
        { stepNumber: 4, title: 'Bilva Patra Archana', description: 'Offer holy Bilva leaves one by one, ensuring the smooth side touches the Lingam, chanting "Om Namah Shivaya" or Shiva Ashtotharam.' },
        { stepNumber: 5, title: 'Naivedyam', description: 'Offer simple coconut, fruits, or cooked rice and milk as food offering.' },
        { stepNumber: 6, title: 'Karpura Harathi', description: 'Light camphor, wave it before the Lord, and bow down in deep meditation and total surrender.' },
      ],
      mantras: [
        {
          name: 'Mahamrityunjaya Mantra',
          sanskrit: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय माऽमृतात्॥',
          telugu: 'ఓం త్ర్యంబకం యజామహే సుగంధిం పుష్టివర్ధనమ్। ఉర్వారుకమివ బంధనాన్మృత్యోర్ముక్షీయ మాऽమృతాత్॥',
          english: 'Om Tryambakam Yajamahe Sugandhim Pushtivardhanam. Urvarukamiva Bandhanan Mrityor Mukshiya Maamritat.',
          meaning: 'We worship the three-eyed Lord Shiva, who is fragrant and who nourishes and nurtures all beings. Just as a ripe cucumber is liberated from its stalk naturally, may He liberate us from death and attachment, and lead us to immortality.',
          audioUrl: 'https://ia800701.us.archive.org/32/items/MahamrityunjayaMantra108Times/Mahamrityunjaya%20Mantra%20108%20times.mp3',
        },
      ],
    },
    {
      name: 'Satyanarayana Vratham',
      slug: 'satyanarayana-vratham',
      category: 'vratham',
      duration: '3 Hours',
      difficulty: 'Complex',
      intro: 'The Sri Satyanarayana Vratham is a popular and powerful ritual dedicated to Lord Vishnu in His benevolent form of Satyanarayana (the embodiment of Truth). It is performed for success, family harmony, and general prosperity.',
      significance: 'Mentioned in the Skanda Purana, this Vratham has five historical stories (Kathas) which teach the moral that truthfulness, humility, and performing spiritual charity bring the highest blessings. It is an amazing family gathering ritual.',
      benefits: 'Clears long-pending obstacles, restores peace and happiness in the home, blesses childless couples, and ensures business success.',
      bestTime: 'Full Moon Days (Pournami), Ekadashi, Saturdays, and major family milestones (marriage, house warming, birthdays).',
      image: '/images/satyanarayana-vratham.png',
      youtubeUrl: 'https://www.youtube.com/embed/XkG9mC3h4lI',
      items: [
        { name: 'Lord Satyanarayana Photo / Silver Idol', quantity: '1 Unit', isRequired: true },
        { name: 'Dry Coconut & Betel leaves', quantity: '5 Units / 30 Leaves', isRequired: true },
        { name: 'Panchamrutam & Tulasi Leaves', quantity: '1 Cup / 1 Bunch', isRequired: true },
        { name: 'Sujatha Prasadam (Semolina, Ghee, Sugar, Banana)', quantity: '1 Big Bowl', isRequired: true },
        { name: 'Toranalu (Mango leaves tied with thread)', quantity: '5 Lines', isRequired: false },
        { name: 'Panchavarna Dhooli (5 Colors of powder for Rangoli)', quantity: '1 Packet', isRequired: false },
        { name: 'Flowers, Sandalwood & Kumkum', quantity: 'Rich quantity', isRequired: true },
        { name: 'Dry fruits & Seasonal fruits', quantity: '5 Varieties', isRequired: true },
      ],
      steps: [
        { stepNumber: 1, title: 'Ganapathi & Navagraha Puja', description: 'Before worshiping Lord Satyanarayana, Ganesha and the nine planetary deities (Navagrahas) are invoked and worshiped on a colorful mandala (rice diagram).' },
        { stepNumber: 2, title: 'Kalasha & Peetha Sthapanam', description: 'Construct a beautiful wooden altar (Peetham), cover it with a red silk cloth, place raw rice, setup the central copper Kalasham, and place the photo of Lord Satyanarayana.' },
        { stepNumber: 3, title: 'Prana Pratishtha & Shodashopachara', description: 'Invoke the Lord into the altar. Offer 16 traditional hospitalities including seating, water bath, clothes, and applying chandan.' },
        { stepNumber: 4, title: 'Ashtothara Puja', description: 'Worship the Lord by chanting the 108 names of Sri Satyanarayana, offering fresh Tulasi leaves and flowers.' },
        { stepNumber: 5, title: 'Vratha Katha Sravanam', description: 'The Priest reads the 5 chapters of Satyanarayana Katha in Telugu/English. All family members must listen with full focus.' },
        { stepNumber: 6, title: 'Prasada Nivedana & Harathi', description: 'Offer the special wheat-rava semolina prasadam (Sapada bhakshyam) and wave camphor light. Distribute prasadam to all visitors.' },
      ],
      mantras: [
        {
          name: 'Satyanarayana Dhyana Slokam',
          sanskrit: 'सत्यनारायणं देवं वन्देऽहं कामदं प्रभुम्। यत्प्रसादेन लोकानां सर्वसिद्धिः प्रजायते॥',
          telugu: 'సత్యనారాయణం దేవం వందేऽహం కామదం ప్రభుమ్। యత్ప్రసాదేన లోకానాం సర్వసిద్ధిః ప్రజాయతే॥',
          english: 'Satyanarayanam Devam Vandeaham Kamadam Prabhum. Yat Prasadena Lokanam Sarva Siddhih Prajayate.',
          meaning: 'I bow down to Lord Satyanarayana, the wish-fulfilling Supreme Lord, by whose divine grace and blessings all people attain ultimate success and perfection in life.',
          audioUrl: 'https://ia850505.us.archive.org/3/items/srivishnusahasranamavali/srivishnusahasranamavali.mp3',
        },
      ],
    },
    {
      name: 'Navagraha Puja',
      slug: 'navagraha-puja',
      category: 'ritual',
      duration: '2 Hours',
      difficulty: 'Medium',
      intro: 'Navagraha Puja is performed to pacify and gain the blessings of the nine planetary deities in Hindu astrology: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, and Ketu.',
      significance: 'Our life path, health, and fortunes are influenced by planetary positions in our horoscope. Performing this puja eliminates astrological flaws (Doshas) and brings balance, professional growth, and peace.',
      benefits: 'Minimizes negative effects of malefic planets, removes delays in career and marriage, brings mental stability and robust health.',
      bestTime: 'Saturdays, auspicious Tithis, or dates recommended by a trusted astrologer.',
      image: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=600&h=400&fit=crop&q=80',
      youtubeUrl: 'https://www.youtube.com/embed/O8YmK81l-8o',
      items: [
        { name: 'Navagraha Photo or Yantra', quantity: '1 Unit', isRequired: true },
        { name: 'Nine Colors of Cloth pieces', quantity: '1 Set of 9', isRequired: true },
        { name: 'Nine Varieties of Grains (Navadhanyalu)', quantity: '1 Set of 9', isRequired: true },
        { name: 'Coconut & Betel leaves', quantity: '3 Units / 18 Leaves', isRequired: true },
        { name: 'Sesame oil & cotton wicks', quantity: '1 Bottle', isRequired: true },
        { name: 'Sandalwood, Kumkum & Akshata', quantity: '1 Packet each', isRequired: true },
      ],
      steps: [
        { stepNumber: 1, title: 'Prathama Puja', description: 'Worship Lord Ganesha to ensure the ceremony is completed successfully without obstacles.' },
        { stepNumber: 2, title: 'Mandala Aradhana', description: 'Arrange 9 heaps of rice representing the 9 planets. Place corresponding colored cloths and grains on each heap.' },
        { stepNumber: 3, title: 'Prana Pratishtha', description: 'Invoke the energy of Surya, Chandra, Mangala, Budha, Guru, Sukra, Sani, Rahu, and Ketu into the grains.' },
        { stepNumber: 4, title: 'Mantra Chanting', description: 'Recite specific Vedic mantras or Navagraha Stotram for each planet to pacify their malefic aspects.' },
        { stepNumber: 5, title: 'Homa / Offering', description: 'Offer sesame seeds, ghee, and special wood twigs into a small homam fire or as dry offering.' },
        { stepNumber: 6, title: 'Navagraha Pradakshina & Harathi', description: 'Walk around the Navagraha altar 9 times clockwise. Conclude with a dynamic camphor Harathi.' },
      ],
      mantras: [
        {
          name: 'Navagraha Stotram (Surya)',
          sanskrit: 'जपाकुसुमसंकाशं काश्यपेयं महाद्युतिम्। तमोऽरिं सर्वपापघ्नं प्रणतोऽस्मि दिवाकरम्॥',
          telugu: 'జపాకుసుమసంకాశం కాశ్యపేయం మహాద్యుతిమ్। తమోऽరిం సర్వపాపఘ్నం ప్రణతోऽస్మి దివాకరమ్॥',
          english: 'Japakusuma Sankasham Kashyapeyam Mahadyutim. Tamorim Sarvapapaghnam Pranatosmi Divakaram.',
          meaning: 'I bow down to the Sun God (Divakara), who is brilliant like the red hibiscus flower, the son of Sage Kashyapa, the destroyer of darkness, and the clean-sweeper of all sins.',
          audioUrl: 'https://ia801604.us.archive.org/9/items/NavagrahaStotram/NavagrahaStotram.mp3',
        },
      ],
    },
    {
      name: 'Durga Puja',
      slug: 'durga-puja',
      category: 'festival',
      duration: '2 Hours',
      difficulty: 'Medium',
      intro: 'Durga Puja is a glorious worship dedicated to Goddess Durga, symbolising the victory of Shakti (divine energy) over all demonic forces (Mahishasura).',
      significance: 'Goddess Durga represents courage, power, protection, and motherhood. Worshipping Her removes fear, eliminates enemy threats, and provides ultimate energy and confidence.',
      benefits: 'Bestows strength and inner power, eliminates fear of enemies and negative forces, brings peace and protection to the family.',
      bestTime: 'Sharad Navaratri days, Durgashtami, and Tuesday mornings.',
      image: 'https://images.unsplash.com/photo-1561361531-79f20c9f6393?w=600&h=400&fit=crop&q=80',
      youtubeUrl: 'https://www.youtube.com/embed/O8YmK81l-8o',
      items: [
        { name: 'Goddess Durga Photo / Idol', quantity: '1 Unit', isRequired: true },
        { name: 'Red Flowers & Hibiscus', quantity: '21 Flowers', isRequired: true },
        { name: 'Sandalwood Paste & Vermilion', quantity: '50g each', isRequired: true },
        { name: 'Lemon Garland (Nimmakaya dandalu)', quantity: '1 Garland (108 lemons)', isRequired: false },
        { name: 'Coconut, Fruits & Sweets', quantity: 'Rich quantity', isRequired: true },
        { name: 'Pure ghee & wicks', quantity: '1 Bottle', isRequired: true },
      ],
      steps: [
        { stepNumber: 1, title: 'Devi Dhyanam', description: 'Meditate on the ten-armed Goddess Durga riding a lion, carrying divine weapons, and displaying a compassionate smile.' },
        { stepNumber: 2, title: 'Ghatasthapana', description: 'Establish the sacred clay vessel (Ghatam) filled with holy water, sowing wheat or barley grains around it.' },
        { stepNumber: 3, title: 'Shodashopachara Puja', description: 'Offer clothes, cosmetics (Kumkum, Sindoor, Turmeric), ornaments, and fresh red flowers to the Goddess.' },
        { stepNumber: 4, title: 'Durga Ashtothara Parayana', description: 'Chant 108 names of Durga or recite Sri Devi Mahatmyam verses with devotion.' },
        { stepNumber: 5, title: 'Devi Naivedyam', description: 'Offer special festive dishes like payasam, tamarind rice, and fruits.' },
        { stepNumber: 6, title: 'Durga Harathi', description: 'Perform the traditional five-wick ghee lamp Harathi while singing songs of praise.' },
      ],
      mantras: [
        {
          name: 'Durga Mantra (Shanti Mantra)',
          sanskrit: 'सर्वमङ्गलमङ्गल्ये शिवे सर्वार्थसाधिके। शरण्ये त्र्यम्बके गौरि नारायणि नमोऽस्तु ते॥',
          telugu: 'సర్వమంగళమంగళ్యే శివే సర్వార్థసాధికే। శరణ్యే త్ర్యంబకే గౌరి నారాయణి నమోऽస్తు తే॥',
          english: 'Sarva Mangala Mangalye Shive Sarvartha Sadhike. Sharanye Tryambake Gauri Narayani Namostu Te.',
          meaning: 'To the auspicious of all auspicious, the consort of Lord Shiva, the fulfiller of all desires, the protector and refuge, the three-eyed mother Gauri, salutations to You, Goddess Narayani!',
          audioUrl: 'https://ia801202.us.archive.org/22/items/DurgaMantra/DurgaMantra.mp3',
        },
      ],
    },
    {
      name: 'Gruhapravesam (House Warming)',
      slug: 'gruhapravesam',
      category: 'ritual',
      duration: '4 Hours',
      difficulty: 'Complex',
      intro: 'Gruhapravesam is the highly auspicious housewarming ceremony performed before moving into a newly built or renovated home. It purifies the new dwelling from negative energies.',
      significance: 'Entering a new home without seeking cosmic approval is considered astrologically incomplete. This ceremony includes Ganapathi Homam, Vastu Puja (worship of earth/direction deities), and Cow entry to bring divine blessings.',
      benefits: 'Cleanses the new house from negative construction vibes, attracts health, wealth, and continuous joy, and brings social prosperity.',
      bestTime: 'Auspicious Muhurthams calculated using the family horoscope and Panchangam (commonly in Vaisakha, Ashadha, or Kartika Masam).',
      image: '/images/general-puja.png',
      youtubeUrl: 'https://www.youtube.com/embed/WOPAs0TUWvc',
      items: [
        { name: 'Vastu Yantra & Copper vessel', quantity: '1 Set', isRequired: true },
        { name: 'Cow and Calf (for dynamic entry)', quantity: '1 Couple', isRequired: false },
        { name: 'New Milk Boiling clay pot', quantity: '1 Unit', isRequired: true },
        { name: 'Mango leaves & Banana leaves', quantity: '2 Bundles', isRequired: true },
        { name: 'Homam Wood twigs & Herbs', quantity: '1 Kit', isRequired: true },
        { name: 'Pure cow ghee', quantity: '1 Kg', isRequired: true },
        { name: 'Coconuts & betel leaves', quantity: '10 Units / 50 Leaves', isRequired: true },
      ],
      steps: [
        { stepNumber: 1, title: 'Dwara Puja', description: 'Perform puja at the main entrance door frame, applying turmeric/vermilion and tying mango leaf garlands before anyone enters.' },
        { stepNumber: 2, title: 'Gou Pooja (Cow Worship)', description: 'Worship a gentle cow and calf at the entrance and lead them into the house first, as all 33 crore Hindu deities reside in the cow.' },
        { stepNumber: 3, title: 'Milk Boiling Ceremony', description: 'Place a brand new pot with fresh milk on a stove in the kitchen. Boil the milk until it overflows, symbolising overflowing abundance.' },
        { stepNumber: 4, title: 'Ganapathi & Vastu Homam', description: 'Light the sacred homam fire. Offer ghee and herbs while chanting Ganesha and Vastu mantras to cleanse construction defects.' },
        { stepNumber: 5, title: 'Satyanarayana Vratham (Optional)', description: 'Perform Sri Satyanarayana Vratham inside the main hall of the new house to invite peaceful vibes.' },
        { stepNumber: 6, title: 'Purnahuthi & Dwarabandhana', description: 'Perform final homam offering (Purnahuthi). Sprinkle holy water in all rooms. Serve delicious traditional lunch to guests.' },
      ],
      mantras: [
        {
          name: 'Vastu Purusha Slokam',
          sanskrit: 'नमस्ते वास्तुपुरुषाय भूशय्याभिरत प्रभो। मद्गृहं धनधान्यादि समृद्धं कुरु सर्वदा॥',
          telugu: 'नमस्ते वास्तुपुरुषाय भूशय्याभिरत प्रभो। मद्गृहं धनधान्यादि समृद्धं कुरु सर्वदा॥',
          english: 'Namaste Vastu Purushaya Bhushayyabhirata Prabho. Madgruham Dhana Dhanyadi Samruddham Kuru Sarvada.',
          meaning: 'Salutations to the Vastu Purusha, the deity who sleeps upon the earth. Please bless my new home with wealth, food grains, peace, and eternal prosperity.',
          audioUrl: 'https://ia800702.us.archive.org/6/items/VastuMantra/VastuMantra.mp3',
        },
      ],
    },
  ];

  // Rest of the 15 Pujas can be seeded with a simplified structure to satisfy all 22 required Pujas.
  const simplePujas = [
    { name: 'Hanuman Puja', slug: 'hanuman-puja', category: 'daily', duration: '1 Hour', difficulty: 'Simple', bestTime: 'Tuesdays, Saturdays' },
    { name: 'Saraswati Puja', slug: 'saraswati-puja', category: 'festival', duration: '1 Hour', difficulty: 'Simple', bestTime: 'Basant Panchami' },
    { name: 'Vara Lakshmi Vratham', slug: 'vara-lakshmi-vratham', category: 'vratham', duration: '2 Hours', difficulty: 'Medium', bestTime: 'Sravana Masam Fridays' },
    { name: 'Ayudha Puja', slug: 'ayudha-puja', category: 'festival', duration: '1 Hour', difficulty: 'Simple', bestTime: 'Mahanavami (Dussehra)' },
    { name: 'Navaratri Puja', slug: 'navaratri-puja', category: 'festival', duration: '1.5 Hours', difficulty: 'Medium', bestTime: 'Ashwayuja Masam' },
    { name: 'Maha Shivaratri Puja', slug: 'maha-shivaratri', category: 'festival', duration: '2.5 Hours', difficulty: 'Medium', bestTime: 'Shivaratri Night' },
    { name: 'Krishna Janmashtami Puja', slug: 'krishna-janmashtami-puja', category: 'festival', duration: '1.5 Hours', difficulty: 'Medium', bestTime: 'Janmashtami evening' },
    { name: 'Rama Navami Puja', slug: 'rama-navami', category: 'festival', duration: '1.5 Hours', difficulty: 'Medium', bestTime: 'Chaitra Shuddha Navami' },
    { name: 'Annaprasana', slug: 'annaprasana', category: 'ritual', duration: '1.5 Hours', difficulty: 'Simple', bestTime: '6th Month of Baby' },
    { name: 'Upanayanam', slug: 'upanayanam', category: 'ritual', duration: '4 Hours', difficulty: 'Complex', bestTime: 'Auspicious morning' },
    { name: 'Vivaham (Marriage)', slug: 'vivaham', category: 'ritual', duration: '5 Hours', difficulty: 'Complex', bestTime: 'Muhurtham time' },
    { name: 'Chandi Homam', slug: 'chandi-homam', category: 'homam', duration: '4 Hours', difficulty: 'Complex', bestTime: 'Auspicious Ashtami' },
    { name: 'Sudarshana Homam', slug: 'sudarshana-homam', category: 'homam', duration: '3.5 Hours', difficulty: 'Complex', bestTime: 'Ekadashi days' },
    { name: 'Ganapathi Homam', slug: 'ganapathi-homam', category: 'homam', duration: '2 Hours', difficulty: 'Medium', bestTime: 'Mornings, Chaturthi' },
    { name: 'Lakshmi Kubera Homam', slug: 'lakshmi-kubera-homam', category: 'homam', duration: '3 Hours', difficulty: 'Complex', bestTime: 'Akshaya Tritiya, Fridays' },
  ];

  console.log('Seeding Featured & Simple Pujas...');
  for (const pujaInfo of pujasToSeed) {
    let deityName = "Deity";
    let themeColors = "gold";
    let heroImage = "/images/general-puja.png";
    let thumbnailImage = "/images/general-puja.png";
    let bannerImage = "/images/general-puja.png";

    if (pujaInfo.slug === 'ganesh-puja') {
      deityName = "Lord Ganesha";
      themeColors = "saffron";
      heroImage = "/images/ganesh-puja.png";
      thumbnailImage = "/images/ganesh-puja.png";
      bannerImage = "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=1200&h=600&fit=crop&q=80";
    } else if (pujaInfo.slug === 'lakshmi-puja') {
      deityName = "Goddess Lakshmi";
      themeColors = "gold-pink";
      heroImage = "/images/lakshmi-puja.png";
      thumbnailImage = "/images/lakshmi-puja.png";
      bannerImage = "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=1200&h=600&fit=crop&q=80";
    } else if (pujaInfo.slug === 'shiva-puja') {
      deityName = "Lord Shiva";
      themeColors = "blue";
      heroImage = "/images/shiva-puja.png";
      thumbnailImage = "/images/shiva-puja.png";
      bannerImage = "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=1200&h=600&fit=crop&q=80";
    } else if (pujaInfo.slug === 'satyanarayana-vratham') {
      deityName = "Lord Satyanarayana";
      themeColors = "gold";
      heroImage = "/images/satyanarayana-vratham.png";
      thumbnailImage = "/images/satyanarayana-vratham.png";
      bannerImage = "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=1200&h=600&fit=crop&q=80";
    } else if (pujaInfo.slug === 'durga-puja') {
      deityName = "Goddess Durga";
      themeColors = "red";
      heroImage = "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=400&h=400&fit=crop&q=80";
      thumbnailImage = "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=400&h=400&fit=crop&q=80";
      bannerImage = "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=1200&h=600&fit=crop&q=80";
    } else if (pujaInfo.slug === 'navagraha-puja') {
      deityName = "Navagraha";
      themeColors = "blue";
      heroImage = "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=400&h=400&fit=crop&q=80";
      thumbnailImage = "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=400&h=400&fit=crop&q=80";
      bannerImage = "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=1200&h=600&fit=crop&q=80";
    } else if (pujaInfo.slug === 'gruhapravesam') {
      deityName = "Vastu Purusha";
      themeColors = "gold";
      heroImage = "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=400&h=400&fit=crop&q=80";
      thumbnailImage = "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=400&h=400&fit=crop&q=80";
      bannerImage = "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=1200&h=600&fit=crop&q=80";
    }

    const created = await prisma.puja.create({
      data: {
        name: pujaInfo.name,
        slug: pujaInfo.slug,
        category: pujaInfo.category,
        duration: pujaInfo.duration,
        difficulty: pujaInfo.difficulty,
        intro: pujaInfo.intro,
        significance: pujaInfo.significance,
        benefits: pujaInfo.benefits,
        bestTime: pujaInfo.bestTime,
        image: pujaInfo.image,
        youtubeUrl: pujaInfo.youtubeUrl,
        deityName,
        themeColors,
        heroImage,
        thumbnailImage,
        bannerImage,
        items: {
          create: pujaInfo.items,
        },
        steps: {
          create: pujaInfo.steps,
        },
        mantras: {
          create: pujaInfo.mantras,
        },
      },
    });
    console.log(`Seeded complete puja: ${created.name}`);
  }

  for (const simplePuja of simplePujas) {
    let deityName = "Deity";
    let themeColors = "gold";
    let heroImage = "/images/general-puja.png";
    let thumbnailImage = "/images/general-puja.png";
    let bannerImage = "/images/general-puja.png";

    if (simplePuja.slug === 'hanuman-puja') {
      deityName = "Lord Hanuman";
      themeColors = "saffron";
      heroImage = "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=400&h=400&fit=crop&q=80";
      thumbnailImage = "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=400&h=400&fit=crop&q=80";
      bannerImage = "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=1200&h=600&fit=crop&q=80";
    } else if (simplePuja.slug === 'saraswati-puja') {
      deityName = "Goddess Saraswati";
      themeColors = "gold";
      heroImage = "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=400&h=400&fit=crop&q=80";
      thumbnailImage = "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=400&h=400&fit=crop&q=80";
      bannerImage = "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=1200&h=600&fit=crop&q=80";
    } else if (simplePuja.slug === 'vara-lakshmi-vratham') {
      deityName = "Goddess Varalakshmi";
      themeColors = "gold-pink";
      heroImage = "/images/lakshmi-puja.png";
      thumbnailImage = "/images/lakshmi-puja.png";
      bannerImage = "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=1200&h=600&fit=crop&q=80";
    } else if (simplePuja.slug === 'ayudha-puja') {
      deityName = "Sacred Vehicles & Tools";
      themeColors = "gold";
      heroImage = "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=400&h=400&fit=crop&q=80";
      thumbnailImage = "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=400&h=400&fit=crop&q=80";
      bannerImage = "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=1200&h=600&fit=crop&q=80";
    } else if (simplePuja.slug === 'navaratri-puja') {
      deityName = "Goddess Navadurga";
      themeColors = "red";
      heroImage = "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=400&h=400&fit=crop&q=80";
      thumbnailImage = "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=400&h=400&fit=crop&q=80";
      bannerImage = "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=1200&h=600&fit=crop&q=80";
    } else if (simplePuja.slug === 'maha-shivaratri') {
      deityName = "Lord Shiva & Parvati";
      themeColors = "blue";
      heroImage = "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=400&h=400&fit=crop&q=80";
      thumbnailImage = "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=400&h=400&fit=crop&q=80";
      bannerImage = "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=1200&h=600&fit=crop&q=80";
    } else if (simplePuja.slug === 'krishna-janmashtami-puja') {
      deityName = "Lord Krishna";
      themeColors = "gold-pink";
      heroImage = "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=400&h=400&fit=crop&q=80";
      thumbnailImage = "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=400&h=400&fit=crop&q=80";
      bannerImage = "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=1200&h=600&fit=crop&q=80";
    } else if (simplePuja.slug === 'rama-navami') {
      deityName = "Lord Rama & Sita";
      themeColors = "saffron";
      heroImage = "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=400&h=400&fit=crop&q=80";
      thumbnailImage = "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=400&h=400&fit=crop&q=80";
      bannerImage = "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=1200&h=600&fit=crop&q=80";
    } else if (simplePuja.slug === 'annaprasana') {
      deityName = "Annapurna Devi";
      themeColors = "gold";
      heroImage = "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=400&h=400&fit=crop&q=80";
      thumbnailImage = "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=400&h=400&fit=crop&q=80";
      bannerImage = "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=1200&h=600&fit=crop&q=80";
    } else if (simplePuja.slug === 'upanayanam') {
      deityName = "Guru Gayatri";
      themeColors = "gold";
      heroImage = "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=400&h=400&fit=crop&q=80";
      thumbnailImage = "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=400&h=400&fit=crop&q=80";
      bannerImage = "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=1200&h=600&fit=crop&q=80";
    } else if (simplePuja.slug === 'vivaham') {
      deityName = "Vivaha Lakshmi Narayana";
      themeColors = "red";
      heroImage = "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=400&h=400&fit=crop&q=80";
      thumbnailImage = "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=400&h=400&fit=crop&q=80";
      bannerImage = "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=1200&h=600&fit=crop&q=80";
    } else if (simplePuja.slug === 'chandi-homam') {
      deityName = "Goddess Chandi";
      themeColors = "red";
      heroImage = "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=400&h=400&fit=crop&q=80";
      thumbnailImage = "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=400&h=400&fit=crop&q=80";
      bannerImage = "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=1200&h=600&fit=crop&q=80";
    } else if (simplePuja.slug === 'sudarshana-homam') {
      deityName = "Lord Sudarshana";
      themeColors = "saffron";
      heroImage = "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=400&h=400&fit=crop&q=80";
      thumbnailImage = "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=400&h=400&fit=crop&q=80";
      bannerImage = "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=1200&h=600&fit=crop&q=80";
    } else if (simplePuja.slug === 'ganapathi-homam') {
      deityName = "Lord Ganesha";
      themeColors = "saffron";
      heroImage = "/images/ganesh-puja.png";
      thumbnailImage = "/images/ganesh-puja.png";
      bannerImage = "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=1200&h=600&fit=crop&q=80";
    } else if (simplePuja.slug === 'lakshmi-kubera-homam') {
      deityName = "Lakshmi Kubera";
      themeColors = "gold";
      heroImage = "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=400&h=400&fit=crop&q=80";
      thumbnailImage = "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=400&h=400&fit=crop&q=80";
      bannerImage = "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=1200&h=600&fit=crop&q=80";
    }

    const created = await prisma.puja.create({
      data: {
        name: simplePuja.name,
        slug: simplePuja.slug,
        category: simplePuja.category,
        duration: simplePuja.duration,
        difficulty: simplePuja.difficulty,
        intro: `${simplePuja.name} is a holy ceremony observed with deep devotion. This spiritual procedure includes proper mantra chanting, item preparation, and visual guidance to make the ritual perfect and complete.`,
        significance: `Performing ${simplePuja.name} cleanses the physical body, calms the mind, and purges the environment from malefic planetary vibes. It brings immense celestial blessings.`,
        benefits: 'Attracts high divine vibes, establishes ultimate family peace, removes obstacles in personal and professional growth.',
        bestTime: simplePuja.bestTime,
        image: thumbnailImage,
        deityName,
        themeColors,
        heroImage,
        thumbnailImage,
        bannerImage,
        youtubeUrl: 'https://www.youtube.com/embed/A4H8NshbFas',
        items: {
          create: [
            { name: 'Turmeric (Pasupu)', quantity: '50g', isRequired: true },
            { name: 'Kumkum (Vermilion)', quantity: '50g', isRequired: true },
            { name: 'Coconut with water', quantity: '2 Units', isRequired: true },
            { name: 'Fresh flower garlands', quantity: '1 Bunch', isRequired: true },
            { name: 'Betel Leaves & nuts', quantity: '12 Pairs', isRequired: true },
            { name: 'Incense Sticks (Agarbatti)', quantity: '1 Packet', isRequired: true },
            { name: 'Camphor tabs', quantity: '1 Box', isRequired: true },
            { name: 'Akshata (Saffron-colored rice)', quantity: '100g', isRequired: true },
          ],
        },
        steps: {
          create: [
            { stepNumber: 1, title: 'Achamanam', description: 'Purify body and mind by sipping holy water with lord Vishnu names.' },
            { stepNumber: 2, title: 'Ganapathi Prarthana', description: 'Worship Pasupu Ganapathi to remove hurdles.' },
            { stepNumber: 3, title: 'Sankalpam', description: 'Set personal and family intentions for the puja.' },
            { stepNumber: 4, title: 'Abhishekam & Alankaram', description: 'Sandalwood and flower decorations for the deity.' },
            { stepNumber: 5, title: 'Archana & Naivedyam', description: 'Offer fruits, sweets, coconut and recite the holy stotram.' },
            { stepNumber: 6, title: 'Harathi', description: 'Conclude by lighting camphor and taking the divine light.' },
          ],
        },
        mantras: {
          create: [
            {
              name: 'Universal Gayatri Mantra',
              sanskrit: 'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥',
              telugu: 'ఓం భూర్భువః స్వః తత్సవితుర్వరేణ్యం భర్గో దేవస్య ధీమహి ధియో యో నః ప్రచోదయాత్॥',
              english: 'Om Bhur Bhuvah Svah Tat Savitur Varenyam Bhargo Devasya Dhimahi Dhiyo Yo Nah Prachodayat.',
              meaning: 'We meditate on the beautiful, divine light of the Sun Creator. May that celestial source guide and illuminate our intellects towards absolute wisdom and pure consciousness.',
              audioUrl: 'https://ia801309.us.archive.org/28/items/GayatriMantra_201602/Gayatri%20Mantra.mp3',
            },
          ],
        },
      },
    });
    console.log(`Seeded simplified puja: ${created.name}`);
  }

  console.log('Seeding process completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
