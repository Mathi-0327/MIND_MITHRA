import { SupportedLanguage } from '../types';
import { t } from './translations';

export type TimeOfDaySlot = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';

export interface TimelineGreetingDetails {
  slot: TimeOfDaySlot;
  greetingText: string;
  periodName: string;
  timeRange: string;
  subtext: string;
  routineHint: string;
  voiceOpener: string;
  recommendedCategory: string;
  iconName: 'Sun' | 'SunMedium' | 'Sunset' | 'Moon';
  gradientBg: string;
  badgeBg: string;
  accentBorder: string;
  formattedClock: string;
}

/**
 * Calculates current time-of-day slot based on standard 24-hour clock:
 * - MORNING: 05:00 - 11:59
 * - AFTERNOON: 12:00 - 16:59
 * - EVENING: 17:00 - 20:59
 * - NIGHT: 21:00 - 04:59
 */
export function getCurrentTimeSlot(date: Date = new Date()): TimeOfDaySlot {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) {
    return 'MORNING';
  } else if (hour >= 12 && hour < 17) {
    return 'AFTERNOON';
  } else if (hour >= 17 && hour < 21) {
    return 'EVENING';
  } else {
    return 'NIGHT';
  }
}

/**
 * Returns rich localized time of day greeting metadata, themes, icons, and voice cues.
 */
