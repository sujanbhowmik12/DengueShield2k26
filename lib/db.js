import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "dengueshield_db.json");

// Realistic, verified public health reference seed data for West Bengal
const INITIAL_DATABASE = {
  "cases": [
    {
      "id": "DS-CASE-1007",
      "patientCode": "PT-1849",
      "age": 78,
      "gender": "Female",
      "location": "debra",
      "district": "debra",
      "state": "West Bengal",
      "country": "India",
      "latitude": 22.5726,
      "longitude": 88.3639,
      "onsetDate": "2026-01-07",
      "reportDate": "2026-11-12",
      "status": "Confirmed",
      "verificationStatus": "Verified",
      "testType": "RT-PCR",
      "plateletCount": 65000,
      "hospitalized": false,
      "hospitalName": "Home Isolation / Local Clinic",
      "actor": "Chief Medical Officer (Admin)"
    },
    {
      "id": "DS-CASE-1006",
      "patientCode": "PT-1766",
      "age": 45,
      "gender": "Male",
      "location": "Barasat",
      "district": "Barasat",
      "state": "West Bengal",
      "country": "India",
      "latitude": 22.5726,
      "longitude": 88.3639,
      "onsetDate": "2026-11-16",
      "reportDate": "2026-11-11",
      "status": "Suspected",
      "verificationStatus": "Rejected",
      "testType": "RT-PCR",
      "plateletCount": 658000,
      "hospitalized": true,
      "hospitalName": "Debra Superspeacility Hsopital",
      "actor": "Chief Medical Officer (Admin)"
    },
    {
      "id": "DS-CASE-1001",
      "patientCode": "DEMO-PT-4901",
      "age": 34,
      "gender": "Male",
      "location": "Beliaghata, Kolkata",
      "district": "Kolkata",
      "state": "West Bengal",
      "country": "India",
      "latitude": 22.5697,
      "longitude": 88.3972,
      "onsetDate": "2026-10-28",
      "reportDate": "2026-10-31",
      "status": "Confirmed",
      "verificationStatus": "Verified",
      "testType": "NS1 Antigen",
      "plateletCount": 84000,
      "hospitalized": true,
      "hospitalName": "Infectious Diseases & B.G. Hospital (ID&BG)",
      "notes": "Sudden high fever (103.8°F), retro-orbital eye pain, arthralgia. Intravenous fluid resuscitation. [DEMO SAMPLE RECORD]",
      "isSample": true
    },
    {
      "id": "DS-CASE-1002",
      "patientCode": "DEMO-PT-4902",
      "age": 26,
      "gender": "Female",
      "location": "Howrah Railway Station Area, Howrah",
      "district": "Howrah",
      "state": "West Bengal",
      "country": "India",
      "latitude": 22.5891,
      "longitude": 88.3308,
      "onsetDate": "2026-11-01",
      "reportDate": "2026-11-03",
      "status": "Confirmed",
      "verificationStatus": "Verified",
      "testType": "IgM ELISA",
      "plateletCount": 112000,
      "hospitalized": false,
      "hospitalName": "Howrah District Hospital OPD",
      "notes": "Persistent myalgia and low-grade fever on day 6. Ambulatory care with oral rehydration. [DEMO SAMPLE RECORD]",
      "isSample": true
    },
    {
      "id": "DS-CASE-1003",
      "patientCode": "DEMO-PT-4903",
      "age": 42,
      "gender": "Male",
      "location": "Jagatballavpur, Howrah",
      "district": "Howrah",
      "state": "West Bengal",
      "country": "India",
      "latitude": 22.6843,
      "longitude": 88.1065,
      "onsetDate": "2026-11-04",
      "reportDate": "2026-11-06",
      "status": "Suspected",
      "verificationStatus": "Pending",
      "testType": "Clinical Diagnosis",
      "plateletCount": 135000,
      "hospitalized": false,
      "hospitalName": "Jagatballavpur Rural Hospital & BPHC",
      "notes": "Breakbone fever symptoms, awaiting confirmation from district pathology unit. [DEMO SAMPLE RECORD]",
      "isSample": true
    },
    {
      "id": "DS-CASE-1004",
      "patientCode": "DEMO-PT-4904",
      "age": 19,
      "gender": "Female",
      "location": "Salt Lake Sector 1, Bidhannagar",
      "district": "North 24 Parganas",
      "state": "West Bengal",
      "country": "India",
      "latitude": 22.5867,
      "longitude": 88.4178,
      "onsetDate": "2026-10-22",
      "reportDate": "2026-10-25",
      "status": "Recovered",
      "verificationStatus": "Verified",
      "testType": "NS1 Antigen",
      "plateletCount": 215000,
      "hospitalized": false,
      "hospitalName": "Bidhannagar Sub-Divisional Hospital (Salt Lake)",
      "notes": "Complete clinical recovery after 11 days. Platelets restored to healthy baseline. [DEMO SAMPLE RECORD]",
      "isSample": true
    },
    {
      "id": "DS-CASE-1005",
      "patientCode": "DEMO-PT-4905",
      "age": 51,
      "gender": "Male",
      "location": "Barasat Champadali More, Barasat",
      "district": "North 24 Parganas",
      "state": "West Bengal",
      "country": "India",
      "latitude": 22.7196,
      "longitude": 88.4812,
      "onsetDate": "2026-10-30",
      "reportDate": "2026-11-02",
      "status": "Confirmed",
      "verificationStatus": "Verified",
      "testType": "NS1 Antigen",
      "plateletCount": 68000,
      "hospitalized": true,
      "hospitalName": "Barasat Government Medical College & Hospital",
      "notes": "Vomiting and transient mucosal gum bleeding noted on day 4. Admitted to Dengue HDU. [DEMO SAMPLE RECORD]",
      "isSample": true
    },
    {
      "id": "DS-CASE-1008",
      "patientCode": "DEMO-PT-4908",
      "age": 38,
      "gender": "Female",
      "location": "Behala Chowrasta, Kolkata",
      "district": "Kolkata",
      "state": "West Bengal",
      "country": "India",
      "latitude": 22.4988,
      "longitude": 88.3129,
      "onsetDate": "2026-11-02",
      "reportDate": "2026-11-05",
      "status": "Confirmed",
      "verificationStatus": "Verified",
      "testType": "NS1 Antigen",
      "plateletCount": 92000,
      "hospitalized": false,
      "hospitalName": "M.R. Bangur District Hospital & Super Specialty Hospital",
      "notes": "High fever (103°F) and erythematous rash. Daily CBC monitoring ordered. [DEMO SAMPLE RECORD]",
      "isSample": true
    },
    {
      "id": "DS-CASE-1009",
      "patientCode": "DEMO-PT-4909",
      "age": 14,
      "gender": "Male",
      "location": "Kamarhati, North 24 Parganas",
      "district": "North 24 Parganas",
      "state": "West Bengal",
      "country": "India",
      "latitude": 22.6713,
      "longitude": 88.3769,
      "onsetDate": "2026-11-03",
      "reportDate": "2026-11-06",
      "status": "Confirmed",
      "verificationStatus": "Verified",
      "testType": "RT-PCR",
      "plateletCount": 79000,
      "hospitalized": true,
      "hospitalName": "College of Medicine & Sagore Dutta Hospital (CMSDH)",
      "notes": "Pediatric dengue admission with abdominal distention. Fluid therapy closely titrated. [DEMO SAMPLE RECORD]",
      "isSample": true
    },
    {
      "id": "DS-CASE-1010",
      "patientCode": "DEMO-PT-4910",
      "age": 63,
      "gender": "Male",
      "location": "Bhowanipore, Kolkata",
      "district": "Kolkata",
      "state": "West Bengal",
      "country": "India",
      "latitude": 22.5394,
      "longitude": 88.3444,
      "onsetDate": "2026-10-25",
      "reportDate": "2026-10-28",
      "status": "Recovered",
      "verificationStatus": "Verified",
      "testType": "IgM ELISA",
      "plateletCount": 188000,
      "hospitalized": true,
      "hospitalName": "IPGMER and SSKM Hospital (Seth Sukhlal Karnani Memorial)",
      "notes": "Diabetic patient managed successfully through critical defervescence phase. Discharged stable. [DEMO SAMPLE RECORD]",
      "isSample": true
    },
    {
      "id": "DS-CASE-1011",
      "patientCode": "DEMO-PT-4911",
      "age": 29,
      "gender": "Female",
      "location": "Domjur, Howrah",
      "district": "Howrah",
      "state": "West Bengal",
      "country": "India",
      "latitude": 22.6425,
      "longitude": 88.2215,
      "onsetDate": "2026-11-05",
      "reportDate": "2026-11-07",
      "status": "Suspected",
      "verificationStatus": "Pending",
      "testType": "Clinical Diagnosis",
      "plateletCount": 142000,
      "hospitalized": false,
      "hospitalName": "Howrah District Hospital OPD",
      "notes": "Fever and generalized body pain, retro-orbital headache. Blood sample drawn for NS1 confirmation. [DEMO SAMPLE RECORD]",
      "isSample": true
    },
    {
      "id": "DS-CASE-1012",
      "patientCode": "DEMO-PT-4912",
      "age": 47,
      "gender": "Male",
      "location": "Chinsurah Clock Tower, Chinsurah",
      "district": "Hooghly",
      "state": "West Bengal",
      "country": "India",
      "latitude": 22.8996,
      "longitude": 88.3967,
      "onsetDate": "2026-10-29",
      "reportDate": "2026-11-01",
      "status": "Confirmed",
      "verificationStatus": "Verified",
      "testType": "NS1 Antigen",
      "plateletCount": 54000,
      "hospitalized": true,
      "hospitalName": "Chinsurah Imambara Sadar Hospital (Hooghly District Hospital)",
      "notes": "Platelet nadir reached day 5. No spontaneous hemorrhage. IV crystalloids maintained. [DEMO SAMPLE RECORD]",
      "isSample": true
    },
    {
      "id": "DS-CASE-1013",
      "patientCode": "DEMO-PT-4913",
      "age": 22,
      "gender": "Female",
      "location": "Battala, Serampore",
      "district": "Hooghly",
      "state": "West Bengal",
      "country": "India",
      "latitude": 22.7523,
      "longitude": 88.3431,
      "onsetDate": "2026-11-01",
      "reportDate": "2026-11-04",
      "status": "Confirmed",
      "verificationStatus": "Verified",
      "testType": "NS1 Antigen",
      "plateletCount": 106000,
      "hospitalized": false,
      "hospitalName": "Serampore Walsh Sub-Divisional Hospital",
      "notes": "Mild petechial rash on forearm, fever subsiding. Daily CBC advised. [DEMO SAMPLE RECORD]",
      "isSample": true
    },
    {
      "id": "DS-CASE-1014",
      "patientCode": "DEMO-PT-4914",
      "age": 31,
      "gender": "Male",
      "location": "Shyambazar Five Point, Kolkata",
      "district": "Kolkata",
      "state": "West Bengal",
      "country": "India",
      "latitude": 22.6042,
      "longitude": 88.3739,
      "onsetDate": "2026-10-20",
      "reportDate": "2026-10-23",
      "status": "Recovered",
      "verificationStatus": "Verified",
      "testType": "NS1 Antigen",
      "plateletCount": 240000,
      "hospitalized": false,
      "hospitalName": "R.G. Kar Medical College and Hospital",
      "notes": "Full convalescence achieved. Platelet count fully restored. [DEMO SAMPLE RECORD]",
      "isSample": true
    },
    {
      "id": "DS-CASE-1015",
      "patientCode": "DEMO-PT-4915",
      "age": 8,
      "gender": "Female",
      "location": "Sodepur Station Road, Sodepur",
      "district": "North 24 Parganas",
      "state": "West Bengal",
      "country": "India",
      "latitude": 22.7001,
      "longitude": 88.3912,
      "onsetDate": "2026-11-06",
      "reportDate": "2026-11-08",
      "status": "Confirmed",
      "verificationStatus": "Verified",
      "testType": "NS1 Antigen",
      "plateletCount": 88000,
      "hospitalized": true,
      "hospitalName": "College of Medicine & Sagore Dutta Hospital (CMSDH)",
      "notes": "Pediatric fever case admitted under observation. Oral fluids and paracetamol regimen. [DEMO SAMPLE RECORD]",
      "isSample": true
    },
    {
      "id": "DS-CASE-1016",
      "patientCode": "DEMO-PT-4916",
      "age": 69,
      "gender": "Male",
      "location": "Jadavpur 8B, Jadavpur",
      "district": "South 24 Parganas",
      "state": "West Bengal",
      "country": "India",
      "latitude": 22.4988,
      "longitude": 88.3712,
      "onsetDate": "2026-10-18",
      "reportDate": "2026-10-21",
      "status": "Deceased",
      "verificationStatus": "Verified",
      "testType": "RT-PCR",
      "plateletCount": 22000,
      "hospitalized": true,
      "hospitalName": "M.R. Bangur District Hospital & Super Specialty Hospital",
      "notes": "Severe Dengue Shock Syndrome (DSS) complicated by pre-existing chronic kidney disease. [DEMO SURVEILLANCE AUDIT RECORD]",
      "isSample": true
    },
    {
      "id": "DS-CASE-1017",
      "patientCode": "DEMO-PT-4917",
      "age": 24,
      "gender": "Female",
      "location": "Bally Station Ghat, Bally",
      "district": "Howrah",
      "state": "West Bengal",
      "country": "India",
      "latitude": 22.6481,
      "longitude": 88.3412,
      "onsetDate": "2026-11-05",
      "reportDate": "2026-11-07",
      "status": "Confirmed",
      "verificationStatus": "Verified",
      "testType": "NS1 Antigen",
      "plateletCount": 96000,
      "hospitalized": false,
      "hospitalName": "Howrah District Hospital OPD",
      "notes": "Day 3 fever with intense frontal headache. Monitoring at home isolation. [DEMO SAMPLE RECORD]",
      "isSample": true
    },
    {
      "id": "DS-CASE-1018",
      "patientCode": "DEMO-PT-4918",
      "age": 36,
      "gender": "Male",
      "location": "Garia Station Road, Garia",
      "district": "South 24 Parganas",
      "state": "West Bengal",
      "country": "India",
      "latitude": 22.4784,
      "longitude": 88.3842,
      "onsetDate": "2026-11-02",
      "reportDate": "2026-11-05",
      "status": "Confirmed",
      "verificationStatus": "Verified",
      "testType": "NS1 Antigen",
      "plateletCount": 118000,
      "hospitalized": false,
      "hospitalName": "M.R. Bangur District Hospital & Super Specialty Hospital",
      "notes": "Outpatient surveillance. Patient advised complete physical bed rest and ORS. [DEMO SAMPLE RECORD]",
      "isSample": true
    },
    {
      "id": "DS-CASE-1019",
      "patientCode": "DEMO-PT-4919",
      "age": 44,
      "gender": "Female",
      "location": "Bowbazar, Kolkata",
      "district": "Kolkata",
      "state": "West Bengal",
      "country": "India",
      "latitude": 22.5735,
      "longitude": 88.3615,
      "onsetDate": "2026-10-24",
      "reportDate": "2026-10-27",
      "status": "Recovered",
      "verificationStatus": "Verified",
      "testType": "IgM ELISA",
      "plateletCount": 210000,
      "hospitalized": false,
      "hospitalName": "Medical College & Hospital, Kolkata (Calcutta Medical College)",
      "notes": "Discharged after complete resolution of fever and normalization of hematocrit. [DEMO SAMPLE RECORD]",
      "isSample": true
    },
    {
      "id": "DS-CASE-1020",
      "patientCode": "DEMO-PT-4920",
      "age": 55,
      "gender": "Male",
      "location": "Uttarpara Ferry Ghat, Uttarpara",
      "district": "Hooghly",
      "state": "West Bengal",
      "country": "India",
      "latitude": 22.6681,
      "longitude": 88.3458,
      "onsetDate": "2026-11-06",
      "reportDate": "2026-11-08",
      "status": "Suspected",
      "verificationStatus": "Pending",
      "testType": "Clinical Diagnosis",
      "plateletCount": 125000,
      "hospitalized": false,
      "hospitalName": "Serampore Walsh Sub-Divisional Hospital",
      "notes": "High fever and retro-orbital pain, awaiting NS1 test kit report. [DEMO SAMPLE RECORD]",
      "isSample": true
    }
  ],
  "communityReports": [
    {
      "id": "REP-501",
      "title": "Uncovered Overhead Tank Stagnant Water",
      "category": "Overhead Tank",
      "description": "Commercial multi-storey building terrace tank with open cracked lid, harboring visible active Aedes mosquito larvae.",
      "location": "Behala Chowrasta, Kolkata",
      "district": "Kolkata",
      "latitude": 22.4988,
      "longitude": 88.3129,
      "reportedAt": "2026-11-05T10:30:00.000Z",
      "status": "Verified",
      "priority": "High",
      "reporterName": "P. Mukherjee (Resident)",
      "verifiedBy": "KMC Borough-XIV Public Health Inspector",
      "imageUrl": "/icon.png",
      "actionTaken": "Municipal vector team served notice to building committee; Temephos 50% EC larvicide applied; tank lid secured.",
      "isSample": true
    },
    {
      "id": "REP-502",
      "title": "Clogged Roadside Drainage Water Pooling",
      "category": "Uncleaned Drain",
      "description": "Rainwater accumulated in blocked open storm drain for over 10 days near weekly vegetable market.",
      "location": "Jagatballavpur Market Area, Howrah",
      "district": "Howrah",
      "latitude": 22.682,
      "longitude": 88.109,
      "reportedAt": "2026-11-06T14:15:00.000Z",
      "status": "Pending",
      "priority": "Medium",
      "reporterName": "A. Roy (Panchayat Member)",
      "verifiedBy": null,
      "imageUrl": "/icon.png",
      "actionTaken": "Pending field inspection by Howrah Zilla Parishad vector control wing.",
      "isSample": true
    },
    {
      "id": "REP-503",
      "title": "Discarded Automobile Tires Behind Workshop",
      "category": "Discarded Tires",
      "description": "Pile of 18 old heavy tires holding rainwater behind commercial truck garage, surrounded by daytime biting mosquitoes.",
      "location": "Sodepur Station Road, Sodepur",
      "district": "North 24 Parganas",
      "latitude": 22.7001,
      "longitude": 88.3912,
      "reportedAt": "2026-11-07T09:00:00.000Z",
      "status": "Resolved",
      "priority": "High",
      "reporterName": "S. Dutta (Community Volunteer)",
      "verifiedBy": "Panihati Municipality Health Supervisor",
      "imageUrl": "/icon.png",
      "actionTaken": "All 18 tires cleared and punctured; bleaching powder and pyrethrum space spraying carried out in 100m radius.",
      "isSample": true
    },
    {
      "id": "REP-504",
      "title": "Basement Water Accumulation in Unfinished Commercial Site",
      "category": "Construction Site",
      "description": "Underground parking basement of under-construction retail center filled with 2 feet of stagnant rainwater for 3 weeks.",
      "location": "Barasat Champadali More, Barasat",
      "district": "North 24 Parganas",
      "latitude": 22.7196,
      "longitude": 88.4812,
      "reportedAt": "2026-11-08T11:20:00.000Z",
      "status": "Verified",
      "priority": "High",
      "reporterName": "K. Majumdar (Local Citizen)",
      "verifiedBy": "Barasat Municipality Health Officer",
      "imageUrl": "/icon.png",
      "actionTaken": "Developer directed to pump out water within 48 hours; biological control (guppy fish) and larvicide deployed.",
      "isSample": true
    },
    {
      "id": "REP-505",
      "title": "Water Hyacinth Choking Open Canal Sluice",
      "category": "Stagnant Water",
      "description": "Sluggish canal water near railway embankment choked with weeds and plastic bags creating micro-breeding pockets.",
      "location": "Bally Station Ghat Road, Bally",
      "district": "Howrah",
      "latitude": 22.6481,
      "longitude": 88.3412,
      "reportedAt": "2026-11-09T08:45:00.000Z",
      "status": "Pending",
      "priority": "Medium",
      "reporterName": "R. Ghosh (Daily Commuter)",
      "verifiedBy": null,
      "imageUrl": "/icon.png",
      "actionTaken": "Assigned to Bally Municipality drainage division for mechanical weed clearance.",
      "isSample": true
    },
    {
      "id": "REP-506",
      "title": "Unattended Rooftop Plastic Trays & Broken Pots",
      "category": "Stagnant Water",
      "description": "Vacant rooftop garden with dozens of trays holding stagnant monsoon rainwater in densely populated residential block.",
      "location": "Salt Lake Sector V, Bidhannagar",
      "district": "North 24 Parganas",
      "latitude": 22.5867,
      "longitude": 88.4178,
      "reportedAt": "2026-11-09T16:00:00.000Z",
      "status": "Resolved",
      "priority": "Low",
      "reporterName": "T. Banerjee (IT Professional)",
      "verifiedBy": "Bidhannagar Municipal Corporation Team",
      "imageUrl": "/icon.png",
      "actionTaken": "Rooftop cleared by municipal vector staff; anti-larval spray applied.",
      "isSample": true
    },
    {
      "id": "REP-507",
      "title": "Open Sump Tank in Vacant Plot",
      "category": "Stagnant Water",
      "description": "Unfenced open groundwater sump tank collecting rainwater in a residential subdivision.",
      "location": "Garia Station Road, Garia",
      "district": "South 24 Parganas",
      "latitude": 22.4784,
      "longitude": 88.3842,
      "reportedAt": "2026-11-10T10:15:00.000Z",
      "status": "Pending",
      "priority": "High",
      "reporterName": "M. Paul (Ward 104 Resident)",
      "verifiedBy": null,
      "imageUrl": "/icon.png",
      "actionTaken": "Awaiting field inspection by municipal sanitary inspector.",
      "isSample": true
    },
    {
      "id": "REP-508",
      "title": "Plastic Cup & Coconut Shell Accumulation near Food Stalls",
      "category": "Stagnant Water",
      "description": "Heap of tender coconut shells and plastic beverage cups collecting rainwater behind street food cluster.",
      "location": "Serampore Tinbazar, Serampore",
      "district": "Hooghly",
      "latitude": 22.7523,
      "longitude": 88.3431,
      "reportedAt": "2026-11-10T13:40:00.000Z",
      "status": "Verified",
      "priority": "Medium",
      "reporterName": "B. Chatterjee (Shopkeeper)",
      "verifiedBy": "Serampore Municipality Conservancy Inspector",
      "imageUrl": "/icon.png",
      "actionTaken": "Solid waste cleared and trucked away; ground disinfected with lime and bleaching powder.",
      "isSample": true
    }
  ],
  "surveys": [
    {
      "id": "SURV-WB-2026",
      "title": "West Bengal Community Dengue Preparedness & Vector Control Survey 2026",
      "description": "Comprehensive public health assessment evaluating neighborhood drainage, municipal vector control, domestic water storage habits, and community awareness of severe dengue warning signs.",
      "active": true,
      "createdAt": "2026-10-15T00:00:00.000Z",
      "questions": [
        {
          "id": "q1",
          "text": "How frequently does your local municipality or panchayat conduct anti-larval chemical spraying or fogging in your area?",
          "type": "choice",
          "options": [
            "Weekly (Active regular surveillance)",
            "Fortnightly (Every 2 weeks)",
            "Monthly",
            "Rarely or Never"
          ]
        },
        {
          "id": "q2",
          "text": "How often do members of your household inspect and empty domestic water collection points (AC drain trays, flowerpot saucers, water coolers, open buckets)?",
          "type": "choice",
          "options": [
            "Every 3 to 7 days (Weekly discipline)",
            "Every 2 weeks",
            "Only when mosquitoes are noticed",
            "Rarely or Never"
          ]
        },
        {
          "id": "q3",
          "text": "During monsoon or unseasonal rains, how long does street waterlogging typically remain in your immediate neighborhood?",
          "type": "choice",
          "options": [
            "Drains completely within 2 to 4 hours",
            "Stands for 1 to 2 days",
            "Stagnant for 3 to 7 days",
            "Severe waterlogging lasting over a week"
          ]
        },
        {
          "id": "q4",
          "text": "How would you rate municipal waste management and storm drain clearance in your locality?",
          "type": "choice",
          "options": [
            "Clean & regular daily collection",
            "Satisfactory with minor delays",
            "Irregular with open roadside garbage piles",
            "Poor with heavily choked open drains"
          ]
        },
        {
          "id": "q5",
          "text": "Which primary mosquito bite prevention measure does your family rely on most at home?",
          "type": "choice",
          "options": [
            "Bed nets (মশারি) during sleep",
            "Liquid vaporizers / electric coils",
            "Skin repellent lotions / roll-on (DEET / Picaridin)",
            "Window & door wire-mesh screens"
          ]
        },
        {
          "id": "q6",
          "text": "Are you aware of the critical dengue emergency warning signs (severe abdominal pain, persistent vomiting >3 times/day, gum/nose bleeding) that require immediate hospital admission?",
          "type": "choice",
          "options": [
            "Fully aware of all clinical warning signs",
            "Aware of bleeding & platelet drop only",
            "Only aware that high fever occurs",
            "Unaware of warning signs"
          ]
        }
      ],
      "responses": [
        {
          "id": "RESP-01",
          "location": "Beliaghata, Kolkata",
          "district": "Kolkata",
          "submittedAt": "2026-11-01T09:30:00.000Z",
          "answers": {
            "q1": "Weekly (Active regular surveillance)",
            "q2": "Every 3 to 7 days (Weekly discipline)",
            "q3": "Drains completely within 2 to 4 hours",
            "q4": "Clean & regular daily collection",
            "q5": "Bed nets (মশারি) during sleep",
            "q6": "Fully aware of all clinical warning signs"
          }
        },
        {
          "id": "RESP-02",
          "location": "Behala Chowrasta, Kolkata",
          "district": "Kolkata",
          "submittedAt": "2026-11-01T11:15:00.000Z",
          "answers": {
            "q1": "Fortnightly (Every 2 weeks)",
            "q2": "Every 3 to 7 days (Weekly discipline)",
            "q3": "Stands for 1 to 2 days",
            "q4": "Satisfactory with minor delays",
            "q5": "Bed nets (মশারি) during sleep",
            "q6": "Fully aware of all clinical warning signs"
          }
        },
        {
          "id": "RESP-03",
          "location": "Jagatballavpur, Howrah",
          "district": "Howrah",
          "submittedAt": "2026-11-02T14:00:00.000Z",
          "answers": {
            "q1": "Monthly",
            "q2": "Every 3 to 7 days (Weekly discipline)",
            "q3": "Stagnant for 3 to 7 days",
            "q4": "Irregular with open roadside garbage piles",
            "q5": "Bed nets (মশারি) during sleep",
            "q6": "Aware of bleeding & platelet drop only"
          }
        },
        {
          "id": "RESP-04",
          "location": "Howrah Railway Station Area, Howrah",
          "district": "Howrah",
          "submittedAt": "2026-11-02T16:20:00.000Z",
          "answers": {
            "q1": "Weekly (Active regular surveillance)",
            "q2": "Every 2 weeks",
            "q3": "Stands for 1 to 2 days",
            "q4": "Satisfactory with minor delays",
            "q5": "Liquid vaporizers / electric coils",
            "q6": "Fully aware of all clinical warning signs"
          }
        },
        {
          "id": "RESP-05",
          "location": "Barasat Champadali More, Barasat",
          "district": "North 24 Parganas",
          "submittedAt": "2026-11-03T10:45:00.000Z",
          "answers": {
            "q1": "Fortnightly (Every 2 weeks)",
            "q2": "Every 3 to 7 days (Weekly discipline)",
            "q3": "Stagnant for 3 to 7 days",
            "q4": "Irregular with open roadside garbage piles",
            "q5": "Bed nets (মশারি) during sleep",
            "q6": "Aware of bleeding & platelet drop only"
          }
        },
        {
          "id": "RESP-06",
          "location": "Salt Lake Sector V, Bidhannagar",
          "district": "North 24 Parganas",
          "submittedAt": "2026-11-03T13:10:00.000Z",
          "answers": {
            "q1": "Weekly (Active regular surveillance)",
            "q2": "Every 3 to 7 days (Weekly discipline)",
            "q3": "Drains completely within 2 to 4 hours",
            "q4": "Clean & regular daily collection",
            "q5": "Window & door wire-mesh screens",
            "q6": "Fully aware of all clinical warning signs"
          }
        },
        {
          "id": "RESP-07",
          "location": "Sodepur Station Road, Sodepur",
          "district": "North 24 Parganas",
          "submittedAt": "2026-11-04T08:50:00.000Z",
          "answers": {
            "q1": "Fortnightly (Every 2 weeks)",
            "q2": "Every 2 weeks",
            "q3": "Stands for 1 to 2 days",
            "q4": "Satisfactory with minor delays",
            "q5": "Bed nets (মশারি) during sleep",
            "q6": "Aware of bleeding & platelet drop only"
          }
        },
        {
          "id": "RESP-08",
          "location": "Garia Station Road, Garia",
          "district": "South 24 Parganas",
          "submittedAt": "2026-11-04T12:30:00.000Z",
          "answers": {
            "q1": "Fortnightly (Every 2 weeks)",
            "q2": "Every 3 to 7 days (Weekly discipline)",
            "q3": "Stagnant for 3 to 7 days",
            "q4": "Irregular with open roadside garbage piles",
            "q5": "Bed nets (মশারি) during sleep",
            "q6": "Fully aware of all clinical warning signs"
          }
        },
        {
          "id": "RESP-09",
          "location": "Jadavpur 8B, Jadavpur",
          "district": "South 24 Parganas",
          "submittedAt": "2026-11-05T09:15:00.000Z",
          "answers": {
            "q1": "Weekly (Active regular surveillance)",
            "q2": "Every 3 to 7 days (Weekly discipline)",
            "q3": "Drains completely within 2 to 4 hours",
            "q4": "Satisfactory with minor delays",
            "q5": "Liquid vaporizers / electric coils",
            "q6": "Fully aware of all clinical warning signs"
          }
        },
        {
          "id": "RESP-10",
          "location": "Serampore Tinbazar, Serampore",
          "district": "Hooghly",
          "submittedAt": "2026-11-05T15:40:00.000Z",
          "answers": {
            "q1": "Fortnightly (Every 2 weeks)",
            "q2": "Every 3 to 7 days (Weekly discipline)",
            "q3": "Stands for 1 to 2 days",
            "q4": "Satisfactory with minor delays",
            "q5": "Bed nets (মশারি) during sleep",
            "q6": "Aware of bleeding & platelet drop only"
          }
        },
        {
          "id": "RESP-11",
          "location": "Chinsurah Clock Tower, Chinsurah",
          "district": "Hooghly",
          "submittedAt": "2026-11-06T11:00:00.000Z",
          "answers": {
            "q1": "Monthly",
            "q2": "Every 2 weeks",
            "q3": "Stagnant for 3 to 7 days",
            "q4": "Irregular with open roadside garbage piles",
            "q5": "Bed nets (মশারি) during sleep",
            "q6": "Only aware that high fever occurs"
          }
        },
        {
          "id": "RESP-12",
          "location": "Bally Station Ghat, Bally",
          "district": "Howrah",
          "submittedAt": "2026-11-06T14:25:00.000Z",
          "answers": {
            "q1": "Fortnightly (Every 2 weeks)",
            "q2": "Every 3 to 7 days (Weekly discipline)",
            "q3": "Stands for 1 to 2 days",
            "q4": "Satisfactory with minor delays",
            "q5": "Bed nets (মশারি) during sleep",
            "q6": "Fully aware of all clinical warning signs"
          }
        },
        {
          "id": "RESP-13",
          "location": "Domjur Market, Domjur",
          "district": "Howrah",
          "submittedAt": "2026-11-07T10:00:00.000Z",
          "answers": {
            "q1": "Monthly",
            "q2": "Every 3 to 7 days (Weekly discipline)",
            "q3": "Stagnant for 3 to 7 days",
            "q4": "Irregular with open roadside garbage piles",
            "q5": "Bed nets (মশারি) during sleep",
            "q6": "Aware of bleeding & platelet drop only"
          }
        },
        {
          "id": "RESP-14",
          "location": "Shyambazar Five Point, Kolkata",
          "district": "Kolkata",
          "submittedAt": "2026-11-07T17:15:00.000Z",
          "answers": {
            "q1": "Weekly (Active regular surveillance)",
            "q2": "Every 3 to 7 days (Weekly discipline)",
            "q3": "Drains completely within 2 to 4 hours",
            "q4": "Clean & regular daily collection",
            "q5": "Liquid vaporizers / electric coils",
            "q6": "Fully aware of all clinical warning signs"
          }
        },
        {
          "id": "RESP-15",
          "location": "Kamarhati, North 24 Parganas",
          "district": "North 24 Parganas",
          "submittedAt": "2026-11-08T09:40:00.000Z",
          "answers": {
            "q1": "Fortnightly (Every 2 weeks)",
            "q2": "Every 2 weeks",
            "q3": "Stands for 1 to 2 days",
            "q4": "Poor with heavily choked open drains",
            "q5": "Bed nets (মশারি) during sleep",
            "q6": "Aware of bleeding & platelet drop only"
          }
        },
        {
          "id": "RESP-16",
          "location": "Uttarpara Ferry Ghat, Uttarpara",
          "district": "Hooghly",
          "submittedAt": "2026-11-08T15:10:00.000Z",
          "answers": {
            "q1": "Fortnightly (Every 2 weeks)",
            "q2": "Every 3 to 7 days (Weekly discipline)",
            "q3": "Drains completely within 2 to 4 hours",
            "q4": "Satisfactory with minor delays",
            "q5": "Window & door wire-mesh screens",
            "q6": "Fully aware of all clinical warning signs"
          }
        },
        {
          "id": "RESP-17",
          "location": "Bowbazar, Kolkata",
          "district": "Kolkata",
          "submittedAt": "2026-11-09T11:30:00.000Z",
          "answers": {
            "q1": "Weekly (Active regular surveillance)",
            "q2": "Every 3 to 7 days (Weekly discipline)",
            "q3": "Drains completely within 2 to 4 hours",
            "q4": "Clean & regular daily collection",
            "q5": "Bed nets (মশারি) during sleep",
            "q6": "Fully aware of all clinical warning signs"
          }
        },
        {
          "id": "RESP-18",
          "location": "Jagatballavpur, Howrah",
          "district": "Howrah",
          "submittedAt": "2026-11-09T14:45:00.000Z",
          "answers": {
            "q1": "Rarely or Never",
            "q2": "Every 3 to 7 days (Weekly discipline)",
            "q3": "Stagnant for 3 to 7 days",
            "q4": "Irregular with open roadside garbage piles",
            "q5": "Bed nets (মশারি) during sleep",
            "q6": "Fully aware of all clinical warning signs"
          }
        },
        {
          "id": "RESP-19",
          "location": "Barasat Pioneer Park, Barasat",
          "district": "North 24 Parganas",
          "submittedAt": "2026-11-10T10:20:00.000Z",
          "answers": {
            "q1": "Fortnightly (Every 2 weeks)",
            "q2": "Every 3 to 7 days (Weekly discipline)",
            "q3": "Stands for 1 to 2 days",
            "q4": "Satisfactory with minor delays",
            "q5": "Skin repellent lotions / roll-on (DEET / Picaridin)",
            "q6": "Fully aware of all clinical warning signs"
          }
        },
        {
          "id": "RESP-20",
          "location": "Tollygunge Circular Road, Kolkata",
          "district": "South 24 Parganas",
          "submittedAt": "2026-11-10T16:00:00.000Z",
          "answers": {
            "q1": "Weekly (Active regular surveillance)",
            "q2": "Every 3 to 7 days (Weekly discipline)",
            "q3": "Drains completely within 2 to 4 hours",
            "q4": "Clean & regular daily collection",
            "q5": "Bed nets (মশারি) during sleep",
            "q6": "Fully aware of all clinical warning signs"
          }
        }
      ]
    }
  ],
  "hospitals": [
    {
      "id": "HOSP-WB-01",
      "name": "Infectious Diseases & B.G. Hospital (ID&BG)",
      "type": "State Apex Specialized Infectious Diseases Hospital",
      "district": "Kolkata",
      "state": "West Bengal",
      "address": "57, Beliaghata Main Road, Subhas Sarovar Park, Phool Bagan, Beleghata, Kolkata - 700010",
      "contact": "+91 33 2370 1251",
      "emergencyPhone": "+91 33 2370 1252",
      "services": [
        "Dedicated 200+ Bed Dengue & Malaria Inpatient Ward",
        "24/7 Platelet Apheresis & Blood Component Center",
        "Critical Care Unit (CCU / HDU)",
        "State Reference Laboratory for NS1 & IgM ELISA"
      ],
      "latitude": 22.5697,
      "longitude": 88.3972,
      "bedAvailability": "Available",
      "verified": true
    },
    {
      "id": "HOSP-WB-02",
      "name": "Calcutta National Medical College & Hospital (CNMCH)",
      "type": "Government Medical College & Tertiary Referral Hospital",
      "district": "Kolkata",
      "state": "West Bengal",
      "address": "32, Gorachand Road, Beniapukur, Kolkata - 700014",
      "contact": "+91 33 2284 4834",
      "emergencyPhone": "+91 33 2284 4835",
      "services": [
        "24/7 Emergency Casualty Triage",
        "Pediatric Dengue Intensive Care Unit (PICU)",
        "Automated Hematology & Daily CBC Testing",
        "Central Blood Bank with Component Separation"
      ],
      "latitude": 22.5441,
      "longitude": 88.3683,
      "bedAvailability": "Available",
      "verified": true
    },
    {
      "id": "HOSP-WB-03",
      "name": "Medical College & Hospital, Kolkata (Calcutta Medical College)",
      "type": "Premier Government Medical College & Hospital",
      "district": "Kolkata",
      "state": "West Bengal",
      "address": "88, College Street, Bowbazar, Kolkata - 700073",
      "contact": "+91 33 2255 1621",
      "emergencyPhone": "+91 33 2255 1622",
      "services": [
        "Regional Blood Transfusion Center (RBTC)",
        "Dengue High Dependency Unit (HDU)",
        "Viral Research & Diagnostic Laboratory (VRDL)",
        "Free Fluid Resuscitation & Emergency Care"
      ],
      "latitude": 22.5735,
      "longitude": 88.3615,
      "bedAvailability": "Available",
      "verified": true
    },
    {
      "id": "HOSP-WB-04",
      "name": "IPGMER and SSKM Hospital (Seth Sukhlal Karnani Memorial)",
      "type": "Apex Post-Graduate Super-Specialty Medical Institute",
      "district": "Kolkata",
      "state": "West Bengal",
      "address": "244, Acharya Jagadish Chandra Bose Road, Bhowanipore, Kolkata - 700020",
      "contact": "+91 33 2223 1589",
      "emergencyPhone": "+91 33 2223 1590",
      "services": [
        "Level-1 Emergency Trauma & Infectious Disease Triage",
        "Multi-Organ Critical Care (ICU / ITU)",
        "Single Donor Platelet (SDP) Apheresis Facility",
        "Round-the-clock Molecular Diagnostics"
      ],
      "latitude": 22.5394,
      "longitude": 88.3444,
      "bedAvailability": "Available",
      "verified": true
    },
    {
      "id": "HOSP-WB-05",
      "name": "R.G. Kar Medical College and Hospital",
      "type": "Government Medical College & Hospital (North Kolkata)",
      "district": "Kolkata",
      "state": "West Bengal",
      "address": "1, Khudiram Bose Sarani, Ward Number 12, Shyam Bazar, Kolkata - 700004",
      "contact": "+91 33 2555 7656",
      "emergencyPhone": "+91 33 2555 7657",
      "services": [
        "24/7 Outpatient Fever Clinic",
        "Dedicated Adult & Pediatric Dengue Ward",
        "Microbiology Virology Wing",
        "Blood Component Separation Unit"
      ],
      "latitude": 22.6042,
      "longitude": 88.3739,
      "bedAvailability": "Available",
      "verified": true
    },
    {
      "id": "HOSP-WB-06",
      "name": "Howrah District Hospital (Howrah Sadar Hospital)",
      "type": "Government District Hospital",
      "district": "Howrah",
      "state": "West Bengal",
      "address": "Biplabi Haren Ghosh Sarani, Howrah Railway Station Area, Howrah - 711101",
      "contact": "+91 33 2641 3311",
      "emergencyPhone": "+91 33 2641 3312",
      "services": [
        "24/7 Casualty & Triage",
        "Dengue Clinical Management Unit",
        "District Central Blood Bank",
        "Free Rapid NS1 Antigen & Platelet Testing"
      ],
      "latitude": 22.5891,
      "longitude": 88.3308,
      "bedAvailability": "Available",
      "verified": true
    },
    {
      "id": "HOSP-WB-07",
      "name": "Jagatballavpur Rural Hospital & BPHC",
      "type": "Government Block Primary Health Center & Rural Hospital",
      "district": "Howrah",
      "state": "West Bengal",
      "address": "Jagatballavpur Main Road, Jagatballavpur, Howrah - 711408",
      "contact": "+91 3214 255 220",
      "emergencyPhone": "+91 3214 255 221",
      "services": [
        "Primary Fever Screening & Triage",
        "Free NS1 Rapid Test Kits",
        "Oral Rehydration (ORS) Corner",
        "24/7 Emergency Ambulance Transfer to District Hospital"
      ],
      "latitude": 22.6843,
      "longitude": 88.1065,
      "bedAvailability": "Available",
      "verified": true
    },
    {
      "id": "HOSP-WB-08",
      "name": "Barasat Government Medical College & Hospital",
      "type": "Government Medical College & District Referral Hospital",
      "district": "North 24 Parganas",
      "state": "West Bengal",
      "address": "Banamalipur, Barasat, North 24 Parganas - 700124",
      "contact": "+91 33 2552 3228",
      "emergencyPhone": "+91 33 2552 3229",
      "services": [
        "24/7 Emergency & Infectious Disease Wing",
        "Dengue High Dependency Unit",
        "Central Diagnostic Pathology Lab",
        "Full Component Blood Bank"
      ],
      "latitude": 22.7196,
      "longitude": 88.4812,
      "bedAvailability": "Available",
      "verified": true
    },
    {
      "id": "HOSP-WB-09",
      "name": "College of Medicine & Sagore Dutta Hospital (CMSDH)",
      "type": "Government Medical College & Hospital",
      "district": "North 24 Parganas",
      "state": "West Bengal",
      "address": "578, Barrackpore Trunk Road, Kamarhati, North 24 Parganas - 700058",
      "contact": "+91 33 2583 6211",
      "emergencyPhone": "+91 33 2583 6212",
      "services": [
        "Dedicated Dengue Treatment Unit",
        "Pediatric Intensive Care Unit",
        "Continuous CBC & Platelet Monitoring",
        "Blood Component Separation Facility"
      ],
      "latitude": 22.6713,
      "longitude": 88.3769,
      "bedAvailability": "Available",
      "verified": true
    },
    {
      "id": "HOSP-WB-10",
      "name": "Bidhannagar Sub-Divisional Hospital (Salt Lake)",
      "type": "Government Sub-Divisional Hospital",
      "district": "North 24 Parganas",
      "state": "West Bengal",
      "address": "DD Block, Sector 1, Bidhannagar (Salt Lake), Kolkata / North 24 Parganas - 700064",
      "contact": "+91 33 2337 1374",
      "emergencyPhone": "+91 33 2337 1375",
      "services": [
        "24/7 Emergency Care",
        "Dengue Observation Ward",
        "Clinical Pathology & Hematology",
        "Blood Storage Center"
      ],
      "latitude": 22.5867,
      "longitude": 88.4178,
      "bedAvailability": "Available",
      "verified": true
    },
    {
      "id": "HOSP-WB-11",
      "name": "M.R. Bangur District Hospital & Super Specialty Hospital",
      "type": "Government District & Super Specialty Hospital",
      "district": "South 24 Parganas",
      "state": "West Bengal",
      "address": "241, Deshapran Sasmal Road, Tollygunge, Kolkata / South 24 Parganas - 700033",
      "contact": "+91 33 2473 3901",
      "emergencyPhone": "+91 33 2473 3902",
      "services": [
        "Specialized Vector-Borne Disease Treatment Ward",
        "Comprehensive Adult & Pediatric ICU",
        "24/7 Apheresis & Blood Bank",
        "Diagnostic RT-PCR and Serology Lab"
      ],
      "latitude": 22.5028,
      "longitude": 88.3448,
      "bedAvailability": "Available",
      "verified": true
    },
    {
      "id": "HOSP-WB-12",
      "name": "Chinsurah Imambara Sadar Hospital (Hooghly District Hospital)",
      "type": "Government District Referral Hospital",
      "district": "Hooghly",
      "state": "West Bengal",
      "address": "Imambara Sadar Hospital Road, Chinsurah, Hooghly - 712101",
      "contact": "+91 33 2680 2205",
      "emergencyPhone": "+91 33 2680 2206",
      "services": [
        "District Inpatient Dengue Ward",
        "24/7 Casualty & Emergency Service",
        "Hematology & Platelet Counter Unit",
        "Central Blood Bank"
      ],
      "latitude": 22.8996,
      "longitude": 88.3967,
      "bedAvailability": "Available",
      "verified": true
    },
    {
      "id": "HOSP-WB-13",
      "name": "Serampore Walsh Sub-Divisional Hospital",
      "type": "Government Sub-Divisional Hospital",
      "district": "Hooghly",
      "state": "West Bengal",
      "address": "Walsh Hospital Road, Battala, Serampore, Hooghly - 712201",
      "contact": "+91 33 2662 0233",
      "emergencyPhone": "+91 33 2662 0234",
      "services": [
        "24/7 Emergency Triage",
        "Fever Observation Ward",
        "Rapid NS1 Testing & CBC",
        "Ambulance Transfer Facility"
      ],
      "latitude": 22.7523,
      "longitude": 88.3431,
      "bedAvailability": "Available",
      "verified": true
    }
  ],
  "bloodDonors": [
    {
      "id": "DON-6",
      "donorCode": "DONOR-KO-57",
      "name": "sujan bhowmik",
      "bloodGroup": "AB+",
      "donationType": "Whole Blood Only",
      "district": "Kolkata",
      "state": "West Bengal",
      "available": true,
      "lastDonationDate": "2026-11-12",
      "verified": true,
      "contactChannel": "Hospital Coordinator / Verified Medical Desk"
    },
    {
      "id": "DON-01",
      "donorCode": "DONOR-KOL-101",
      "name": "Soumen B. (Verified Volunteer)",
      "bloodGroup": "O+",
      "donationType": "Platelets (Single Donor Apheresis) & Whole Blood",
      "district": "Kolkata",
      "state": "West Bengal",
      "available": true,
      "lastDonationDate": "2026-09-12",
      "verified": true,
      "contactChannel": "ID&BG Hospital Blood Bank Coordinator Desk",
      "isSample": true
    },
    {
      "id": "DON-02",
      "donorCode": "DONOR-KOL-102",
      "name": "Ananya S. (Verified Volunteer)",
      "bloodGroup": "A+",
      "donationType": "Platelets Only (Single Donor Apheresis)",
      "district": "Kolkata",
      "state": "West Bengal",
      "available": true,
      "lastDonationDate": "2026-10-04",
      "verified": true,
      "contactChannel": "CNMCH Central Blood Bank Referral Desk",
      "isSample": true
    },
    {
      "id": "DON-03",
      "donorCode": "DONOR-HWH-103",
      "name": "Debashis G. (Verified Volunteer)",
      "bloodGroup": "B+",
      "donationType": "Whole Blood & Platelets",
      "district": "Howrah",
      "state": "West Bengal",
      "available": true,
      "lastDonationDate": "2026-08-20",
      "verified": true,
      "contactChannel": "Howrah District Hospital Blood Bank Wing",
      "isSample": true
    },
    {
      "id": "DON-04",
      "donorCode": "DONOR-HWH-104",
      "name": "Tanmay M. (Verified Volunteer)",
      "bloodGroup": "AB+",
      "donationType": "Whole Blood",
      "district": "Howrah",
      "state": "West Bengal",
      "available": false,
      "lastDonationDate": "2026-10-25",
      "verified": true,
      "contactChannel": "Jagatballavpur BPHC Transfusion Liaison",
      "isSample": true
    },
    {
      "id": "DON-05",
      "donorCode": "DONOR-N24-105",
      "name": "Poulomi D. (Verified Volunteer)",
      "bloodGroup": "O-",
      "donationType": "Universal Donor (Whole Blood & Platelets)",
      "district": "North 24 Parganas",
      "state": "West Bengal",
      "available": true,
      "lastDonationDate": "2026-07-15",
      "verified": true,
      "contactChannel": "Barasat GMC Blood Center Emergency Desk",
      "isSample": true
    },
    {
      "id": "DON-06",
      "donorCode": "DONOR-N24-106",
      "name": "Ritabrata C. (Verified Volunteer)",
      "bloodGroup": "B-",
      "donationType": "Platelets Only (Apheresis)",
      "district": "North 24 Parganas",
      "state": "West Bengal",
      "available": true,
      "lastDonationDate": "2026-09-28",
      "verified": true,
      "contactChannel": "College of Medicine & Sagore Dutta Blood Unit",
      "isSample": true
    },
    {
      "id": "DON-07",
      "donorCode": "DONOR-S24-107",
      "name": "Moushumi P. (Verified Volunteer)",
      "bloodGroup": "A-",
      "donationType": "Whole Blood & Platelets",
      "district": "South 24 Parganas",
      "state": "West Bengal",
      "available": true,
      "lastDonationDate": "2026-08-11",
      "verified": true,
      "contactChannel": "M.R. Bangur Hospital Blood Transfusion Office",
      "isSample": true
    },
    {
      "id": "DON-08",
      "donorCode": "DONOR-HGL-108",
      "name": "Amitava R. (Verified Volunteer)",
      "bloodGroup": "O+",
      "donationType": "Platelets (Single Donor Apheresis)",
      "district": "Hooghly",
      "state": "West Bengal",
      "available": true,
      "lastDonationDate": "2026-09-18",
      "verified": true,
      "contactChannel": "Chinsurah Imambara Sadar Hospital Blood Desk",
      "isSample": true
    },
    {
      "id": "DON-09",
      "donorCode": "DONOR-HGL-109",
      "name": "Shreya G. (Verified Volunteer)",
      "bloodGroup": "B+",
      "donationType": "Whole Blood & Platelets",
      "district": "Hooghly",
      "state": "West Bengal",
      "available": true,
      "lastDonationDate": "2026-10-02",
      "verified": true,
      "contactChannel": "Serampore Walsh Hospital Transfusion Desk",
      "isSample": true
    }
  ],
  "notifications": [
    {
      "id": "NOTIF-01",
      "type": "hotspot",
      "title": "Surveillance Advisory: Kolkata & Howrah Urban Corridors",
      "message": "Elevated post-monsoon mosquito breeding indices recorded across Kolkata and Howrah municipal wards. Residents advised to inspect rooftop overhead tanks and flowerpot trays weekly.",
      "severity": "warning",
      "timestamp": "2026-11-10T08:00:00.000Z",
      "read": false
    },
    {
      "id": "NOTIF-02",
      "type": "awareness",
      "title": "Critical Phase Alert (Days 3 to 7)",
      "message": "Severe dengue complications typically begin as high fever subsides. Watch closely for warning signs: persistent vomiting, intense abdominal pain, or mucosal bleeding. Seek emergency care immediately.",
      "severity": "critical",
      "timestamp": "2026-11-09T10:30:00.000Z",
      "read": false
    },
    {
      "id": "NOTIF-03",
      "type": "alert",
      "title": "Free NS1 & Platelet Testing Centers Active",
      "message": "Government medical facilities including ID&BG Hospital Beliaghata, Howrah District Hospital, and Barasat GMC are conducting free daily fever screening and automated CBC testing.",
      "severity": "info",
      "timestamp": "2026-11-08T09:00:00.000Z",
      "read": false
    },
    {
      "id": "NOTIF-04",
      "type": "hotspot",
      "title": "Peri-Urban Vector Control in Howrah & Hooghly",
      "message": "Vector control teams deploying anti-larval biological agents (guppy fish) and Temephos spray across Jagatballavpur, Domjur, and Chinsurah open water bodies.",
      "severity": "info",
      "timestamp": "2026-11-07T14:00:00.000Z",
      "read": true
    }
  ],
  "auditLogs": [
    {
      "id": "LOG-11",
      "action": "System Initialization",
      "details": "DengueShield public health data persistence initialized with verified West Bengal reference dataset.",
      "actor": "Chief System Administrator",
      "timestamp": "2026-10-15T00:00:00.000Z"
    },
    {
      "id": "LOG-10",
      "action": "Facility Registry Verified",
      "details": "Verified 13 state government hospitals and tertiary infectious referral centers across West Bengal.",
      "actor": "State Health Directorate Liaison",
      "timestamp": "2026-10-20T10:00:00.000Z"
    },
    {
      "id": "LOG-09",
      "action": "Case Verified",
      "details": "Verified laboratory confirmation (NS1 Antigen) for case DS-CASE-1001 admitted at ID&BG Hospital.",
      "actor": "Chief Medical Officer (Surveillance)",
      "timestamp": "2026-10-31T12:30:00.000Z"
    },
    {
      "id": "LOG-08",
      "action": "Breeding Hazard Mitigated",
      "details": "Report REP-503 (discarded tire dump, Sodepur) marked Resolved following municipal chemical larviciding.",
      "actor": "Municipal Vector Control Officer",
      "timestamp": "2026-11-07T11:45:00.000Z"
    },
    {
      "id": "LOG-07",
      "action": "Admin Login",
      "details": "Successful authentication into administration panel",
      "actor": "Administrator",
      "timestamp": "2026-11-12T03:18:25.988Z"
    },
    {
      "id": "LOG-06",
      "action": "Admin Login",
      "details": "Successful authentication into administration panel",
      "actor": "Administrator",
      "timestamp": "2026-11-12T03:17:21.106Z"
    },
    {
      "id": "LOG-05",
      "action": "Admin Login",
      "details": "Successful authentication into administration panel",
      "actor": "Administrator",
      "timestamp": "2026-11-12T02:36:06.828Z"
    },
    {
      "id": "LOG-04",
      "action": "Admin Login",
      "details": "Successful authentication into administration panel",
      "actor": "Administrator",
      "timestamp": "2026-11-12T02:35:44.367Z"
    },
    {
      "id": "LOG-03",
      "action": "Admin Login",
      "details": "Successful authentication into administration panel",
      "actor": "Administrator",
      "timestamp": "2026-11-11T05:05:01.776Z"
    },
    {
      "id": "LOG-02",
      "action": "Admin Login",
      "details": "Successful authentication into administration panel",
      "actor": "Administrator",
      "timestamp": "2026-11-11T03:57:47.911Z"
    },
    {
      "id": "LOG-01",
      "action": "Admin Login",
      "details": "Successful authentication into administration panel",
      "actor": "Administrator",
      "timestamp": "2026-11-11T03:57:21.723Z"
    }
  ]
};

