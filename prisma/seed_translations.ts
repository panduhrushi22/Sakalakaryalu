import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting multi-language translations database seeding...');

  // 1. FETCH MAIN PUJAS
  const ganesh = await prisma.puja.findUnique({ where: { slug: 'ganesh-puja' }, include: { items: true, mantras: true } });
  const lakshmi = await prisma.puja.findUnique({ where: { slug: 'lakshmi-puja' }, include: { items: true, mantras: true } });
  const shiva = await prisma.puja.findUnique({ where: { slug: 'shiva-puja' }, include: { items: true, mantras: true } });
  const satyanarayana = await prisma.puja.findUnique({ where: { slug: 'satyanarayana-vratham' }, include: { items: true, mantras: true } });
  const gruhapravesam = await prisma.puja.findUnique({ where: { slug: 'gruhapravesam' }, include: { items: true, mantras: true } });

  // --- A. GANESH PUJA TRANSLATIONS ---
  if (ganesh) {
    console.log('Seeding translations for Ganesh Puja...');
    await prisma.pujaTranslation.upsert({
      where: { pujaId_languageCode: { pujaId: ganesh.id, languageCode: 'te' } },
      update: {},
      create: {
        pujaId: ganesh.id,
        languageCode: 'te',
        name: 'వినాయక చవితి పూజ',
        intro: 'విఘ్నహర్త అయిన వినాయకుడి అనుగ్రహం కొరకు సంప్రదాయ సిద్ధమైన చవితి పూజా విధానం.',
        significance: 'సకల విఘ్నాలను తొలగించి, సత్ఫలితాలను ఇచ్చే ప్రథమ పూజ్యుడైన విఘ్నేశ్వరుడి పూజ ప్రతీ కార్యం విజయవంతం కావడానికి అత్యంత ప్రధానమైనది.',
        benefits: 'విఘ్న నివారణం, విద్యార్థులకు జ్ఞానవృద్ధి, వ్యాపార ప్రగతి, కుటుంబంలో ఐక్యత.',
        bestTime: 'భాద్రపద శుద్ధ చవితి మరియు ప్రతి నెల సంకష్టహర చవితి.',
      },
    });

    await prisma.pujaTranslation.upsert({
      where: { pujaId_languageCode: { pujaId: ganesh.id, languageCode: 'hi' } },
      update: {},
      create: {
        pujaId: ganesh.id,
        languageCode: 'hi',
        name: 'श्री गणेश पूजा',
        intro: 'विघ्नहर्ता भगवान गणेश की अनुग्रह प्राप्ति के लिए शास्त्रोक्त पूजन विधि।',
        significance: 'सभी देवताओं में सबसे पहले पूजे जाने वाले भगवान गणेश का स्मरण और पूजन हर मंगल कार्य की सफलता और विघ्नों के नाश का अचूक उपाय है।',
        benefits: 'बाधाओं का शमन, बुद्धि एवं ज्ञान की वृद्धि, व्यापार में उन्नति, सुख-शांति।',
        bestTime: 'भाद्रपद शुक्ल चतुर्थी (गणेश चतुर्थी) एवं हर माह की संकष्टी चतुर्थी।',
      },
    });

    // Item translations for Ganesh
    for (const item of ganesh.items) {
      const lower = item.name.toLowerCase();
      let teName = item.name;
      let hiName = item.name;

      if (lower.includes('coconut')) { teName = 'కొబ్బరికాయలు'; hiName = 'नारियल'; }
      else if (lower.includes('flower')) { teName = 'పూలమాలలు మరియు పూలు'; hiName = 'पुष्प और माला'; }
      else if (lower.includes('turmeric')) { teName = 'పసుపు'; hiName = 'हल्दी पाउडर'; }
      else if (lower.includes('kumkum')) { teName = 'కుంకుమ'; hiName = 'कुमकुम'; }
      else if (lower.includes('betel')) { teName = 'తమలపాకులు మరియు వక్కలు'; hiName = 'पान के पत्ते और सुपारी'; }
      else if (lower.includes('fruits')) { teName = 'పంచఫలాలు (ఐదు రకాల పండ్లు)'; hiName = 'पंचफल (पांच प्रकार के फल)'; }
      else if (lower.includes('camphor')) { teName = 'కర్పూరం'; hiName = 'कपूर'; }
      else if (lower.includes('incense')) { teName = 'అగరుబత్తీలు'; hiName = 'अगरबत्ती'; }

      await prisma.pujaItemTranslation.upsert({
        where: { itemId_languageCode: { itemId: item.id, languageCode: 'te' } },
        update: {},
        create: { itemId: item.id, languageCode: 'te', name: teName },
      });
      await prisma.pujaItemTranslation.upsert({
        where: { itemId_languageCode: { itemId: item.id, languageCode: 'hi' } },
        update: {},
        create: { itemId: item.id, languageCode: 'hi', name: hiName },
      });
    }

    // Mantra translations for Ganesh
    for (const mantra of ganesh.mantras) {
      await prisma.mantraTranslation.upsert({
        where: { mantraId_languageCode: { mantraId: mantra.id, languageCode: 'te' } },
        update: {},
        create: {
          mantraId: mantra.id,
          languageCode: 'te',
          meaning: 'వక్రతుండ మహాకాయ సూర్యకోటి సమప్రభ... ఓ వినాయకుడా, నా పనులన్నింటినీ ఎల్లప్పుడూ విఘ్నాలు లేకుండా విజయవంతంగా పూర్తి చేయి.',
        },
      });
      await prisma.mantraTranslation.upsert({
        where: { mantraId_languageCode: { mantraId: mantra.id, languageCode: 'hi' } },
        update: {},
        create: {
          mantraId: mantra.id,
          languageCode: 'hi',
          meaning: 'हे टेढ़े सूंड वाले, विशाल शरीर वाले, करोड़ों सूर्यों के समान तेजस्वी देव! मेरे सभी कार्यों को सदा बाधा रहित पूर्ण करें।',
        },
      });
    }
  }

  // --- B. LAKSHMI PUJA TRANSLATIONS ---
  if (lakshmi) {
    console.log('Seeding translations for Lakshmi Puja...');
    await prisma.pujaTranslation.upsert({
      where: { pujaId_languageCode: { pujaId: lakshmi.id, languageCode: 'te' } },
      update: {},
      create: {
        pujaId: lakshmi.id,
        languageCode: 'te',
        name: 'శ్రీ వరలక్ష్మీ వ్రతం',
        intro: 'సకల ఐశ్వర్యాలను, అష్టభోగాలను ప్రసాదించే శ్రీ వరలక్ష్మీ వ్రత విధానము.',
        significance: 'వరలక్ష్మీ వ్రతం ఆచరించడం వల్ల మహాలక్ష్మి సంతోషించి ఇల్లు ధనధాన్యాలతో నిండేలా ఆశీర్వదిస్తుంది.',
        benefits: 'సౌభాగ్య సిద్ధి, అష్టైశ్వర్యములు, సంతాన ప్రాప్తి, దీర్ఘ సుమంగళి యోగం.',
        bestTime: 'శ్రావణ మాసంలో పూర్ణిమకు ముందు వచ్చే రెండవ శుక్రవారము.',
      },
    });

    await prisma.pujaTranslation.upsert({
      where: { pujaId_languageCode: { pujaId: lakshmi.id, languageCode: 'hi' } },
      update: {},
      create: {
        pujaId: lakshmi.id,
        languageCode: 'hi',
        name: 'श्री वरलक्ष्मी व्रत',
        intro: 'सुख, सौभाग्य और अष्टलक्ष्मी की प्राप्ति के लिए वरलक्ष्मी पूजा विधि।',
        significance: 'माता वरलक्ष्मी का व्रत करने से घर में स्थाई लक्ष्मी का वास होता है और सभी दरिद्रता का नाश होता है।',
        benefits: 'धन-धान्य की प्रचुरता, अखंड सौभाग्य, परिवार की दीर्घायु, शांति।',
        bestTime: 'श्रावण मास की पूर्णिमा से ठीक पहले आने वाला शुक्रवार।',
      },
    });

    // Items
    for (const item of lakshmi.items) {
      const lower = item.name.toLowerCase();
      let teName = item.name;
      let hiName = item.name;

      if (lower.includes('coconut')) { teName = 'శ్రీఫలములు (కొబ్బరికాయలు)'; hiName = 'श्रीफल (नारियल)'; }
      else if (lower.includes('flower')) { teName = 'తామర పూలు మరియు తోరాలు'; hiName = 'कमल पुष्प और दूर्वा'; }
      else if (lower.includes('turmeric')) { teName = 'పసుపు కొమ్ములు'; hiName = 'साबुत हल्दी'; }
      else if (lower.includes('kumkum')) { teName = 'కుంకుమ'; hiName = 'सिंदूर/कुमकुम'; }
      else if (lower.includes('sandal')) { teName = 'గంధము'; hiName = 'चंदन पाउडर'; }

      await prisma.pujaItemTranslation.upsert({
        where: { itemId_languageCode: { itemId: item.id, languageCode: 'te' } },
        update: {},
        create: { itemId: item.id, languageCode: 'te', name: teName },
      });
      await prisma.pujaItemTranslation.upsert({
        where: { itemId_languageCode: { itemId: item.id, languageCode: 'hi' } },
        update: {},
        create: { itemId: item.id, languageCode: 'hi', name: hiName },
      });
    }
  }

  // --- C. SHIVA PUJA TRANSLATIONS ---
  if (shiva) {
    console.log('Seeding translations for Shiva Puja...');
    await prisma.pujaTranslation.upsert({
      where: { pujaId_languageCode: { pujaId: shiva.id, languageCode: 'te' } },
      update: {},
      create: {
        pujaId: shiva.id,
        languageCode: 'te',
        name: 'మహా శివరాత్రి అభిషేక పూజ',
        intro: 'సదాశివుని అనుగ్రహం కొరకు ఏకదశ రుద్రాభిషేక పూజా విధానం.',
        significance: 'అభిషేక ప్రియుడైన శంకరుడిని బిల్వపత్రాలు, గంగాజలంతో పూజించడం వల్ల జన్మజన్మల పాపాలు తొలగిపోతాయి.',
        benefits: 'పాప పరిహారం, భయ నివారణ, మోక్ష సిద్ధి, మనఃశ్శాంతి.',
        bestTime: 'కార్తీక మాస సోమవారాలు మరియు మహాశివరాత్రి తిథి.',
      },
    });

    await prisma.pujaTranslation.upsert({
      where: { pujaId_languageCode: { pujaId: shiva.id, languageCode: 'hi' } },
      update: {},
      create: {
        pujaId: shiva.id,
        languageCode: 'hi',
        name: 'महाशिवरात्रि रुद्राभिषेक पूजा',
        intro: 'देवाधिदेव महादेव की प्रसन्नता के लिए रुद्राभिषेक और आराधना विधि।',
        significance: 'भगवान शिव को पंचामृत, गंगाजल और बेलपत्र अर्पित करने से जन्म-जन्मांतर के पापों का क्षय होता है।',
        benefits: 'कालसर्प व ग्रह दोष निवारण, मानसिक शांति, मोक्ष प्राप्ति, स्वास्थ्य लाभ।',
        bestTime: 'श्रावण मास के सोमवार, प्रदोष काल एवं महाशिवरात्रि।',
      },
    });
  }

  // --- D. SATYANARAYANA VRATHAM TRANSLATIONS ---
  if (satyanarayana) {
    await prisma.pujaTranslation.upsert({
      where: { pujaId_languageCode: { pujaId: satyanarayana.id, languageCode: 'te' } },
      update: {},
      create: {
        pujaId: satyanarayana.id,
        languageCode: 'te',
        name: 'శ్రీ సత్యనారాయణ స్వామి వ్రతము',
        intro: 'శ్రీ మహావిష్ణు స్వరూపమైన సత్యనారాయణ స్వామి వ్రతము మరియు కథా విధానము.',
        significance: 'ఈ వ్రతము ఆచరించడం వల్ల కష్టాలు తొలగి, సర్వసుఖాలు పొంది, అంతిమంగా మోక్షం లభిస్తుంది.',
        benefits: 'వ్యాపార అభ్యుదయం, రుణ విముక్తి, కుటుంబ సౌఖ్యం, నిలిచిపోయిన పనులు సాఫీగా సాగడం.',
        bestTime: 'ప్రతినెల పౌర్ణమి రోజున, కార్తీక మాసం, వివాహాది శుభకార్యముల తర్వాత.',
      },
    });

    await prisma.pujaTranslation.upsert({
      where: { pujaId_languageCode: { pujaId: satyanarayana.id, languageCode: 'hi' } },
      update: {},
      create: {
        pujaId: satyanarayana.id,
        languageCode: 'hi',
        name: 'श्री सत्यनारायण व्रत कथा',
        intro: 'भगवान श्री हरि विष्णु के सत्यनारायण रूप की कल्याणकारी व्रत पूजा और कथा विधि।',
        significance: 'कलयुग में भगवान सत्यनारायण की पूजा सबसे फलदायी मानी गई है। इसे करने से दरिद्रता दूर होती है।',
        benefits: 'संकटों का नाश, मनोकामना सिद्धि, पारिवारिक समृद्धि, शांति एवं सौभाग्य।',
        bestTime: 'पूर्णिमा तिथि, कार्तिक मास, या किसी भी शुभ पारिवारिक उत्सव पर।',
      },
    });
  }

  // --- E. GRUHAPRAVESAM TRANSLATIONS ---
  if (gruhapravesam) {
    await prisma.pujaTranslation.upsert({
      where: { pujaId_languageCode: { pujaId: gruhapravesam.id, languageCode: 'te' } },
      update: {},
      create: {
        pujaId: gruhapravesam.id,
        languageCode: 'te',
        name: 'నూతన గృహప్రవేశ మహోత్సవం',
        intro: 'కొత్త ఇంట సుఖశాంతులు కలగడానికి చేసే వాస్తు పూజ మరియు గృహప్రవేశ విధానము.',
        significance: 'నూతన గృహంలోకి ప్రవేశించేటప్పుడు వాస్తు దోషాలను నివారించి, దేవతల అనుగ్రహం సిద్ధించడానికి ఈ పూజ అత్యంత ఆవశ్యకమైనది.',
        benefits: 'వాస్తు దోష నివారణ, దుష్టశక్తి నివారణ, నూతన గృహంలో శుభ శాంతి.',
        bestTime: 'మంచి నక్షత్రం, తిథి కలిగిన శుభ ముహూర్తం మరియు ఉత్తరాయణ పుణ్యకాలం.',
      },
    });

    await prisma.pujaTranslation.upsert({
      where: { pujaId_languageCode: { pujaId: gruhapravesam.id, languageCode: 'hi' } },
      update: {},
      create: {
        pujaId: gruhapravesam.id,
        languageCode: 'hi',
        name: 'नूतन गृह प्रवेश पूजा',
        intro: 'नए घर में सुख, समृद्धि और वास्तु दोष शांति के लिए शास्त्रोक्त गृह प्रवेश अनुष्ठान।',
        significance: 'नए निर्मित भवन में निवास करने से पूर्व वहां की नकारात्मक ऊर्जा को दूर कर देवताओं के स्वागत हेतु यह शांति कर्म किया जाता है।',
        benefits: 'वास्तु शांति, बुरी शक्तियों का नाश, घर में सकारात्मक और दैवीय ऊर्जा का संचार।',
        bestTime: 'उचित तिथि, वार और नक्षत्रों के अनुसार निर्धारित शुभ मुहूर्त।',
      },
    });
  }

  // 2. SEED FESTIVALS TRANSLATIONS
  console.log('Seeding Festival translations...');
  const festivals = await prisma.festival.findMany();
  for (const fest of festivals) {
    const slug = fest.slug;
    let teName = fest.name;
    let teDesc = fest.significance;
    let teRitual = fest.rituals;
    
    let hiName = fest.name;
    let hiDesc = fest.significance;
    let hiRitual = fest.rituals;

    if (slug.includes('ugadi')) {
      teName = 'ఉగాది పండుగ';
      teDesc = 'తెలుగు మరియు కన్నడ ప్రజల నూతన సంవత్సర పర్వదినం.';
      teRitual = 'వేకువజామున అభ్యంగన స్నానం, ఉగాది పచ్చడి సేవనం, పంచాంగ శ్రవణం మరియు తోరణాల అలంకరణ.';
      
      hiName = 'उगादि महोत्सव';
      hiDesc = 'तेलुगु, कन्नड़ और कोंकणी हिंदुओं के नव वर्ष का अत्यंत पवित्र त्यौहार।';
      hiRitual = 'सुबह तेल से स्नान, औषधीय उगादि पचड़ी का सेवन, नए वस्त्र धारण करना एवं पंचांग श्रवण।';
    } else if (slug.includes('sankranti')) {
      teName = 'మకర సంక్రాంతి';
      teDesc = 'సూర్యుడు ధనురాశి నుండి మకర రాశిలోకి ప్రవేశించే గొప్ప ఉత్తరాయణ పుణ్యకాల పండుగ.';
      teRitual = 'భోగి మంటలు, గంగిరెద్దుల ఆటలు, హరిదాసుల కీర్తనలు, పిండి వంటల (అరిసెలు) నైవేద్యం.';

      hiName = 'मकर संक्रांति';
      hiDesc = 'सूर्य के उत्तरायण में प्रवेश और फसल कटाई का प्रमुख अखिल भारतीय त्यौहार।';
      hiRitual = 'पवित्र नदी स्नान, तिल-गुड़ एवं खिचड़ी का दान, गायों की पूजा और पतंगबाजी।';
    } else if (slug.includes('diwali')) {
      teName = 'దీపావళి పర్వదినం';
      teDesc = 'నరకాసుర వధ తర్వాత లక్ష్మీదేవి ఆశీస్సులతో జరుపుకునే వెలుగుల పండుగ.';
      teRitual = 'అభ్యంగన స్నానం, సాయంత్రం లక్ష్మీ కుబేర పూజ, ప్రతీ గుమ్మానికి దీపారాధన మరియు బాణసంచా.';

      hiName = 'दीपावली';
      hiDesc = 'भगवान राम के अयोध्या आगमन और अंधकार पर प्रकाश की विजय का महोत्सव।';
      hiRitual = 'घर की व्यापक सफाई, प्रदोष काल में महालक्ष्मी पूजन, मिट्टी के दीये जलाना और उत्सव मनाना।';
    }

    await prisma.festivalTranslation.upsert({
      where: { festivalId_languageCode: { festivalId: fest.id, languageCode: 'te' } },
      update: {},
      create: { festivalId: fest.id, languageCode: 'te', name: teName, description: teDesc, ritual: teRitual },
    });
    await prisma.festivalTranslation.upsert({
      where: { festivalId_languageCode: { festivalId: fest.id, languageCode: 'hi' } },
      update: {},
      create: { festivalId: fest.id, languageCode: 'hi', name: hiName, description: hiDesc, ritual: hiRitual },
    });
  }

  console.log('✅ Multi-language translations seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('Error during translations seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
