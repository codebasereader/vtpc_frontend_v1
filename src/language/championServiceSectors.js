// Text item — a plain bullet. `nested(text, children)` below builds the
// one item in this section that has sub-bullets (Construction > Process).
function item(en, kn) {
  return { en, kn }
}

function nested(en, kn, children) {
  return { text: { en, kn }, children }
}

export const championServiceSectors = {
  title: {
    en: 'Delve into the Champion Service Sectors',
    kn: 'ಪ್ರಮುಖ ಸೇವಾ ವಲಯಗಳನ್ನು ಅನ್ವೇಷಿಸಿ',
  },
  titleHighlight: {
    en: 'Champion Service Sectors',
    kn: 'ಸೇವಾ ವಲಯಗಳನ್ನು',
  },
  paragraphs: [
    {
      en: 'The Champion Services Sectors are the six key areas that have been identified by the government for focused development, with the goal of driving economic growth and enhancing the nation’s global competitiveness.',
      kn: 'ಚಾಂಪಿಯನ್ ಸೇವಾ ವಲಯಗಳು ಆರ್ಥಿಕ ಬೆಳವಣಿಗೆಯನ್ನು ಮುನ್ನಡೆಸುವ ಮತ್ತು ರಾಷ್ಟ್ರದ ಜಾಗತಿಕ ಸ್ಪರ್ಧಾತ್ಮಕತೆಯನ್ನು ಹೆಚ್ಚಿಸುವ ಗುರಿಯೊಂದಿಗೆ ಸರ್ಕಾರವು ಕೇಂದ್ರೀಕೃತ ಅಭಿವೃದ್ಧಿಗಾಗಿ ಗುರುತಿಸಿರುವ ಆರು ಪ್ರಮುಖ ಕ್ಷೇತ್ರಗಳಾಗಿವೆ.',
    },
    {
      en: "VTPC effects strategies for champion service sectors, boosting growth, investment and export opportunities, and further advancing Karnataka's economy.",
      kn: 'ವಿಟಿಪಿಸಿಯು ಚಾಂಪಿಯನ್ ಸೇವಾ ವಲಯಗಳಿಗೆ ಕಾರ್ಯತಂತ್ರಗಳನ್ನು ಜಾರಿಗೊಳಿಸುತ್ತದೆ, ಬೆಳವಣಿಗೆ, ಹೂಡಿಕೆ ಮತ್ತು ರಫ್ತು ಅವಕಾಶಗಳನ್ನು ಉತ್ತೇಜಿಸುತ್ತದೆ ಮತ್ತು ಕರ್ನಾಟಕದ ಆರ್ಥಿಕತೆಯನ್ನು ಮತ್ತಷ್ಟು ಮುನ್ನಡೆಸುತ್ತದೆ.',
    },
  ],

  tablistLabel: { en: 'Champion service sectors', kn: 'ಪ್ರಮುಖ ಸೇವಾ ವಲಯಗಳು' },

  pillarTitles: {
    process: { en: 'New Process', kn: 'ಹೊಸ ಪ್ರಕ್ರಿಯೆ' },
    infrastructure: { en: 'New Infrastructure', kn: 'ಹೊಸ ಮೂಲಸೌಕರ್ಯ' },
    sector: { en: 'New Sector', kn: 'ಹೊಸ ವಲಯ' },
    mindset: { en: 'New Mindset', kn: 'ಹೊಸ ಮನೋಭಾವ' },
    standards: { en: 'New Standards', kn: 'ಹೊಸ ಮಾನದಂಡಗಳು' },
  },

  sectors: {
    education: {
      label: { en: 'Educational Services', kn: 'ಶಿಕ್ಷಣ ಸೇವೆಗಳು' },
      pillars: {
        process: {
          items: [
            item('Ed-Tech Partnerships with Schools', 'ಶಾಲೆಗಳೊಂದಿಗೆ ಎಡ್-ಟೆಕ್ ಸಹಭಾಗಿತ್ವ'),
            item('Ed-Tech Community Forums', 'ಎಡ್-ಟೆಕ್ ಸಮುದಾಯ ವೇದಿಕೆಗಳು'),
            item('Global Scholarship Opportunities', 'ಜಾಗತಿಕ ವಿದ್ಯಾರ್ಥಿವೇತನ ಅವಕಾಶಗಳು'),
          ],
        },
        infrastructure: {
          items: [
            item('Multilingual Online Website', 'ಬಹುಭಾಷಾ ಆನ್‌ಲೈನ್ ವೆಬ್‌ಸೈಟ್'),
            item('Incubator/Accelerator for Ed-Tech firms', 'ಎಡ್-ಟೆಕ್ ಸಂಸ್ಥೆಗಳಿಗೆ ಇನ್‌ಕ್ಯುಬೇಟರ್/ಆಕ್ಸಿಲರೇಟರ್'),
            item('Centre of Excellence for Skill Development', 'ಕೌಶಲ್ಯ ಅಭಿವೃದ್ಧಿಗಾಗಿ ಶ್ರೇಷ್ಠತಾ ಕೇಂದ್ರ'),
          ],
        },
        sector: {
          items: [
            item('University Funding Allocation', 'ವಿಶ್ವವಿದ್ಯಾಲಯ ನಿಧಿ ಹಂಚಿಕೆ'),
            item('Unique & Business-Integrated Courses', 'ವಿಶಿಷ್ಟ ಮತ್ತು ವ್ಯಾಪಾರ-ಸಂಯೋಜಿತ ಕೋರ್ಸ್‌ಗಳು'),
            item('Ed-Tech Venture Fund', 'ಎಡ್-ಟೆಕ್ ವೆಂಚರ್ ಫಂಡ್'),
          ],
        },
        mindset: {
          items: [
            item('Virtual Reality University Sensitisation', 'ವರ್ಚುವಲ್ ರಿಯಾಲಿಟಿ ವಿಶ್ವವಿದ್ಯಾಲಯ ಜಾಗೃತಿ'),
            item('Workshops', 'ಕಾರ್ಯಾಗಾರಗಳು'),
            item('Higher Education Awareness Programs (HEAP)', 'ಉನ್ನತ ಶಿಕ್ಷಣ ಜಾಗೃತಿ ಕಾರ್ಯಕ್ರಮಗಳು (HEAP)'),
          ],
        },
        standards: {
          items: [
            item('Credit Transfer Agreements', 'ಕ್ರೆಡಿಟ್ ವರ್ಗಾವಣೆ ಒಪ್ಪಂದಗಳು'),
            item('Strengthened EU-Higher Education Links', 'ಬಲಪಡಿಸಿದ ಇಯು-ಉನ್ನತ ಶಿಕ್ಷಣ ಸಂಪರ್ಕಗಳು'),
          ],
        },
      },
    },

    remittance: {
      label: { en: 'Remittance and Immigration', kn: 'ರವಾನೆ ಮತ್ತು ವಲಸೆ' },
      pillars: {
        process: {
          summary: item('Create Centralized Portal', 'ಕೇಂದ್ರೀಕೃತ ಪೋರ್ಟಲ್ ರಚಿಸಿ'),
          items: [
            item(
              "Analyze inward remittance impact on Karnataka's economy annually",
              'ಕರ್ನಾಟಕದ ಆರ್ಥಿಕತೆಯ ಮೇಲೆ ಒಳಬರುವ ರವಾನೆಯ ಪರಿಣಾಮವನ್ನು ವಾರ್ಷಿಕವಾಗಿ ವಿಶ್ಲೇಷಿಸಿ',
            ),
            item(
              'Capture remittance data (size, channels, cost, usability)',
              'ರವಾನೆ ದತ್ತಾಂಶವನ್ನು ಸಂಗ್ರಹಿಸಿ (ಗಾತ್ರ, ಮಾರ್ಗಗಳು, ವೆಚ್ಚ, ಬಳಕೆ)',
            ),
            item('Create global skills database', 'ಜಾಗತಿಕ ಕೌಶಲ್ಯ ದತ್ತಸಂಚಯ ರಚಿಸಿ'),
          ],
        },
        infrastructure: {
          summary: item(
            'Collaborate with RBI, banks, and fintechs to develop affordable, secure, and transparent remittance channels using emerging technologies',
            'ಉದಯೋನ್ಮುಖ ತಂತ್ರಜ್ಞಾನಗಳನ್ನು ಬಳಸಿ ಕೈಗೆಟುಕುವ, ಸುರಕ್ಷಿತ ಮತ್ತು ಪಾರದರ್ಶಕ ರವಾನೆ ಮಾರ್ಗಗಳನ್ನು ಅಭಿವೃದ್ಧಿಪಡಿಸಲು ಆರ್‌ಬಿಐ, ಬ್ಯಾಂಕುಗಳು ಮತ್ತು ಫಿನ್‌ಟೆಕ್‌ಗಳೊಂದಿಗೆ ಸಹಕರಿಸಿ',
          ),
          items: [
            item('Multilingual remittance information portal', 'ಬಹುಭಾಷಾ ರವಾನೆ ಮಾಹಿತಿ ಪೋರ್ಟಲ್'),
            item('Digital platforms for diaspora engagement', 'ಅನಿವಾಸಿ ಸಮುದಾಯ ತೊಡಗಿಸಿಕೊಳ್ಳುವಿಕೆಗಾಗಿ ಡಿಜಿಟಲ್ ವೇದಿಕೆಗಳು'),
            item('Secure fintech partnership channels', 'ಸುರಕ್ಷಿತ ಫಿನ್‌ಟೆಕ್ ಸಹಭಾಗಿತ್ವ ಮಾರ್ಗಗಳು'),
          ],
        },
        sector: {
          summary: item('Partner with Companies for Workforce Deployment', 'ಉದ್ಯೋಗಶಕ್ತಿ ನಿಯೋಜನೆಗಾಗಿ ಕಂಪನಿಗಳೊಂದಿಗೆ ಪಾಲುದಾರಿಕೆ'),
          items: [
            item('Overseas employment facilitation units', 'ವಿದೇಶಿ ಉದ್ಯೋಗ ಸೌಲಭ್ಯ ಘಟಕಗಳು'),
            item('Skilled workforce deployment programmes', 'ನುರಿತ ಉದ್ಯೋಗಶಕ್ತಿ ನಿಯೋಜನಾ ಕಾರ್ಯಕ್ರಮಗಳು'),
            item('Industry–diaspora collaboration desks', 'ಉದ್ಯಮ-ಅನಿವಾಸಿ ಸಹಕಾರ ಡೆಸ್ಕ್‌ಗಳು'),
          ],
        },
        mindset: {
          summary: item(
            'Dedicated Knowledge and Think-Tank for Remittances and Emigration (KTRE)',
            'ರವಾನೆ ಮತ್ತು ವಲಸೆಗಾಗಿ ಸಮರ್ಪಿತ ಜ್ಞಾನ ಮತ್ತು ಚಿಂತಕರ ಚಾವಡಿ (KTRE)',
          ),
          items: [
            item('Research on remittance utilisation', 'ರವಾನೆ ಬಳಕೆಯ ಕುರಿತು ಸಂಶೋಧನೆ'),
            item('Diaspora engagement workshops', 'ಅನಿವಾಸಿ ಸಮುದಾಯ ತೊಡಗಿಸಿಕೊಳ್ಳುವಿಕೆ ಕಾರ್ಯಾಗಾರಗಳು'),
            item('Policy inputs for emigration support', 'ವಲಸೆ ಬೆಂಬಲಕ್ಕಾಗಿ ನೀತಿ ಸಲಹೆಗಳು'),
          ],
        },
        standards: {
          summary: item(
            'Incentive Schemes for Inward Remittances — incentivize Foreign Currency Deposits with Value-Added Bank Services',
            'ಒಳಬರುವ ರವಾನೆಗಳಿಗೆ ಪ್ರೋತ್ಸಾಹಕ ಯೋಜನೆಗಳು — ಮೌಲ್ಯವರ್ಧಿತ ಬ್ಯಾಂಕ್ ಸೇವೆಗಳೊಂದಿಗೆ ವಿದೇಶಿ ಕರೆನ್ಸಿ ಠೇವಣಿಗಳನ್ನು ಪ್ರೋತ್ಸಾಹಿಸಿ',
          ),
          items: [
            item('Incentive frameworks for inward remittances', 'ಒಳಬರುವ ರವಾನೆಗಳಿಗೆ ಪ್ರೋತ್ಸಾಹಕ ಚೌಕಟ್ಟುಗಳು'),
            item('Value-added foreign currency deposit products', 'ಮೌಲ್ಯವರ್ಧಿತ ವಿದೇಶಿ ಕರೆನ್ಸಿ ಠೇವಣಿ ಉತ್ಪನ್ನಗಳು'),
            item('Transparent remittance service standards', 'ಪಾರದರ್ಶಕ ರವಾನೆ ಸೇವಾ ಮಾನದಂಡಗಳು'),
          ],
        },
      },
    },

    health: {
      label: { en: 'Health and Wellness', kn: 'ಆರೋಗ್ಯ ಮತ್ತು ಯೋಗಕ್ಷೇಮ' },
      pillars: {
        process: {
          items: [
            item('Define Wellness Clearly', 'ಯೋಗಕ್ಷೇಮವನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ವ್ಯಾಖ್ಯಾನಿಸಿ'),
            item('Brand Karnataka as a Wellness Haven', 'ಕರ್ನಾಟಕವನ್ನು ಯೋಗಕ್ಷೇಮ ತಾಣವಾಗಿ ಬ್ರಾಂಡ್ ಮಾಡಿ'),
            item('Create Dedicated Wellness Portal', 'ಸಮರ್ಪಿತ ಯೋಗಕ್ಷೇಮ ಪೋರ್ಟಲ್ ರಚಿಸಿ'),
            item('Enhance Wellness Data Collection', 'ಯೋಗಕ್ಷೇಮ ದತ್ತಾಂಶ ಸಂಗ್ರಹಣೆಯನ್ನು ಹೆಚ್ಚಿಸಿ'),
          ],
        },
        infrastructure: {
          items: [
            item('Establish Nearby Critical Care Hospitals', 'ಸಮೀಪದಲ್ಲಿ ತೀವ್ರ ನಿಗಾ ಆಸ್ಪತ್ರೆಗಳನ್ನು ಸ್ಥಾಪಿಸಿ'),
            item('Promote Regional Wellness Specializations', 'ಪ್ರಾದೇಶಿಕ ಯೋಗಕ್ಷೇಮ ವಿಶೇಷತೆಗಳನ್ನು ಉತ್ತೇಜಿಸಿ'),
          ],
        },
        sector: {
          items: [
            item(
              'Engage Digital Marketing Firm for Medical Tourism Promotion',
              'ವೈದ್ಯಕೀಯ ಪ್ರವಾಸೋದ್ಯಮ ಉತ್ತೇಜನಕ್ಕಾಗಿ ಡಿಜಿಟಲ್ ಮಾರ್ಕೆಟಿಂಗ್ ಸಂಸ್ಥೆಯನ್ನು ತೊಡಗಿಸಿ',
            ),
          ],
        },
        mindset: {
          items: [
            item(
              'Assess Guidelines for Student Teleradiology Training',
              'ವಿದ್ಯಾರ್ಥಿ ಟೆಲಿರೇಡಿಯಾಲಜಿ ತರಬೇತಿಗಾಗಿ ಮಾರ್ಗಸೂಚಿಗಳನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡಿ',
            ),
          ],
        },
        standards: {
          items: [
            item('Raise Minimum Nurse Wage', 'ಕನಿಷ್ಠ ನರ್ಸ್ ವೇತನವನ್ನು ಹೆಚ್ಚಿಸಿ'),
            item('Optimize Shifts to Reduce Workload', 'ಕಾರ್ಯಭಾರ ಕಡಿಮೆ ಮಾಡಲು ಪಾಳಿಗಳನ್ನು ಸುಸ್ಥಿತಗೊಳಿಸಿ'),
            item('Recognize Work with Bonuses & Certificates', 'ಬೋನಸ್ ಮತ್ತು ಪ್ರಮಾಣಪತ್ರಗಳೊಂದಿಗೆ ಕೆಲಸವನ್ನು ಗುರುತಿಸಿ'),
            item(
              'Streamline Regulations & Guarantee Nurse Employment',
              'ನಿಯಮಗಳನ್ನು ಸುಸ್ಥಿತಗೊಳಿಸಿ ಮತ್ತು ನರ್ಸ್ ಉದ್ಯೋಗವನ್ನು ಖಚಿತಪಡಿಸಿ',
            ),
          ],
        },
      },
    },

    media: {
      label: { en: 'Media and Entertainment', kn: 'ಮಾಧ್ಯಮ ಮತ್ತು ಮನರಂಜನೆ' },
      pillars: {
        process: {
          items: [item('Incentives for co-producing films in Karnataka', 'ಕರ್ನಾಟಕದಲ್ಲಿ ಸಹ-ನಿರ್ಮಾಣ ಚಿತ್ರಗಳಿಗೆ ಪ್ರೋತ್ಸಾಹಕಗಳು')],
        },
        infrastructure: {
          items: [item('Development of Karnataka Media City', 'ಕರ್ನಾಟಕ ಮೀಡಿಯಾ ಸಿಟಿಯ ಅಭಿವೃದ್ಧಿ')],
        },
        sector: {
          items: [
            item('Promote E-sports for Global Gaming Hub Status', 'ಜಾಗತಿಕ ಗೇಮಿಂಗ್ ಕೇಂದ್ರ ಸ್ಥಾನಮಾನಕ್ಕಾಗಿ ಇ-ಸ್ಪೋರ್ಟ್ಸ್ ಉತ್ತೇಜಿಸಿ'),
            item(
              'Offer Digital Marketing Grants for Digital Advertising',
              'ಡಿಜಿಟಲ್ ಜಾಹೀರಾತಿಗಾಗಿ ಡಿಜಿಟಲ್ ಮಾರ್ಕೆಟಿಂಗ್ ಅನುದಾನಗಳನ್ನು ನೀಡಿ',
            ),
            item('Provide Credit for Digital Marketing Firms', 'ಡಿಜಿಟಲ್ ಮಾರ್ಕೆಟಿಂಗ್ ಸಂಸ್ಥೆಗಳಿಗೆ ಸಾಲ ಸೌಲಭ್ಯ ಒದಗಿಸಿ'),
          ],
        },
        mindset: {
          items: [
            item('Establish Animation & VFX Vision Group', 'ಆನಿಮೇಷನ್ ಮತ್ತು ವಿಎಫ್‌ಎಕ್ಸ್ ದೃಷ್ಟಿ ಗುಂಪನ್ನು ಸ್ಥಾಪಿಸಿ'),
            item('Formalize Digital Marketing Curriculum', 'ಡಿಜಿಟಲ್ ಮಾರ್ಕೆಟಿಂಗ್ ಪಠ್ಯಕ್ರಮವನ್ನು ಔಪಚಾರಿಕಗೊಳಿಸಿ'),
            item('Expand Media & Entertainment Leadership Committee', 'ಮಾಧ್ಯಮ ಮತ್ತು ಮನರಂಜನಾ ನಾಯಕತ್ವ ಸಮಿತಿಯನ್ನು ವಿಸ್ತರಿಸಿ'),
          ],
        },
        standards: {
          items: [item('Industry-Informed Digital Marketing Curriculum', 'ಉದ್ಯಮ-ಆಧಾರಿತ ಡಿಜಿಟಲ್ ಮಾರ್ಕೆಟಿಂಗ್ ಪಠ್ಯಕ್ರಮ')],
        },
      },
    },

    construction: {
      label: {
        en: 'Construction & Related Engineering Sectors',
        kn: 'ನಿರ್ಮಾಣ ಮತ್ತು ಸಂಬಂಧಿತ ಎಂಜಿನಿಯರಿಂಗ್ ವಲಯಗಳು',
      },
      pillars: {
        process: {
          items: [
            item('Strengthen planning and site investigation', 'ಯೋಜನೆ ಮತ್ತು ಸ್ಥಳ ಪರಿಶೋಧನೆಯನ್ನು ಬಲಪಡಿಸಿ'),
            item(
              'Reform procurement and strengthen contract management',
              'ಖರೀದಿ ಪ್ರಕ್ರಿಯೆಯನ್ನು ಸುಧಾರಿಸಿ ಮತ್ತು ಒಪ್ಪಂದ ನಿರ್ವಹಣೆಯನ್ನು ಬಲಪಡಿಸಿ',
            ),
            item(
              'Improve stakeholder management for land acquisition and approvals',
              'ಭೂ ಸ್ವಾಧೀನ ಮತ್ತು ಅನುಮೋದನೆಗಳಿಗಾಗಿ ಪಾಲುದಾರರ ನಿರ್ವಹಣೆಯನ್ನು ಸುಧಾರಿಸಿ',
            ),
            nested('Implement productivity enablers', 'ಉತ್ಪಾದಕತಾ ಸಕ್ರಿಯಕಗಳನ್ನು ಜಾರಿಗೊಳಿಸಿ', [
              item('Lean construction practice', 'ಲೀನ್ ನಿರ್ಮಾಣ ಪದ್ಧತಿ'),
              item('Construction waste management', 'ನಿರ್ಮಾಣ ತ್ಯಾಜ್ಯ ನಿರ್ವಹಣೆ'),
            ]),
          ],
        },
        infrastructure: {
          items: [
            item('Promotion and Adoption of digital infrastructure', 'ಡಿಜಿಟಲ್ ಮೂಲಸೌಕರ್ಯದ ಪ್ರೋತ್ಸಾಹ ಮತ್ತು ಅಳವಡಿಕೆ'),
            item(
              'Bolster Skill Development Resources & Programs',
              'ಕೌಶಲ್ಯ ಅಭಿವೃದ್ಧಿ ಸಂಪನ್ಮೂಲಗಳು ಮತ್ತು ಕಾರ್ಯಕ್ರಮಗಳನ್ನು ಬಲಪಡಿಸಿ',
            ),
          ],
        },
        sector: {
          items: [
            item('Establish Dedicated Investment Attraction Units', 'ಸಮರ್ಪಿತ ಹೂಡಿಕೆ ಆಕರ್ಷಣಾ ಘಟಕಗಳನ್ನು ಸ್ಥಾಪಿಸಿ'),
            item('Setup ecosystems to promote OEM suppliers', 'OEM ಪೂರೈಕೆದಾರರನ್ನು ಉತ್ತೇಜಿಸಲು ಪರಿಸರ ವ್ಯವಸ್ಥೆಗಳನ್ನು ಸ್ಥಾಪಿಸಿ'),
            item('Allocate funds for promotion and branding activities', 'ಪ್ರಚಾರ ಮತ್ತು ಬ್ರಾಂಡಿಂಗ್ ಚಟುವಟಿಕೆಗಳಿಗಾಗಿ ನಿಧಿ ಹಂಚಿಕೆ ಮಾಡಿ'),
            item('Setup ITIs', 'ಐಟಿಐಗಳನ್ನು ಸ್ಥಾಪಿಸಿ'),
          ],
        },
        mindset: {
          items: [
            item(
              'Develop risk management culture among construction workers and companies',
              'ನಿರ್ಮಾಣ ಕಾರ್ಮಿಕರು ಮತ್ತು ಕಂಪನಿಗಳಲ್ಲಿ ಅಪಾಯ ನಿರ್ವಹಣಾ ಸಂಸ್ಕೃತಿಯನ್ನು ಬೆಳೆಸಿ',
            ),
          ],
        },
        standards: {
          items: [
            item('Develop project management framework', 'ಯೋಜನಾ ನಿರ್ವಹಣಾ ಚೌಕಟ್ಟನ್ನು ಅಭಿವೃದ್ಧಿಪಡಿಸಿ'),
            item('Institutionalize risk management policy', 'ಅಪಾಯ ನಿರ್ವಹಣಾ ನೀತಿಯನ್ನು ಸಾಂಸ್ಥಿಕಗೊಳಿಸಿ'),
            item('Implement Location-Based Duty Incentives', 'ಸ್ಥಳ-ಆಧಾರಿತ ಸುಂಕ ಪ್ರೋತ್ಸಾಹಕಗಳನ್ನು ಜಾರಿಗೊಳಿಸಿ'),
            item(
              'Implement people management policies for the companies',
              'ಕಂಪನಿಗಳಿಗಾಗಿ ಸಿಬ್ಬಂದಿ ನಿರ್ವಹಣಾ ನೀತಿಗಳನ್ನು ಜಾರಿಗೊಳಿಸಿ',
            ),
          ],
        },
      },
    },

    transport: {
      label: { en: 'Transport and Logistics', kn: 'ಸಾರಿಗೆ ಮತ್ತು ಲಾಜಿಸ್ಟಿಕ್ಸ್' },
      pillars: {
        process: {
          items: [
            item('Ease of doing business', 'ವ್ಯಾಪಾರ ಸುಲಭತೆ'),
            item('Centralised Agency for Certificates', 'ಪ್ರಮಾಣಪತ್ರಗಳಿಗಾಗಿ ಕೇಂದ್ರೀಕೃತ ಸಂಸ್ಥೆ'),
            item('Streamlined Land Allocation', 'ಸುಸ್ಥಿತ ಭೂ ಹಂಚಿಕೆ'),
            item('Exemption of APMC CESS', 'ಎಪಿಎಂಸಿ ಸೆಸ್‌ನಿಂದ ವಿನಾಯಿತಿ'),
          ],
        },
        infrastructure: {
          items: [
            item('Development of ICD in Kolar', 'ಕೋಲಾರದಲ್ಲಿ ಐಸಿಡಿ ಅಭಿವೃದ್ಧಿ'),
            item('Approach roads to industrial areas', 'ಕೈಗಾರಿಕಾ ಪ್ರದೇಶಗಳಿಗೆ ಸಂಪರ್ಕ ರಸ್ತೆಗಳು'),
            item('Improvement of road connectivity', 'ರಸ್ತೆ ಸಂಪರ್ಕದ ಸುಧಾರಣೆ'),
            item('Hassan-Mangaluru Tunnel Corridor', 'ಹಾಸನ-ಮಂಗಳೂರು ಸುರಂಗ ಕಾರಿಡಾರ್'),
          ],
        },
        sector: {
          items: [item('Establish Logistics Academies in 3 District HQs', '3 ಜಿಲ್ಲಾ ಕೇಂದ್ರಗಳಲ್ಲಿ ಲಾಜಿಸ್ಟಿಕ್ಸ್ ಅಕಾಡೆಮಿಗಳನ್ನು ಸ್ಥಾಪಿಸಿ')],
        },
        mindset: {
          items: [
            item('Dedicated vision group – KTL', 'ಸಮರ್ಪಿತ ದೃಷ್ಟಿ ಗುಂಪು – ಕೆಟಿಎಲ್'),
            item('Logistics strategies for Karnataka', 'ಕರ್ನಾಟಕಕ್ಕಾಗಿ ಲಾಜಿಸ್ಟಿಕ್ಸ್ ಕಾರ್ಯತಂತ್ರಗಳು'),
            item('Awareness campaigns', 'ಜಾಗೃತಿ ಅಭಿಯಾನಗಳು'),
          ],
        },
        standards: {
          items: [
            item("Nodal agency for state's logistics sector", 'ರಾಜ್ಯದ ಲಾಜಿಸ್ಟಿಕ್ಸ್ ವಲಯಕ್ಕಾಗಿ ನೋಡಲ್ ಸಂಸ್ಥೆ'),
            item('Establish PMU for Transport & Logistics', 'ಸಾರಿಗೆ ಮತ್ತು ಲಾಜಿಸ್ಟಿಕ್ಸ್‌ಗಾಗಿ ಪಿಎಂಯು ಸ್ಥಾಪಿಸಿ'),
          ],
        },
      },
    },
  },
}