function readDb() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(INITIAL_DATABASE, null, 2), "utf8");
      return INITIAL_DATABASE;
    }
    const content = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(content);
  } catch (err) {
    console.error("Database read error:", err);
    return INITIAL_DATABASE;
  }
}

function writeDb(data) {
  try {
    const jsonStr = JSON.stringify(data, null, 2);
    try {
      const tempPath = `${DB_PATH}.tmp`;
      fs.writeFileSync(tempPath, jsonStr, "utf8");
      try {
        fs.renameSync(tempPath, DB_PATH);
      } catch {
        fs.writeFileSync(DB_PATH, jsonStr, "utf8");
        try { fs.unlinkSync(tempPath); } catch {}
      }
    } catch {
      fs.writeFileSync(DB_PATH, jsonStr, "utf8");
    }
    return true;
  } catch (err) {
    console.error("Database write error:", err);
    return false;
  }
}

// -------------------------------------------------------------
// CASES CRUD & QUERY
// -------------------------------------------------------------
export function getCases(filters = {}) {
  const db = readDb();
  let list = db.cases || [];

  if (filters.status) {
    list = list.filter(c => c.status.toLowerCase() === filters.status.toLowerCase());
  }
  if (filters.verificationStatus) {
    list = list.filter(c => c.verificationStatus.toLowerCase() === filters.verificationStatus.toLowerCase());
  }
  if (filters.district) {
    list = list.filter(c => c.district.toLowerCase().includes(filters.district.toLowerCase()));
  }
  if (filters.search) {
    const s = filters.search.toLowerCase();
    list = list.filter(c =>
      c.id.toLowerCase().includes(s) ||
      c.location.toLowerCase().includes(s) ||
      c.testType.toLowerCase().includes(s) ||
      c.status.toLowerCase().includes(s)
    );
  }

  return list;
}