export function getTimelineGreeting(
  language: SupportedLanguage = 'en',
  customSlot?: TimeOfDaySlot,
  date: Date = new Date()
): TimelineGreetingDetails {
  const slot = customSlot || getCurrentTimeSlot(date);
  
  // Format current live clock in clean 12-hour format
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const formattedClock = `${displayHours}:${minutes} ${ampm}`;

  switch (slot) {
    case 'MORNING': {
      const greeting = t('greeting.morning', language);
      const periodName = t('time.morning', language);
      
      const subtextMap: Record<SupportedLanguage, string> = {
        en: 'A fresh, bright morning! Time for warm tea, soft sunlight, and a cheerful brain exercise.',
        as: 'শুভ সোণালী প্ৰভাত! একাপ গৰম চাহ আৰু মৃদু ৰ’দৰ সৈতে আজিৰ মনৰ কাৰ্যকলাপ আৰম্ভ কৰক।',
        bn: 'এক নতুন মিষ্টি সকাল! এক কাপ গরম চা খেয়ে চলুন আজকের স্মৃতি ব্যায়াম শুরু করি।',
        hi: 'एक सुंदर और ताज़ा सुबह! गर्म चाय के साथ आज की हल्की दिमागी कसरत शुरू करें।',
        mni: 'নুংঙাইরবা অয়ুক! চা থক্লগা ঙসিগী ৱাখলগী থবক হৌসি।',
        kha: 'Ka step ba sngewtynnad! Dih sha khluit bad sdang ka kam jingkynmaw.',
        lus: 'Zinglam nuam tak a ni e! Thingpui in pahin rilru sawizawina tan ang hmiang.',
      };

      const voiceOpenerMap: Record<SupportedLanguage, string> = {
        en: 'Good morning, my dear friend! Wishing you peace, warmth, and joy today.',
        as: 'শুভ প্ৰভাত! আজিৰ দিনটো আপোনাৰ বাবে আনন্দ আৰু শান্তিময় হওক।',
        bn: 'সুপ্রভাত! আশা করি আপনার সকালটি খুব সুন্দর এবং আনন্দময় কাটছে।',
        hi: 'शुभ प्रभात! आपका दिन सुखद, शांत और मंगलमय हो।',
        mni: 'য়ুংথোইবা অয়ুক! ঙসিগী নুমিৎ অসি নুংঙাইবা ওইরসনু।',
        kha: 'Khublei Step! Nga kitbok ia phi ba phin suk mynta ka sngi.',
        lus: 'Chibai Zinglam! Vawiin chu i tan ni duhawm tak lo ni rawh se.',
      };

      return {
        slot: 'MORNING',
        greetingText: greeting,
        periodName,
        timeRange: '5:00 AM – 11:59 AM',
        subtext: subtextMap[language] || subtextMap.en,
        routineHint: 'Morning Tea & Gentle Memory Activity',
        voiceOpener: voiceOpenerMap[language] || voiceOpenerMap.en,
        recommendedCategory: 'Memory & Attention Recall',
        iconName: 'Sun',
        gradientBg: 'from-amber-500 via-orange-500 to-amber-600',
        badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
        accentBorder: 'border-amber-400',
        formattedClock,
      };
    }

    case 'AFTERNOON': {
      const greeting = t('greeting.afternoon', language);
      const periodName = t('time.afternoon', language);

      const subtextMap: Record<SupportedLanguage, string> = {
        en: 'A calm afternoon! Stay well hydrated, relax comfortably, and enjoy some peaceful music.',
        as: 'শান্ত অপৰাহ্ন! অলপ পানী খাওক, জিৰণি লওক আৰু মিঠা সুৰৰ আনন্দ লওক।',
        bn: 'শান্ত দুপুর! পর্যাপ্ত জল খান, বিশ্রাম নিন এবং কিছু মনোরম সুর শুনুন।',
        hi: 'शांत दोपहर! पानी पिएं, आराम से बैठें और मधुर लोक संगीत का आनंद लें।',
        mni: 'নুংঙাইরবা নুমিৎদাং! পোথাবিয়ু অমসুং ঈশৈ তানবিয়ু।',
        kha: 'Ka janmiet ba jah thait! Dih um bad shong thait suk.',
        lus: 'Chhunchaw nuam tak a ni e! Tui in tha la, hahchawl rawh le.',
      };

      const voiceOpenerMap: Record<SupportedLanguage, string> = {
        en: 'Good afternoon! Hope you had a wholesome lunch. Let us spend a relaxing moment together.',
        as: 'শুভ অপৰাহ্ন! দুপৰীয়াৰ আহাৰ নিশ্চয় তৃপ্তিদায়ক হ’ল। আহক অলপ সময় একেলগে কথা পাতোঁ।',
        bn: 'শুভ অপরাহ্ন! আশা করি দুপুরের খাবার ভালো হয়েছে। চলুন একসাথে কিছুটা সময় কাটাই।',
        hi: 'शुभ दोपहर! आशा है आपने दोपहर का भोजन कर लिया होगा। आइए कुछ समय साथ बिताते हैं।',
        mni: 'নুমিৎদাংৱাইৰম শুভ! চাক চাবদা নুংঙাইরমগনি থাজরি।',
        kha: 'Khublei Janmiet! Nga kyrmen ba phi la dep bam ja.',
        lus: 'Chibai Chhunchaw! Chhunchaw i puar em? Inbia ang hmiang.',
      };

      return {
        slot: 'AFTERNOON',
        greetingText: greeting,
        periodName,
        timeRange: '12:00 PM – 4:59 PM',
        subtext: subtextMap[language] || subtextMap.en,
        routineHint: 'Hydration, Relaxation & Calming Melody',
        voiceOpener: voiceOpenerMap[language] || voiceOpenerMap.en,
        recommendedCategory: 'Pattern Match & Visual Association',
        iconName: 'SunMedium',
        gradientBg: 'from-amber-600 via-amber-700 to-orange-700',
        badgeBg: 'bg-orange-100 text-orange-900 border-orange-300',
        accentBorder: 'border-orange-400',
        formattedClock,
      };
    }

    case 'EVENING': {
      const greeting = t('greeting.evening', language);
      const periodName = t('time.evening', language);

      const subtextMap: Record<SupportedLanguage, string> = {
        en: 'The twilight is setting. Time for evening snacks, reminiscing with family, and soothing flute melodies.',
        as: 'মৃদু সন্ধিয়া নামি আহিছে। পৰিয়ালৰ সৈতে স্মৃতি মেল আৰু মন শান্ত কৰা বাঁহীৰ সুৰ শুনক।',
        bn: 'স্নিগ্ধ সন্ধ্যা নেমে এসেছে। পরিবারের সাথে কথা বলুন এবং পুরনো স্মৃতির মধুর গান শুনুন।',
        hi: 'सुहानी शाम का समय है। परिवार की सुखद यादें ताज़ा करें और बाँसुरी की मधुर धुन सुनें।',
        mni: 'নুমিদাংগী মতম ওইরে! ইমুংগী মরমদা নীংশিংসি অমসুং ঈশৈ তানসি।',
        kha: 'Ka janmiet ba sngewbha! Iakren bad ka iing bad sngap jingsur.',
        lus: 'Tlai lam nuam tak a ni e! Chhungkaw thlalak en pahin hla ngai thla ang.',
      };

      const voiceOpenerMap: Record<SupportedLanguage, string> = {
        en: 'Good evening! The sun is gently setting. Would you like to look at family photos or listen to songs?',
        as: 'শুভ সন্ধিয়া! গধূলিৰ এই শান্ত সময়ত পৰিয়ালৰ ছবি চাব নে বাঁহীৰ সুৰ শুনিব?',
        bn: 'শুভ সন্ধ্যা! এই মিষ্টি সন্ধ্যায় পরিবারের অ্যালবাম দেখতে বা গান শুনতে চান?',
        hi: 'शुभ संध्या! शाम का शांत समय है। क्या आप पारिवारिक तस्वीरें देखना या संगीत सुनना चाहेंगे?',
        mni: 'নুমিদাং শুভ! ঈশৈ তানবিয়ু নত্রগা নীংশিংপোৎ য়েংবিয়ু।',
        kha: 'Khublei Mynmiet! Phi kwah ban peit dur ne sngap jingrwai?',
        lus: 'Chibai Tlai lam! Thlalak en nge hla ngaihthlak i duh?',
      };

      return {
        slot: 'EVENING',
        greetingText: greeting,
        periodName,
        timeRange: '5:00 PM – 8:59 PM',
        subtext: subtextMap[language] || subtextMap.en,
        routineHint: 'Family Stories, Reminiscence & Relaxing Music',
        voiceOpener: voiceOpenerMap[language] || voiceOpenerMap.en,
        recommendedCategory: 'Reminiscence & Story Recall',
        iconName: 'Sunset',
        gradientBg: 'from-indigo-700 via-purple-800 to-amber-800',
        badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
        accentBorder: 'border-purple-400',
        formattedClock,
      };
    }

    case 'NIGHT': {
      const greeting = t('greeting.night', language);
      const periodName = t('time.night', language);

      const subtextMap: Record<SupportedLanguage, string> = {
        en: 'Quiet night hours. Take evening medicine, relax your mind with nature rain sounds, and rest peacefully.',
        as: 'শান্ত ৰাত্ৰিৰ নিস্তব্ধ সময়। ঔষধ খাই লওক, মন শান্ত কৰক আৰু আৰামেৰে টোপনি যাওক।',
        bn: 'শান্ত ও নিরাপদ রাত। রাতের ওষুধ নিয়ে মন শান্ত করুন এবং গভীর ঘুমে বিশ্রাম নিন।',
        hi: 'शांत रात्रि का समय। अपनी दवा लें, मन को तनावमुक्त करें और सुखद विश्राम करें।',
        mni: 'শান্ত নুমিদাং! হিদাক চারগা নুংঙাইনা পোথাবিয়ু।',
        kha: 'Ka miet ba jai-jai! Dih dawai bad thiah suk.',
        lus: 'Zan thianghlim tak a ni e! Damdawi ei la, thlamuang takin mu rawh le.',
      };

      const voiceOpenerMap: Record<SupportedLanguage, string> = {
        en: 'Good night! Wishing you serene thoughts and restful sleep. I am always right here if you need me.',
        as: 'শুভ ৰাত্ৰি! আপোনাৰ টোপনি গভীৰ আৰু শান্তিময় হওক। মই সদায় আপোনাৰ কাষতেই আছোঁ।',
        bn: 'শুভ রাত্রি! আপনার ঘুম গভীর ও সুখকর হোক। আমি সবসময় আপনার পাশেই আছি।',
        hi: 'शुभ रात्रि! आपको गहरी और शांत नींद आए। मैं हर पल आपके साथ हूँ।',
        mni: 'নুমিদাং শুভ! নুংঙাইনা পোথাবিয়ু। ঐ অদোমগা লোয়ননা লৈরি।',
        kha: 'Khublei Miet! Suk ba thiah. Nga don ryngkat bad phi.',
        lus: 'Muan taka mut le! Hahchawl tha rawh. I bulah ka awm reng e.',
      };

      return {
        slot: 'NIGHT',
        greetingText: greeting,
        periodName,
        timeRange: '9:00 PM – 4:59 AM',
        subtext: subtextMap[language] || subtextMap.en,
        routineHint: 'Night Medicine, Gentle Breathing & Deep Rest',
        voiceOpener: voiceOpenerMap[language] || voiceOpenerMap.en,
        recommendedCategory: 'Calming Breathing & Sleep Ambient',
        iconName: 'Moon',
        gradientBg: 'from-slate-900 via-indigo-950 to-slate-900',
        badgeBg: 'bg-indigo-900/80 text-indigo-100 border-indigo-700',
        accentBorder: 'border-indigo-500',
        formattedClock,
      };
    }
  }
}
