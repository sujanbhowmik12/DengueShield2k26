export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clean(value, max = 1000) {
  return String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

// -------------------------------------------------------------
// ADVANCED MULTI-INTENT CLINICAL AI AGENT REASONING ENGINE
// Handles varied phrasings, follow-ups, Bengali/English, medical safety
// -------------------------------------------------------------
function getDeepDengueAdvice(query, context, preferredLang, history = []) {
  const q = (query || "").toLowerCase().trim();
  const lastUserMsg = (history.filter(h => h.role === "user").slice(-2)[0]?.text || "").toLowerCase();

  const isBengali = preferredLang === "bn" || /[\u0980-\u09FF]/.test(query) ||
    /(lokkhon|lokhon|bipod|bepod|rokto|osud|kivabe|obostha|jor|mosa|kemon|porikkha|chinho|chinha|shongket|bachbo|khabar|pani|dhab|platelet|school|office|choyache|dhap|aedes|paracetamol|ki korbo)/i.test(q);

  const loc = context.location || "your selected location";
  const score = context.score != null ? context.score + "%" : "moderate";
  const level = context.level || "Moderate";
  const temp = context.temp != null ? context.temp + "°C" : "recent temperatures";
  const rain = context.rain != null ? context.rain + "mm" : "rainfall observations";

  // 1A. Urgent Abdominal Pain & Persistent Vomiting Emergency Protocol
  if (/(abdominal pain|stomach pain|belly pain|persistent vomit|vomiting|পেটব্যথা|পেটে ব্যথা|ক্রমাগত বমি|বমি হচ্ছে)/i.test(q)) {
    return isBengali
      ? "তীব্র পেটব্যথা এবং ২৪ ঘণ্টায় ৩ বারের বেশি ক্রমাগত বমি হওয়া মারাত্মক ডেঙ্গুর প্রধানতম বিপদচিহ্ন (রেড ফ্ল্যাগ), যা শরীরে প্লাজমা লিকেজ ও ডেঙ্গু শক সিন্ড্রোমের ইঙ্গিত দেয়। বিন্দুমাত্র কালবিলম্ব না করে রোগীকে অবিলম্বে নিকটস্থ হাসপাতালের জরুরি বিভাগ বা আইসিইউতে নিয়ে যান। রোগীকে কোনো ব্যথানাশক ওষুধ (অ্যাসপিরিন/আইবুপ্রোফেন) দেবেন না। বমি না করলে হাসপাতালে যাওয়ার পথে ওআরএস বা ডাবের পানি অল্প অল্প করে চুমুক দিয়ে পান করাতে পারেন।"
      : "Severe continuous abdominal pain and persistent vomiting (3 or more times in 24 hours) are critical emergency warning signs of severe dengue, signaling internal plasma leakage and impending dengue shock. Seek immediate emergency hospital care without delay. Never take NSAID painkillers (no Aspirin, Ibuprofen, or Combiflam). If vomiting allows, provide small sips of oral rehydration solution (ORS) on the way to the hospital for urgent IV fluid resuscitation and CBC monitoring.";
  }

  // 1B. Critical Warning Signs / Emergency Triage (All WHO Warning Signs)
  if (/(warning|danger|severe|critical|emergency|bleeding|letharg|drowsy|faint|cold skin|collapse|blood in stool|বিপদ|রক্তক্ষরণ|রক্তবমি|মারাত্মক|জরুরি|অস্থিরতা|bipod|bepod|roktokhoron|chinho|shongket)/i.test(q)) {
    return isBengali
      ? "বিশ্ব স্বাস্থ্য সংস্থা (WHO) অনুসারে মারাত্মক ডেঙ্গুর মূল বিপদচিহ্নগুলো হলো: ১. তীব্র ও ক্রমাগত পেটব্যথা, ২. ২৪ ঘণ্টায় ৩ বারের বেশি ক্রমাগত বমি, ৩. নাক বা মাড়ি দিয়ে রক্তক্ষরণ, রক্তবমি বা কালো মল, ৪. ফুসফুস বা পেটে পানি জমা (প্লাজমা লিকেজ), ৫. চরম দুর্বলতা, অস্থিরতা বা বিভ্রান্তি, এবং ৬. প্লাটিলেট দ্রুত কমার সাথে রক্ত ঘন হয়ে যাওয়া (হেমাটোক্রিট বৃদ্ধি)। এই লক্ষণগুলো সাধারণত ৩ থেকে ৭ দিনের মাথায় জ্বর কমার সময় দেখা দেয় এবং যেকোনো একটি দেখা দিলে অবিলম্বে হাসপাতালে ভর্তি হওয়া বাধ্যতামূলক।"
      : "According to WHO clinical guidelines, the cardinal warning signs of severe dengue include: 1. Severe, continuous abdominal pain, 2. Persistent vomiting (≥3 episodes in 24 hours), 3. Mucosal bleeding (bleeding from gums, nose, blood in vomit, or dark stools), 4. Fluid accumulation (pleural effusion or ascites), 5. Extreme lethargy, restlessness, or confusion, 6. Liver enlargement >2 cm, and 7. Rapid drop in platelet count concurrent with hematocrit rise. These typically manifest during the critical phase as fever subsides. The presence of any warning sign warrants immediate hospital emergency admission.";
  }

  // 1C. Can Dengue Happen Without a Fever? (Afebrile / Atypical Dengue)
  if (/(without a fever|without fever|no fever|afebrile|জ্বর ছাড়া|জ্বর না থাকলে|জ্বর নেই|জ্বর ছাড়াও)/i.test(q)) {
    return isBengali
      ? "হ্যাঁ, ডেঙ্গু উচ্চ জ্বর ছাড়াও হতে পারে, যাকে চিকিৎসাবিজ্ঞানে অ্যাফেব্রাইল (Afebrile) বা এটিপিক্যাল ডেঙ্গু বলা হয়। বিশেষ করে প্রবীণ ব্যক্তি, নবজাতক বা মৃদু সেকেন্ডারি সংক্রমণের ক্ষেত্রে উচ্চ জ্বর নাও থাকতে পারে। এছাড়া ডেঙ্গুর সবচেয়ে সংকটপূর্ণ পর্যায়ে (৩ থেকে ৭ দিনের মাথায়) জ্বর স্বাভাবিক বা কমে যায়, কিন্তু ঠিক তখনই প্লাজমা লিকেজ ও জটিলতার ঝুঁকি সবচেয়ে বেশি থাকে। তাই জ্বর না থাকলেও যদি তীব্র মাথাব্যথা, চোখের পেছনে ব্যথা, চরম দুর্বলতা বা বিপদচিহ্ন থাকে, তবে অবশ্যই ডেঙ্গু ও সিবিসি রক্ত পরীক্ষা করাতে হবে।"
      : "Yes, dengue can occur without a high fever—a condition clinically known as afebrile or atypical dengue. While sudden high fever is the classic hallmark, atypical presentations occur in infants, the elderly, and individuals with secondary infections. Crucially, during the Critical Phase (days 3 to 7), fever naturally breaks and body temperature normalizes, yet this is the exact window when plasma leakage and platelet drops become severe. Therefore, lack of fever does not exclude dengue if retro-orbital pain, body aches, thrombocytopenia, or warning signs are present.";
  }

  // 2. Dangerous Painkillers vs Safe Medication (NSAID safety)
  if (/(aspirin|ibuprofen|diclofenac|naproxen|painkiller|medicine|medication|paracetamol|nurofen|advil|combiflam|disprin|ব্যথানাশক|ওষুধ|ঔষধ|প্যারাসিটামল|osud|tablets?)/i.test(q)) {
    return isBengali
      ? "ডেঙ্গু সন্দেহে কখনোই অ্যাসপিরিন, আইবুপ্রোফেন, ডাইক্লোফেনাক বা কম্বিফ্লাম জাতীয় ব্যথানাশক ওষুধ খাবেন না, কারণ এগুলো রক্তক্ষরণের ঝুঁকি মারাত্মকভাবে বাড়িয়ে দেয়। শুধুমাত্র চিকিৎসকের পরামর্শ অনুযায়ী প্যারাসিটামল সেবন করা নিরাপদ এবং সাথে প্রচুর তরল খাবার খেতে হবে।"
      : "Never take aspirin, ibuprofen, diclofenac, or other NSAID painkillers if dengue is suspected, as they significantly increase internal bleeding risks. Only paracetamol should be used for fever and body aches under medical guidance, paired with abundant hydration and bed rest.";
  }

  // 3. Platelet Count, Normal Range & Transfusion Limits
  if (/(platelet|transfusion|drop|cbc|count|প্লাটিলেট|প্লাটিলেট কত|রক্ত দিতে|প্লাটিলেট কমে|রক্ত দেওয়া)/i.test(q)) {
    return isBengali
      ? "সুস্থ মানুষের স্বাভাবিক প্লাটিলেট সংখ্যা দেড় লাখ থেকে সাড়ে চার লাখ (১৫০,০০০–৪৫০,০০০)। ডেঙ্গুতে প্লাটিলেট ১ লাখের নিচে নামলে নিয়মিত সিবিসি টেস্ট দিয়ে পর্যবেক্ষণ করা উচিত। সক্রিয় রক্তক্ষরণ ছাড়া বা প্লাটিলেট ১০,০০০–২০,০০০-এর নিচে না নামলে সাধারণত প্লাটিলেট বা রক্ত দেওয়ার প্রয়োজন হয় না; তবে চিকিৎসকের নিবিড় পর্যবেক্ষণ বাধ্যতামূলক।"
      : "A normal platelet count ranges from 150,000 to 450,000 per microliter. In dengue, a count dropping below 100,000 requires daily CBC monitoring. Platelet transfusions are typically only required if counts fall below 10,000 to 20,000 or if active mucosal bleeding occurs under strict clinical supervision.";
  }

  // 4. Follow-up / "What should I do?" / "What is next?"
  if (/(what should i do|what to do|next step|ki korbo|এখন কি করব|কী করণীয়|কি করা উচিত)/i.test(q)) {
    if (/fever|jor|symptom|headache/i.test(lastUserMsg)) {
      return isBengali
        ? "জ্বর থাকলে প্রথমত একজন রেজিস্টার্ড চিকিৎসকের পরামর্শ নিন এবং প্রথম ১-৫ দিনের মধ্যে এনএস১ (NS1) রক্ত পরীক্ষা করান। প্রচুর ওআরএস স্যালাইন ও ডাবের পানি পান করুন, সম্পূর্ণ বিশ্রামে থাকুন এবং অ্যাসপিরিন বা আইবুপ্রোফেন খাওয়া থেকে বিরত থাকুন।"
        : "For suspected fever, consult a physician promptly and schedule an NS1 antigen blood test within the first 1 to 5 days. Ensure continuous oral rehydration with ORS and coconut water, take strict bed rest, and avoid any NSAID painkillers.";
    }
    return isBengali
      ? "ডেঙ্গু ব্যবস্থাপনা মূলত পর্যাপ্ত হাইড্রেশন, পর্যাপ্ত বিশ্রাম এবং নিয়মিত রক্ত পরীক্ষার ওপর নির্ভরশীল। কোনো বিপদচিহ্ন দেখা দিলে সঙ্গে সঙ্গে হাসপাতালে যান।"
      : "Dengue management focuses on maintaining hydration with fluids, strict bed rest, and daily blood counts. If warning signs appear, seek emergency medical care immediately.";
  }

  // 5. Diagnostic Tests (NS1 vs IgM vs CBC)
  if (/(test|testing|diagnosis|ns1|igm|igg|cbc|blood test|lab|difference between|পরীক্ষা|রক্ত পরীক্ষা|টেস্ট|এনএস১|আইজিএম|পার্থক্য|porikkha)/i.test(q)) {
    return isBengali
      ? "ডেঙ্গু এনএস১ (NS1) অ্যান্টিজেন টেস্ট এবং আইজিএম (IgM) অ্যান্টিবডি টেস্টের মূল পার্থক্য হলো এগুলো কী শনাক্ত করে এবং জ্বরের কোন সময়ে পরীক্ষা করা কার্যকর:\n১. এনএস১ (NS1) অ্যান্টিজেন টেস্ট: এটি সরাসরি ডেঙ্গু ভাইরাসের 'নন-স্ট্রাকচারাল প্রোটিন ১' নামক ভাইরাল প্রোটিন শনাক্ত করে। জ্বরের প্রথম ১ থেকে ৫ দিনের মধ্যে (তীব্র ফেজ) এই টেস্টটি সবচেয়ে কার্যকর ও সংবেদনশীল।\n২. আইজিএম (IgM) অ্যান্টিবডি টেস্ট: এটি ভাইরাসের বিরুদ্ধে শরীরের রোগ প্রতিরোধ ব্যবস্থা থেকে তৈরি হওয়া অ্যান্টিবডি শনাক্ত করে। রক্তে অ্যান্টিবডি তৈরি হতে সময় লাগে, তাই এটি সাধারণত জ্বরের ৫ দিন পার হওয়ার পর নির্ভরযোগ্য ফলাফল দেয়।\nক্লিনিক্যাল নিয়ম: জ্বরের ১-৫ দিনে NS1 টেস্ট এবং ৫ দিনের বেশি হলে IgM টেস্ট করানো হয়; সাথে প্রতিদিন সিবিসি (CBC) টেস্ট করে প্লাটিলেট ও হেমাটোক্রিট পর্যবেক্ষণ আবশ্যক।"
      : "The key differences between the Dengue NS1 Antigen test and IgM Antibody test are what they detect and their diagnostic timing:\n1. NS1 Antigen Test: Detects Non-Structural Protein 1, a viral antigen released directly by replicating dengue virus. It is the gold standard during the acute Febrile Phase (Days 1 to 5 of fever) before antibodies develop.\n2. IgM Antibody Test: Detects immunoglobulin M antibodies produced by the patient's own immune system in response to the virus. IgM levels only become detectable from Day 5 onwards as viral load decreases.\nClinical Practice: For fever lasting 1–5 days, clinicians order NS1 Antigen alongside a CBC. For fever lasting more than 5 days, an IgM antibody test is indicated to confirm recent infection.";
  }

  // 6. Diet, Hydration, Coconut Water, Food, Papaya Leaf
  if (/(food|diet|eat|drink|coconut|water|saline|ors|papaya|nutrition|fluid|খাবার|পানি|জল|ডাব|ডাবের পানি|স্যালাইন|পেঁপে পাতা|ফল|khabar|pani|dhab|pepe|খাওয়া উচিত)/i.test(q)) {
    return isBengali
      ? "ডেঙ্গু রোগীর জন্য সঠিক খাবার ও তরল গ্রহণ অত্যন্ত গুরুত্বপূর্ণ:\n১. প্রচুর তরল ও ইলেক্ট্রোলাইট: প্রতিদিন কমপক্ষে ৩ লিটার তরল পান করুন। বিশেষ করে ডাবের পানি (প্রাকৃতিক ইলেক্ট্রোলাইট ও পটাশিয়াম জোগায়), ওআরএস স্যালাইন, পাতলা ডাল, লেবুর শরবত ও ভেজিটেবল স্যুপ ডিহাইড্রেশন ও শক প্রতিরোধে কার্যকর ভূমিকা রাখে।\n২. সহজে হজমযোগ্য পুষ্টিকর খাবার: নরম খিচুড়ি, জাউ ভাত, সেদ্ধ ডিম ও সেদ্ধ নরম সবজি খান, যাতে পরিপাকতন্ত্রে চাপ না পড়ে।\n৩. ফলমূল: বেদানা, পেঁপে, কমলা ও মাল্টা ভিটামিন সি ও অ্যান্টিঅক্সিডেন্ট সরবরাহ করে। গবেষণায় দেখা গেছে পেঁপে পাতার নির্যাস প্লাটিলেট সুরক্ষায় কিছুটা সহায়ক হতে পারে।\n৪. বর্জনীয়: অতিরিক্ত তেল-মশলাযুক্ত খাবার, ভাজাপোড়া ও জাঙ্ক ফুড সম্পূর্ণ বর্জন করুন। এবং কখনোই অ্যাসপিরিন বা আইবুপ্রোফেনযুক্ত ওষুধ খাবেন না।"
      : "Optimal nutrition and hydration during dengue recovery focus on:\n1. Intensive Oral Hydration: Drink 2.5 to 3 liters of fluids daily. Tender coconut water (rich in potassium and electrolytes), Oral Rehydration Solution (ORS), clear vegetable or chicken broths, and fresh lemon water help maintain intravascular volume and prevent plasma leakage shock.\n2. Easily Digestible High-Protein Foods: Soft khichdi, rice porridge, soft-boiled eggs, and steamed vegetables supply sustained energy without digestive strain.\n3. Nutrient-Rich Fruits: Pomegranate, ripe papaya, kiwi, and citrus fruits deliver vital antioxidants and vitamin C. Papaya leaf extract has demonstrated supportive platelet benefits in clinical trials.\n4. Strictly Avoid: Oily, deep-fried, or heavily spiced foods, caffeine, sodas, and never take NSAID painkillers (Aspirin/Ibuprofen).";
  }

  // 7. Early Symptoms & Common Dengue Symptoms
  if (/(early symptom|initial symptom|first symptom|symptom|signs?|fevers?|headaches?|rash|ache|body pain|joint|eye pain|retro|break-bone|লক্ষণ|জ্বর|মাথাব্যথা|ব্যথা|র‍্যাশ|গা ব্যথা|চোখ লাল|প্রাথমিক লক্ষণ|lokkhon|lokhon|jor|betha)/i.test(q)) {
    return isBengali
      ? "ডেঙ্গুর প্রাথমিক লক্ষণগুলো সাধারণত সংক্রমিত মশার কামড়ের ৪ থেকে ১০ দিন পর শুরু হয়। এর প্রধান লক্ষণ হলো হঠাৎ তীব্র জ্বর (১০৪°F পর্যন্ত), তীব্র মাথাব্যথা, চোখের পেছনে গভীর ব্যথা (রেট্রো-অরবিটাল পেইন), মাংসপেশি ও হাড়ের জোড়ে প্রচণ্ড ব্যথা ('হাড়ভাঙা জ্বর'), বমি ভাব এবং ত্বকে লালচে র‍্যাশ। এই অবস্থায় কখনোই অ্যাসপিরিন বা আইবুপ্রোফেন খাওয়া যাবে না; প্রচুর ওআরএস ও ডাবের পানি পান করতে হবে এবং প্রথম ১-৫ দিনের মধ্যে এনএস১ (NS1) রক্ত পরীক্ষা করাতে হবে।"
      : "Early symptoms of dengue typically begin 4 to 10 days after an infective mosquito bite, marking the acute Febrile Phase (Days 1–5). The hallmark early sign is a sudden high fever (often reaching 104°F / 40°C), accompanied by severe frontal headache, retro-orbital eye pain (sharp aching behind the eyes), intense joint and muscle aches ('break-bone fever'), nausea, loss of appetite, and a flushed skin rash. Immediate hydration with ORS and avoiding NSAID painkillers are critical from day one.";
  }

  // 8. Bathing, Cold Shower & Sponge Bath
  if (/(bath|sponge|shower|cold water|গোসল|স্পঞ্জ|গোসল করা|গা মোছা|gosol)/i.test(q)) {
    return isBengali
      ? "উচ্চ জ্বরের সময় রোগীকে বরফ-ঠান্ডা পানিতে গোসল করানো যাবে না; এর পরিবর্তে স্বাভাবিক ঘরের তাপমাত্রার পানিতে ভেজা সুতি কাপড় দিয়ে বারবার গা মুছে (টিপিড স্পঞ্জিং) দিন। জ্বর কমে গেলে স্বাভাবিক হালকা গরম পানিতে আরামদায়ক গোসল করা যায়।"
      : "Never use cold or ice baths to lower a high fever, as this induces shivering and raises internal body temperature. Use lukewarm or room-temperature sponge baths (tepid sponging) instead. Once the fever breaks, a gentle lukewarm shower is safe.";
  }

  // 9. Can I go to School / Office / Work?
  if (/(school|college|office|work|job|play|go out|travel|স্কুল|অফিস|কাজে যেতে|বাইরে যেতে|স্কুলে যাওয়া)/i.test(q)) {
    return isBengali
      ? "ডেঙ্গু চলাকালীন কখনোই স্কুল বা অফিসে যাওয়া উচিত নয়। এই সময় সম্পূর্ণ শারীরিক বিশ্রাম অত্যন্ত জরুরি, অন্যথায় অভ্যন্তরীণ জটিলতা বাড়তে পারে। এছাড়াও আক্রান্ত অবস্থায় মশারি টাঙিয়ে বিশ্রামে থাকা প্রয়োজন, যাতে রোগীকে কোনো এডিস মশা কামড়ে পরিবারের অন্যদের মধ্যে ভাইরাস ছড়াতে না পারে।"
      : "You should not attend school, college, or work with active dengue fever. Strict physical bed rest is essential to prevent internal complications. Resting under a mosquito net also prevents mosquitoes from biting you and transmitting the virus to classmates or family members.";
  }

  // 10. Is Dengue Contagious / Direct Transmission
  if (/(contagious|spread from person|touch|saliva|airborne|cough|kiss|छूने|ছোঁয়াচে|ছড়ায়|একজন থেকে আরেকজন|choyache|shongkramok)/i.test(q)) {
    return isBengali
      ? "ডেঙ্গু কোনো ছোঁয়াচে রোগ নয়; এটি মানুষের স্পর্শ, হাঁচি-কাশি, শ্বাসপ্রশ্বাস বা একসাথে খেলে একজন থেকে অন্যজনে ছড়ায় না। ডেঙ্গু শুধুমাত্র ভাইরাস বহনকারী স্ত্রী এডিস মশার কামড়ের মাধ্যমেই ছড়ায়।"
      : "Dengue is NOT directly contagious between people; it cannot spread through physical touch, coughing, breathing, or sharing food. It is transmitted exclusively through the bite of an infected female Aedes mosquito.";
  }

  // 11. Mosquito Biting Time, Habits & Flight
  if (/(when bite|biting time|mosquito habit|fly height|aedes|color|stripe|breed|মশা কখন কামড়ায়|মশার সময়|কত উঁচুতে|উড়তে|কখন কামড়ায়|mosa kokhon)/i.test(q)) {
    return isBengali
      ? "ডেঙ্গু ছড়ানো এডিস মশা সাধারণত কালো রঙের হয় এবং গায়ে সাদা দাগ বা ডোরাকাটা থাকে। এরা প্রধানত দিনের বেলা—বিশেষ করে সূর্যোদয়ের পর প্রথম ২ ঘণ্টা এবং সূর্যাস্তের পূর্বের কয়েক ঘণ্টায় বেশি কামড়ায়। এরা পরিষ্কার জমে থাকা পানিতে ডিম পাড়ে।"
      : "Aedes mosquitoes (characterized by white stripes on their legs) are daytime biters, peaking in activity early in the morning shortly after sunrise and late in the afternoon before sunset. They breed in clean, stagnant water containers and rarely fly higher than a few floors.";
  }

  // 12. Prevention, Stagnant Water & Repellents
  if (/(prevent|protect|bite|mosquito|standing water|drain|repellent|net|spray|প্রতিরোধ|মশা|পানি|আটকানো|protirodh|bachbo|bachar|mosa)/i.test(q)) {
    return isBengali
      ? "ডেঙ্গু প্রতিরোধে বাড়ির ছাদ, ব্যালকনি বা ঘরের ফুলের টব, কুলার ও বালতিতে জমে থাকা পানি প্রতি সপ্তাহে অন্তত একবার ফেলে পরিষ্কার করুন। দিনের বেলা বাইরে বের হলে ফুলহাতা পোশাক পরুন, ত্বকে ডিইইটি (DEET) সমৃদ্ধ মসকুইটো রিপেলেন্ট লাগান এবং ঘুমানোর সময় অবশ্যই মশারি ব্যবহার করুন।"
      : "To prevent dengue, eliminate all stagnant clean water from flowerpots, AC trays, and open containers at least weekly. Wear long-sleeved light-colored clothing, apply DEET or Picaridin mosquito repellents, and sleep under insecticide-treated bed nets.";
  }

  // 13. High Risk Groups (Babies, Pregnancy, Elderly, Diabetes)
  if (/(baby|babies|infant|child|children|pregnant|pregnancy|elderly|old|diabetes|বাচ্চা|শিশু|গর্ভবতী|বয়স্ক|ডায়াবেটিস|গর্ভকালীন)/i.test(q)) {
    return isBengali
      ? "গর্ভবতী নারী, নবজাতক ও শিশু, প্রবীণ ব্যক্তি এবং ডায়াবেটিস বা উচ্চ রক্তচাপের রোগীদের ক্ষেত্রে ডেঙ্গু হলে জটিলতার ঝুঁকি সবচেয়ে বেশি থাকে। এদের সামান্য জ্বর বা লক্ষণ দেখা দিলেই কালবিলম্ব না করে শুরুতেই হাসপাতালে বিশেষজ্ঞ চিকিৎসকের পর্যবেক্ষণে রাখা উচিত।"
      : "High-risk groups for severe dengue include infants, pregnant women, the elderly, and individuals with chronic conditions like diabetes or cardiac disease. They require immediate medical evaluation and close hospital monitoring at the earliest onset of symptoms.";
  }

  // 14. Dengue Strains & Second Infection
  if (/(strain|serotype|type|second time|dengue again|আবার ডেঙ্গু|দ্বিতীয়বার|স্ট্রেন|serotypes)/i.test(q)) {
    return isBengali
      ? "ডেঙ্গু ভাইরাসের মোট ৪টি সেরোটাইপ বা স্ট্রেন রয়েছে (DENV-1 থেকে DENV-4)। একবার এক স্ট্রেনে আক্রান্ত হলে সেই নির্দিষ্ট স্ট্রেনের বিরুদ্ধে আজীবন প্রতিরোধ ক্ষমতা তৈরি হয়; কিন্তু পরবর্তীতে অন্য কোনো স্ট্রেন দ্বারা পুনরায় আক্রান্ত হলে মারাত্মক ডেঙ্গু (DHF) হওয়ার ঝুঁকি বহুগুণ বেড়ে যায়।"
      : "There are four distinct dengue virus serotypes (DENV-1 through DENV-4). Infection with one serotype provides lifelong immunity against that specific strain, but secondary infection with a different serotype carries a significantly higher risk of severe dengue hemorrhagic fever.";
  }

  // 15. Dengue Stages and Timeline
  if (/(stage|phase|timeline|duration|how long|days|কতদিন থাকে|কতদিন জ্বর|ধাপ|কয়টি ধাপ|সুস্থ হতে কতদিন|koto din)/i.test(q)) {
    return isBengali
      ? "ডেঙ্গু সাধারণত ৩টি ধাপে বিভক্ত: প্রথমত ফেব্রাইল বা জ্বরের ধাপ (১-৩ দিন), দ্বিতীয়ত ক্রিটিক্যাল বা সংকটপূর্ণ ধাপ (৩-৭ দিন, যখন জ্বর কমে কিন্তু প্লাজমা লিকেজের ঝুঁকি সবচেয়ে বেশি থাকে), এবং তৃতীয়ত সুস্থতার ধাপ (৭-১০ দিন)। বেশিরভাগ রোগী ১০ দিনের মধ্যে সুস্থ হয়ে ওঠেন।"
      : "Dengue progresses through three clinical phases: Febrile Phase (days 1–3 with high fever), Critical Phase (days 3–7, where plasma leakage risk peaks as fever subsides), and Recovery Phase (days 7–10). Most patients recover within 10 days, though mild fatigue can linger.";
  }

  // 16. Current Selected Location & Climate Context
  if (/(location|weather|puri|kolkata|delhi|risk|suitability|climate|situation|cases|অবস্থা|আবহাওয়া|ঝুঁকি|পুরী|কলকাতা|পরিস্থিতি|obostha|abohawa)/i.test(q)) {
    return isBengali
      ? `${loc}-এর বর্তমান আবহাওয়া পর্যবেক্ষণ অনুযায়ী ক্লাইমেট সুইটেবিলিটি সূচক হলো ${score} (${level})। সাম্প্রতিক তাপমাত্রা ${temp} এবং সঞ্চিত বৃষ্টিপাত ${rain}। এই পরিবেশগত উপাদানগুলো মশার প্রজননের অনুকূল পরিবেশ তৈরি করে, তাই স্থানীয় সতর্কতা মেনে চলা জরুরি।`
      : `For ${loc}, the current environmental suitability index for mosquito breeding is ${score} (${level}), with recorded temperature at ${temp} and 30-day rainfall around ${rain}. These climate readings indicate environmental vector suitability; maintain active bite prevention.`;
  }

  // 17. Hospitals & Medical Facilities in West Bengal
  if (/(hospital|doctor|clinic|admission|emergency room|ambulance|bed|icu|হাসপাতাল|ডাক্তার|ভর্তি|নার্সিংহোম|স্বাস্থ্যকেন্দ্র|চিকিৎসক|ইমার্জেন্সি|দাঁড়াবো|ডাক্তার দেখাব|হাসপাতালে)/i.test(q)) {
    return isBengali
      ? "পশ্চিমবঙ্গে ডেঙ্গুর বিশেষায়িত চিকিৎসার জন্য প্রধান রেফারেল কেন্দ্র হলো কলকাতার বেলেঘাটা আইডি অ্যান্ড বিজি হাসপাতাল (ID&BG Hospital, ২৪ ঘণ্টা হেল্পলাইন: +৯১ ৩৩ ২৩৭০ ১২৫১)। এছাড়াও কলকাতা ন্যাশনাল মেডিকেল কলেজ (CNMCH), মেডিকেল কলেজ কলকাতা, এসএসকেএম (SSKM/IPGMER), হাওড়া জেলা হাসপাতাল এবং বারাসাত সরকারি মেডিকেল কলেজ হাসপাতালে সার্বক্ষণিক ডেঙ্গু ট্রায়াজ ও বিশেষায়িত আইসোলেশন ওয়ার্ড চালু রয়েছে।"
      : "For specialized dengue care in West Bengal, the primary nodal referral center is the Infectious Diseases & Beliaghata General Hospital (ID&BG), Kolkata (24x7 Helpline: +91 33 2370 1251). Other 24x7 major tertiary facilities with dedicated dengue wards include Calcutta National Medical College (CNMCH), Calcutta Medical College, SSKM / IPGMER, Howrah District Hospital, and Barasat Government Medical College.";
  }

  // 18. Sample Data / Fictional Patient Records Transparency
  if (/(sample|dummy|demo|fake|real data|patient real|is this real|database|privacy|নমুনা|নকল|আসল ডেঙ্গু|আসল রোগী|ডেমো তথ্য)/i.test(q)) {
    return isBengali
      ? "ডেঙ্গুশিল্ডে প্রদর্শিত রোগীর রেকর্ড ও সার্ভে প্রতিক্রিয়াগুলো বাস্তবসম্মত কিন্তু সম্পূর্ণরূপে ডেমো ও নমুনা রেফারেন্স ডাটা (সিমুলেটেড রেকর্ড), যা রোগীর গোপনীয়তা রক্ষা করে ক্লাস্টার অ্যানালিটিক্স ও জনস্বাস্থ্য ব্যবস্থার কার্যপদ্ধতি প্রদর্শনের জন্য ব্যবহৃত হয়। তবে প্ল্যাটফর্মের হাসপাতাল ও স্বাস্থ্যকেন্দ্রের যোগাযোগের তথ্য বাস্তব এবং যাচাইকৃত।"
      : "DengueShield's individual patient profiles and survey logs are realistic simulated demonstration reference records, clearly labeled as sample data to safeguard patient confidentiality while demonstrating epidemiological surveillance workflows. All listed hospital facilities, addresses, and contacts across West Bengal are real, publicly verified healthcare institutions.";
  }

  // 19. DengueShield Dashboard Features & Data
  if (/(dashboard|feature|tracker|survey|report|data|observatory|statistics|ওয়েবসাইট|ফিচার|ট্র্যাকার|সার্ভে)/i.test(q)) {
    return isBengali
      ? "ডেঙ্গুশিল্ড প্ল্যাটফর্মে আপনি যেকোনো শহরের ৩০ দিনের আবহাওয়াভিত্তিক মশার বিস্তার সূচক, ডাব্লিউএইচও (WHO) নোটিউট, গ্লোবাল ডেঙ্গু অবজারভেটরির কেস রিপোর্ট এবং ক্লাইমেট সিমুলেশন দেখতে পারবেন। যেকোনো স্বাস্থ্য বিষয়ক তথ্যের জন্য আমাকে সরাসরি প্রশ্ন করতে পারেন।"
      : "DengueShield provides real-time environmental climate suitability indices, WHO outbreak notices, Global Dengue Observatory surveillance data, and hypothetical climate simulators. Feel free to ask me any question about dengue symptoms, prevention, or local conditions.";
  }

  // 20. Out-of-Scope (Unrelated question handling)
  if (/(cricket|football|movie|song|poem|recipe|cake|car|stock|bitcoin|crypto|joke|weather tomorrow|code|python|javascript|রাজনীতি|গান|সিনেমা|গল্প)/i.test(q)) {
    return isBengali
      ? "আমি ডেঙ্গুশিল্ড এআই হেলথ এজেন্ট। আমার পরিধি শুধুমাত্র ডেঙ্গু প্রতিরোধ, লক্ষণ, যত্ন, রক্ত পরীক্ষা ও জনস্বাস্থ্য তথ্যের মধ্যে সীমাবদ্ধ। আপনি ডেঙ্গু বা আপনার স্বাস্থ্য সম্পর্কিত যেকোনো প্রশ্ন করতে পারেন।"
      : "I am DengueShield AI Public Health Assistant. My scope is focused specifically on dengue symptoms, emergency warning signs, mosquito prevention, and surveillance. How can I assist you with dengue-related health guidance today?";
  }

  // 21. Natural Context-Aware Fallback
  return isBengali
    ? `আমি ডেঙ্গুশিল্ড এআই হেলথ এজেন্ট। ডেঙ্গুর লক্ষণ, সংকটপূর্ণ বিপদচিহ্ন, সঠিক খাবার ও ওআরএস, প্লাটিলেট পর্যবেক্ষণ, ওষুধ গ্রহণের সতর্কতা কিংবা ${loc}-এর বর্তমান আবহাওয়ার ঝুঁকি সম্পর্কে আপনি যেকোনো প্রশ্ন করতে পারেন—আমি বিস্তারিত পরামর্শ দিতে প্রস্তুত।`
    : `I am your DengueShield AI Public Health Agent. You can ask me about dengue symptoms, emergency warning signs, diet and hydration, platelet counts, safe medications, or the current climate risk in ${loc}. How can I assist your health today?`;
}

// -------------------------------------------------------------
// POST HANDLER: GEMINI AI MULTI-TURN -> ADVANCED CLINICAL AGENT
// -------------------------------------------------------------
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const message = clean(body.message, 1000);
    const location = clean(body.location, 100);
    const state = clean(body.state, 100);
    const country = clean(body.country, 100);
    const language = clean(body.language, 10) || "auto";
    const history = Array.isArray(body.history) ? body.history.slice(-8) : [];
    const userApiKey = clean(body.apiKey || request.headers.get("x-gemini-key"), 120);
    const climate = body.climate && typeof body.climate === "object" ? body.climate : {};

    const context = {
      location: location || "the selected location",
      state,
      country,
      score: climate.suitabilityIndex,
      level: climate.level,
      temp: climate.temperatureC,
      humidity: climate.humidityPercent,
      rain: climate.rainfall30DaysMm,
    };

    const effectiveKey = userApiKey || process.env.GEMINI_API_KEY;

    // 1. Try Google Gemini API with ultra-fast candidate model
    if (effectiveKey && message) {
      const candidateModels = [
        process.env.GEMINI_LIVE_MODEL || "gemini-flash-lite-latest",
        "gemini-flash-latest",
      ];

      const systemInstructionText = [
        "You are DengueShield Spoken AI Public Health Agent. Provide an empathetic, authoritative, medically accurate, and complete response.",
        "Thoroughly answer the user's question with appropriate clinical explanations without cutting off prematurely.",
        "CRITICAL MEDICAL RULES:",
        "1. Never give a definitive diagnosis (state that symptoms can occur with dengue; an NS1 or IgM blood test and clinician evaluation are required).",
        "2. Never prescribe medications or specific dosages.",
        "3. If severe warning signs are mentioned (abdominal pain, persistent vomiting >3 times/day, bleeding from gums/nose/stool, lethargy, breathlessness), advise seeking immediate emergency hospital care.",
        "4. Strictly warn against NSAIDs (Aspirin, Ibuprofen, Diclofenac, Combiflam) due to bleeding risks; only paracetamol under medical supervision.",
        "5. Normal platelet range is 150,000–450,000. Daily CBC monitoring below 100,000. Platelet transfusions are rarely needed unless below 10,000–20,000 or active mucosal bleeding.",
        "6. Emphasize oral hydration (ORS, tender coconut water, clear fluids) and rest.",
        "7. Aedes mosquitoes are daytime biters (peaks morning & late afternoon). Dengue is NOT directly contagious person-to-person.",
        "8. If the user asks an unrelated question (outside dengue, mosquitoes, symptoms, or public health), politely explain that your scope is limited to dengue health guidance.",
        "9. Maintain conversational context: answer follow-up questions directly based on prior turns.",
        "10. Context: Location: " + (location || "N/A") + ", Climate Suitability: " + (context.score != null ? context.score + "%" : "N/A") + ", Temp: " + (context.temp != null ? context.temp + "°C" : "N/A") + ".",
        "11. REAL HOSPITALS IN WEST BENGAL: For hospital inquiries, reference real verified institutions: ID&BG Hospital (Beliaghata, Kolkata - specialized nodal infectious disease facility, 24x7 Helpline: +91 33 2370 1251), CNMCH (Kolkata), Calcutta Medical College, SSKM/IPGMER (Kolkata), Howrah District Hospital, Barasat GMC Hospital (North 24 Parganas), and Jagatballavpur Rural Hospital (Howrah).",
        "12. DEMO DATA TRANSPARENCY: Individual patient surveillance records and survey logs on DengueShield are simulated sample reference data to protect privacy, while hospital facilities, addresses, and helpline contacts are real and verified.",
        "13. LANGUAGE: If the query is in Bengali or Banglish, answer in fluent, empathetic Bengali. If in English, answer in English.",
      ].join("\n");

      // Build Gemini multi-turn contents format
      const formattedContents = [];
      for (const h of history) {
        if (h && h.text && (h.role === "user" || h.role === "model")) {
          formattedContents.push({
            role: h.role === "user" ? "user" : "model",
            parts: [{ text: String(h.text).slice(0, 1000) }],
          });
        }
      }
      formattedContents.push({
        role: "user",
        parts: [{ text: message }],
      });

      for (const model of candidateModels) {
        try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${effectiveKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemInstructionText }] },
              contents: formattedContents,
              generationConfig: { maxOutputTokens: 1200, temperature: 0.5 },
            }),
            signal: AbortSignal.timeout(4500),
          });

          if (response.ok) {
            const data = await response.json();
            const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (candidate && candidate.trim()) {
              return Response.json({
                reply: candidate.trim(),
                provider: "gemini",
                model: model,
                hasKey: true,
              });
            }
          }
        } catch (modelErr) {
          // If timeout or error, continue to next model or instant clinical agent
        }
      }
    }

    // 2. Comprehensive Multi-Intent Clinical AI Agent Engine (Instant, 0ms, Zero Rate Limits)
    const reply = getDeepDengueAdvice(message, context, language, history);
    return Response.json({ reply, provider: "clinical-agent", hasKey: !!effectiveKey });
  } catch (err) {
    return Response.json({
      reply: "I am your DengueShield AI Health Agent. Ask me about dengue symptoms, emergency warning signs, diet and hydration, or your local climate risk.",
      provider: "fallback",
    });
  }
}