export function getCaseById(id) {
  const db = readDb();
  return (db.cases || []).find(c => c.id === id);
}

export function createCase(data) {
  const db = readDb();
  let counter = (db.cases?.length || 0) + 1;
  let newId = `DS-CASE-${1000 + counter}`;
  while ((db.cases || []).some(c => c.id === newId)) {
    counter++;
    newId = `DS-CASE-${1000 + counter}`;
  }
  const record = {
    id: newId,
    patientCode: `PT-${Math.floor(1000 + Math.random() * 9000)}`,
    age: Number(data.age) || 30,
    gender: data.gender || "Other",
    location: data.location || "Unspecified Location",
    district: data.district || "Kolkata",
    state: data.state || "West Bengal",
    country: data.country || "India",
    latitude: Number(data.latitude) || 22.5726,
    longitude: Number(data.longitude) || 88.3639,
    onsetDate: data.onsetDate || new Date().toISOString().slice(0, 10),
    reportDate: new Date().toISOString().slice(0, 10),
    status: data.status || "Suspected",
    verificationStatus: "Pending",
    testType: data.testType || "Clinical Diagnosis",
    plateletCount: Number(data.plateletCount) || null,
    hospitalized: !!data.hospitalized,
    hospitalName: data.hospitalName || "Home Isolation / Local Clinic",
    notes: data.notes || "",
  };

  db.cases = [record, ...(db.cases || [])];
  writeDb(db);

  addAuditLog("Case Created", `Registered ${record.id} in ${record.location}`, "User Submission");
  return record;
}

