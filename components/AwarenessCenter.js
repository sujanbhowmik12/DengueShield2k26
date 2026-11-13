"use client";

import { useState } from "react";
import { BookOpen, ChevronDown, ChevronUp, Droplets, Shield, Sparkles, Sun, Thermometer, TriangleAlert } from "lucide-react";

export default function AwarenessCenter() {
  const [lang, setLang] = useState("en"); // "en" or "bn"
  const [openFaq, setOpenFaq] = useState(null);
  const [search, setSearch] = useState("");

  const FAQS_EN = [
    {
      q: "Can dengue spread directly from person to person through touch or coughing?",
      a: "No. Dengue is NOT directly contagious between humans. It cannot spread through physical touch, coughing, saliva, or sharing meals. It is transmitted solely by the bite of an infected female Aedes mosquito.",
    },
    {
      q: "When are Aedes mosquitoes most active and likely to bite?",
      a: "Aedes mosquitoes are daytime biters. Their peak biting activity occurs during early morning hours shortly after sunrise and late afternoon before sunset.",
    },
    {
      q: "Why are painkillers like Aspirin and Ibuprofen strictly prohibited in dengue?",
      a: "Aspirin, Ibuprofen, Diclofenac, and other NSAIDs thin the blood and damage platelets, drastically multiplying internal bleeding and hemorrhagic shock risks. Only paracetamol under clinical guidance should be used.",
    },
    {
      q: "What is the normal platelet count and when is a blood transfusion needed?",
      a: "A healthy platelet count is 150,000 to 450,000 /µL. In dengue, counts dropping below 100,000 need daily CBC monitoring. Platelet transfusions are rarely required unless active bleeding occurs or counts drop below 10,000–20,000 under strict medical oversight.",
    },
    {
      q: "Can a person get dengue fever a second time?",
      a: "Yes. There are 4 distinct virus serotypes (DENV-1 through DENV-4). Infection with one serotype gives lifelong immunity to that specific strain only. A secondary infection with a different strain carries a significantly higher risk of severe dengue (DHF).",
    },
    {
      q: "Does papaya leaf extract cure dengue?",
      a: "While clinical studies have observed that papaya leaf extract can support platelet stability and membrane protection, it is NOT an antiviral cure and should never replace hospital medical care, IV fluids, or clinical supervision.",
    },
  ];

  const FAQS_BN = [
    {
      q: "ডেঙ্গু কি মানুষের স্পর্শ বা হাঁচি-কাশির মাধ্যমে একজন থেকে অন্যজনে ছড়ায়?",
      a: "না। ডেঙ্গু কোনো ছোঁয়াচে রোগ নয়। এটি মানুষের স্পর্শ, হাঁচি-কাশি বা একসাথে খেলে ছড়ায় না। এটি শুধুমাত্র ভাইরাস বহনকারী স্ত্রী এডিস মশার কামড়ের মাধ্যমেই ছড়ায়।",
    },
    {
      q: "এডিস মশা সাধারণত দিনের কোন সময়ে বেশি কামড়ায়?",
      a: "এডিস মশা মূলত দিনের বেলা কামড়ায়। বিশেষ করে সূর্যোদয়ের পর প্রথম ২ ঘণ্টা এবং সূর্যাস্তের পূর্ববর্তী কয়েক ঘণ্টায় এদের কামড়ানোর প্রবণতা সবচেয়ে বেশি থাকে।",
    },
    {
      q: "ডেঙ্গু হলে অ্যাসপিরিন বা আইবুপ্রোফেন খাওয়া কেন সম্পূর্ণ নিষিদ্ধ?",
      a: "অ্যাসপিরিন, আইবুপ্রোফেন, ডাইক্লোফেনাক বা কম্বিফ্লাম জাতীয় ব্যথানাশক ওষুধ রক্ত পাতলা করে এবং প্লাটিলেটের ক্ষতি করে, যার ফলে মারাত্মক অভ্যন্তরীণ রক্তক্ষরণের ঝুঁকি বাড়ে। শুধুমাত্র চিকিৎসকের পরামর্শে প্যারাসিটামল সেবন করা উচিত।",
    },
    {
      q: "স্বাভাবিক প্লাটিলেট মাত্রা কত এবং কখন রক্ত বা প্লাটিলেট দেওয়ার প্রয়োজন হয়?",
      a: "স্বাভাবিক মানুষের প্লাটিলেট সংখ্যা দেড় লাখ থেকে সাড়ে চার লাখ (১৫০,০০০–৪৫০,০০০)। ডেঙ্গুতে ১ লাখের নিচে নামলে প্রতিদিন সিবিসি টেস্ট করা উচিত। রক্তপাত না থাকলে বা মাত্রা ১০,০০০–২০,০০০-এর নিচে না নামলে সাধারণত প্লাটিলেট দিতে হয় না।",
    },
    {
      q: "একবার ডেঙ্গু হলে কি পুনরায় দ্বিতীয়বার ডেঙ্গু হতে পারে?",
      a: "হ্যাঁ। ডেঙ্গুর মোট ৪টি স্ট্রেন রয়েছে (DENV-1 থেকে 4)। এক স্ট্রেনে আক্রান্ত হলে সেই স্ট্রেনের বিরুদ্ধে আজীবন প্রতিরোধ ক্ষমতা তৈরি হয়; কিন্তু অন্য কোনো স্ট্রেন দিয়ে পুনরায় আক্রান্ত হলে মারাত্মক ডেঙ্গু (DHF) হওয়ার ঝুঁকি অনেক বেশি থাকে।",
    },
    {
      q: "পেঁপে পাতার রস কি ডেঙ্গু সম্পূর্ণ নিরাময় করতে পারে?",
      a: "গবেষণায় দেখা গেছে পেঁপে পাতার নির্যাস প্লাটিলেট রক্ষায় কিছুটা সাহায্য করতে পারে, তবে এটি কোনো অ্যান্টিভাইরাল প্রতিষেধক নয় এবং কখনোই হাসপাতালের চিকিৎসা ও স্যালাইনের বিকল্প নয়।",
    },
  ];

  const activeFaqs = lang === "bn" ? FAQS_BN : FAQS_EN;
  const filteredFaqs = activeFaqs.filter(f =>
    f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="section-container">
      <div className="section-header-row">
        <div>
          <span className="card-kicker">PUBLIC HEALTH EDUCATION</span>
          <h2>Dengue Prevention & Awareness Center</h2>
          <p className="section-subtitle">
            Evidence-based educational guidelines on transmission, warning signs, home mosquito control, and patient care.
          </p>
        </div>
        <div className="lang-switcher">
          <button
            type="button"
            className={`lang-btn ${lang === "en" ? "active" : ""}`}
            onClick={() => setLang("en")}
          >
            English
          </button>
          <button
            type="button"
            className={`lang-btn ${lang === "bn" ? "active" : ""}`}
            onClick={() => setLang("bn")}
          >
            বাংলা (Bengali)
          </button>
        </div>
      </div>

      <div className="awareness-grid">
        <div className="edu-card">
          <div className="edu-card-icon blue"><BookOpen size={20} /></div>
          <h3>{lang === "bn" ? "১. এডিস মশার বৈশিষ্ট্য ও বিস্তার" : "1. Vector Biology & Transmission"}</h3>
          <p>
            {lang === "bn"
              ? "এডিস মশা সাধারণত কালো রঙের হয় এবং এর পায়ে ও শরীরে সাদা ডোরাকাটা দাগ থাকে। এরা পরিষ্কার জমে থাকা পানিতে (যেমন ফুলের টব, কুলার, এসির ট্রে, ডাবের খোসা) ডিম পাড়ে। এরা দিনের বেলা কামড়ায় এবং মাটি থেকে খুব উঁচুতে উড়তে পারে না।"
              : "Aedes mosquitoes (Aedes aegypti and albopictus) feature distinctive white stripes on their legs. They breed in clean stagnant water collected in plant trays, AC drains, and open buckets, flying at low heights during daytime hours."}
          </p>
        </div>

        <div className="edu-card">
          <div className="edu-card-icon amber"><Thermometer size={20} /></div>
          <h3>{lang === "bn" ? "২. ডেঙ্গুর ৩টি ক্লিনিক্যাল ধাপ" : "2. The Three Clinical Phases"}</h3>
          <p>
            {lang === "bn"
              ? "১. ফেব্রাইল ধাপ (১-৩ দিন): হঠাৎ তীব্র জ্বর ও মাথাব্যথা। ২. সংকটপূর্ণ ধাপ (৩-৭ দিন): জ্বর কমার সময় প্লাজমা লিকেজের ঝুঁকি সর্বোচ্চ থাকে। ৩. সুস্থতার ধাপ (৭-১০ দিন): শরীর ধীরে ধীরে স্বাভাবিক হয় এবং র‍্যাশ চুলকাতে পারে।"
              : "1. Febrile Phase (Days 1–3): Sudden high fever and joint pain. 2. Critical Phase (Days 3–7): Plasma leakage risk peaks right as fever subsides. 3. Recovery Phase (Days 7–10): General stabilization and appetite restoration."}
          </p>
        </div>

        <div className="edu-card danger-card">
          <div className="edu-card-icon red"><TriangleAlert size={20} /></div>
          <h3>{lang === "bn" ? "৩. মারাত্মক ডেঙ্গুর বিপদচিহ্ন" : "3. Critical Warning Signs (Emergency)"}</h3>
          <p>
            {lang === "bn"
              ? "তীব্র পেটব্যথা, ২৪ ঘণ্টায় ৩ বারের বেশি বমি, মাড়ি বা নাক দিয়ে রক্তক্ষরণ, চরম দুর্বলতা বা অস্থিরতা এবং শ্বাসকষ্ট দেখা দিলে অবিলম্বে রোগীকে হাসপাতালের জরুরি বিভাগে নিয়ে যান। বিন্দুমাত্র সময় নষ্ট করবেন না।"
              : "Immediate hospitalization is required for: severe abdominal pain, persistent vomiting (>3x in 24h), mucosal bleeding from gums/nose, black stools, rapid breathing, and cold, clammy extremities."}
          </p>
        </div>

        <div className="edu-card">
          <div className="edu-card-icon green"><Shield size={20} /></div>
          <h3>{lang === "bn" ? "৪. এডিস মশার প্রজনন ধ্বংস" : "4. Eliminating Breeding Habitats"}</h3>
          <p>
            {lang === "bn"
              ? "সপ্তাহে অন্তত একবার বাড়ির ছাদ, ব্যালকনি ও ঘরের ফুলের টবের ট্রে, কুলারের পানি এবং বালতি সম্পূর্ণ ফেলে শুকিয়ে নিন। ব্যবহৃত ড্রাম ও পানির ট্যাংক শক্ত ঢাকনা দিয়ে বন্ধ রাখুন যাতে মশা ডিম না পাড়তে পারে।"
              : "Empty and scrub flowerpot trays, air cooler tanks, refrigerator drip pans, and open containers weekly. Keep overhead and ground-level water reservoirs tightly sealed to eliminate egg-laying opportunities."}
          </p>
        </div>

        <div className="edu-card">
          <div className="edu-card-icon purple"><Droplets size={20} /></div>
          <h3>{lang === "bn" ? "৫. রোগীর যত্ন ও তরল খাবার" : "5. Hydration & Home Care"}</h3>
          <p>
            {lang === "bn"
              ? "ডিহাইড্রেশন রোধে প্রচুর ডাবের পানি, ওআরএস স্যালাইন, পাতলা ডাল, লেবুর শরবত ও সুষম নরম খাবার দিন। সম্পূর্ণ বিশ্রামে রাখুন এবং অবশ্যই সবসময় মশারি টাঙিয়ে রাখুন যাতে পরিবারের অন্যরা সংক্রমিত না হয়।"
              : "Maintain aggressive oral hydration using oral rehydration solutions (ORS), tender coconut water, and clear soups. Strict bed rest under an insecticide-treated mosquito net is essential to protect other household members."}
          </p>
        </div>

        <div className="edu-card">
          <div className="edu-card-icon blue"><Sun size={20} /></div>
          <h3>{lang === "bn" ? "৬. ব্যক্তিগত সুরক্ষা টিপস" : "6. Personal Protection Measures"}</h3>
          <p>
            {lang === "bn"
              ? "দিনের বেলা ফুলহাতা জামা ও লম্বা প্যান্ট পরুন। বাইরে বের হলে ত্বকে ডিইইটি (DEET) বা পিকারিডিন যুক্ত মসকুইটো রিপেলেন্ট ব্যবহার করুন। ঘরের জানালায় তারের নেট লাগান।"
              : "Wear loose, light-colored, long-sleeved clothing. Apply insect repellents containing DEET, Picaridin, or Oil of Lemon Eucalyptus to exposed skin, and ensure window mesh screens are well-maintained."}
          </p>
        </div>
      </div>

      <div className="faq-section">
        <div className="faq-header">
          <h3>{lang === "bn" ? "সাধারণ জিজ্ঞাসা (FAQs)" : "Frequently Asked Questions"}</h3>
          <input
            type="text"
            className="faq-search"
            placeholder={lang === "bn" ? "প্রশ্ন খুঁজুন…" : "Search questions…"}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="faq-list">
          {filteredFaqs.map((faq, i) => (
            <div key={i} className={`faq-item ${openFaq === i ? "open" : ""}`}>
              <button
                type="button"
                className="faq-question"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span>{faq.q}</span>
                {openFaq === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {openFaq === i && <div className="faq-answer">{faq.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