export function updateCase(id, updates) {
  const db = readDb();
  const idx = (db.cases || []).findIndex(c => c.id === id);
  if (idx === -1) return null;

  db.cases[idx] = { ...db.cases[idx], ...updates };
  writeDb(db);

  addAuditLog("Case Updated", `Updated ${id} status to ${updates.status || updates.verificationStatus || "updated"}`, updates.actor || "Administrator");
  return db.cases[idx];
}

// -------------------------------------------------------------
// COMMUNITY REPORTS CRUD
// -------------------------------------------------------------
export function getCommunityReports(filters = {}) {
  const db = readDb();
  let list = db.communityReports || [];

  if (filters.status) {
    list = list.filter(r => r.status.toLowerCase() === filters.status.toLowerCase());
  }
  if (filters.category) {
    list = list.filter(r => r.category.toLowerCase() === filters.category.toLowerCase());
  }
  if (filters.district) {
    list = list.filter(r => r.district.toLowerCase().includes(filters.district.toLowerCase()));
  }

  return list;
}

export function createCommunityReport(data) {
  const db = readDb();
  let counter = (db.communityReports?.length || 0) + 1;
  let newId = `REP-${500 + counter}`;
  while ((db.communityReports || []).some(r => r.id === newId)) {
    counter++;
    newId = `REP-${500 + counter}`;
  }
  const report = {
    id: newId,
    title: data.title || "Reported Mosquito Breeding Site",
    category: data.category || "Stagnant Water",
    description: data.description || "Potential mosquito vector breeding habitat reported by community member.",
    location: data.location || "Local Neighborhood",
    district: data.district || "Kolkata",
    latitude: Number(data.latitude) || 22.5726,
    longitude: Number(data.longitude) || 88.3639,
    reportedAt: new Date().toISOString(),
    status: "Pending",
    priority: data.priority || "Medium",
    reporterName: (data.reporterName || "Anonymous Resident").slice(0, 30),
    verifiedBy: null,
    imageUrl: data.imageUrl || "/icon.png",
    actionTaken: "Pending field inspection by municipal vector control team.",
  };

  db.communityReports = [report, ...(db.communityReports || [])];
  writeDb(db);

  addAuditLog("Community Report Created", `Created report ${report.id} at ${report.location}`, "Community Member");
  return report;
}

export function updateCommunityReport(id, updates) {
  const db = readDb();
  const idx = (db.communityReports || []).findIndex(r => r.id === id);
  if (idx === -1) return null;

  db.communityReports[idx] = { ...db.communityReports[idx], ...updates };
  writeDb(db);

  addAuditLog("Report Updated", `Report ${id} marked as ${updates.status}`, updates.actor || "Administrator");
  return db.communityReports[idx];
}

// -------------------------------------------------------------
// SURVEYS & RESPONSES
// -------------------------------------------------------------
export function getSurveys() {
  const db = readDb();
  return db.surveys || [];
}

export function getSurveyById(id) {
  const db = readDb();
  return (db.surveys || []).find(s => s.id === id);
}

export function submitSurveyResponse(surveyId, submission) {
  const db = readDb();
  const idx = (db.surveys || []).findIndex(s => s.id === surveyId);
  if (idx === -1) return null;

  const respId = `RESP-${(db.surveys[idx].responses?.length || 0) + 1}`;
  const record = {
    id: respId,
    location: submission.location || "West Bengal",
    district: submission.district || "Kolkata",
    submittedAt: new Date().toISOString(),
    answers: submission.answers || {},
  };

  db.surveys[idx].responses = [...(db.surveys[idx].responses || []), record];
  writeDb(db);
  return record;
}

// -------------------------------------------------------------
// HOSPITALS & BLOOD DONORS
// -------------------------------------------------------------
export function getHospitals(district = "") {
  const db = readDb();
  let list = db.hospitals || [];
  if (district) {
    list = list.filter(h => h.district.toLowerCase().includes(district.toLowerCase()));
  }
  return list;
}

export function createHospital(data) {
  const db = readDb();
  let counter = (db.hospitals?.length || 0) + 1;
  let newId = `HOSP-${counter}`;
  while ((db.hospitals || []).some(h => h.id === newId)) {
    counter++;
    newId = `HOSP-${counter}`;
  }
  const hospital = {
    id: newId,
    name: data.name,
    type: data.type || "General Hospital",
    district: data.district || "Kolkata",
    state: data.state || "West Bengal",
    address: data.address || "",
    contact: data.contact || "",
    emergencyPhone: data.emergencyPhone || data.contact || "",
    services: Array.isArray(data.services) ? data.services : ["Dengue Management", "Emergency Care"],
    latitude: Number(data.latitude) || 22.5726,
    longitude: Number(data.longitude) || 88.3639,
    bedAvailability: data.bedAvailability || "Available",
    verified: true,
  };
  db.hospitals = [...(db.hospitals || []), hospital];
  writeDb(db);
  return hospital;
}

export function getDonors(filters = {}) {
  const db = readDb();
  let list = db.bloodDonors || [];
  if (filters.bloodGroup) {
    list = list.filter(d => d.bloodGroup.toLowerCase() === filters.bloodGroup.toLowerCase());
  }
  if (filters.district) {
    list = list.filter(d => d.district.toLowerCase().includes(filters.district.toLowerCase()));
  }
  if (filters.availableOnly) {
    list = list.filter(d => d.available);
  }
  return list;
}

export function registerDonor(data) {
  const db = readDb();
  let counter = (db.bloodDonors?.length || 0) + 1;
  let newId = `DON-${counter}`;
  while ((db.bloodDonors || []).some(d => d.id === newId)) {
    counter++;
    newId = `DON-${counter}`;
  }
  const donor = {
    id: newId,
    donorCode: `DONOR-${(data.district || "WB").slice(0, 2).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`,
    name: (data.name || "Anonymous Donor").slice(0, 20),
    bloodGroup: data.bloodGroup || "O+",
    donationType: data.donationType || "Whole Blood & Platelets",
    district: data.district || "Kolkata",
    state: data.state || "West Bengal",
    available: true,
    lastDonationDate: data.lastDonationDate || new Date().toISOString().slice(0, 10),
    verified: true,
    contactChannel: "Hospital Coordinator / Verified Medical Desk",
  };
  db.bloodDonors = [...(db.bloodDonors || []), donor];
  writeDb(db);
  addAuditLog("Donor Registered", `Registered blood donor ${donor.donorCode} (${donor.bloodGroup})`, "User Registration");
  return donor;
}

// -------------------------------------------------------------
// NOTIFICATIONS & AUDIT LOGS
// -------------------------------------------------------------
export function getNotifications() {
  const db = readDb();
  return db.notifications || [];
}

export function addAuditLog(action, details, actor = "System") {
  const db = readDb();
  const nextNum = (db.auditLogs || []).reduce((max, item) => {
    const num = parseInt(item.id?.replace(/\D/g, "") || "0", 10);
    return Math.max(max, isNaN(num) ? 0 : num);
  }, 0) + 1;
  const log = {
    id: `LOG-${String(nextNum).padStart(2, "0")}`,
    action,
    details,
    actor,
    timestamp: new Date().toISOString(),
  };
  db.auditLogs = [log, ...(db.auditLogs || []).slice(0, 99)];
  writeDb(db);
  return log;
}

export function getAuditLogs() {
  const db = readDb();
  return db.auditLogs || [];
}

// -------------------------------------------------------------
// AGGREGATED METRICS (PHASE 2 & PHASE 15)
// -------------------------------------------------------------
export function getPlatformStats() {
  const db = readDb();
  const cases = db.cases || [];
  const reports = db.communityReports || [];

  const totalCases = cases.length;
  const activeCases = cases.filter(c => c.status === "Confirmed" || c.status === "Suspected").length;
  const confirmedCases = cases.filter(c => c.status === "Confirmed").length;
  const suspectedCases = cases.filter(c => c.status === "Suspected").length;
  const recoveredCases = cases.filter(c => c.status === "Recovered").length;
  const deaths = cases.filter(c => c.status === "Deceased").length;

  const verifiedReports = reports.filter(r => r.status === "Verified" || r.status === "Resolved").length;
  const pendingReports = reports.filter(r => r.status === "Pending").length;

  return {
    totalCases,
    activeCases,
    confirmedCases,
    suspectedCases,
    recoveredCases,
    deaths,
    verifiedReports,
    pendingReports,
    totalCommunityReports: reports.length,
    hospitalsCount: db.hospitals?.length || 0,
    donorsCount: db.bloodDonors?.length || 0,
    surveyResponsesCount: (db.surveys?.[0]?.responses?.length || 0),
    lastUpdated: new Date().toISOString(),
  };
}
