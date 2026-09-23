import {
  GraduationCap,
  Globe2,
  HeartPulse,
  Clapperboard,
  Cog,
  Truck,
} from 'lucide-react'

const IMG = '/assets/images/delve-service-sectors'

export const PILLAR_META = [
  {
    key: 'process',
    title: 'New Process',
    image: `${IMG}/Process.png`,
    badge: 'bg-[#fde4e4]',
  },
  {
    key: 'infrastructure',
    title: 'New Infrastructure',
    image: `${IMG}/Infrastructure.png`,
    badge: 'bg-[#e4eefc]',
  },
  {
    key: 'sector',
    title: 'New Sector',
    image: `${IMG}/Private%20sector.png`,
    badge: 'bg-[#e4f7ea]',
  },
  {
    key: 'mindset',
    title: 'New Mindset',
    image: `${IMG}/FormIcon2.png`,
    badge: 'bg-[#efe6fb]',
  },
  {
    key: 'standards',
    title: 'New Standards',
    image: `${IMG}/FormIcon1.png`,
    badge: 'bg-[#fff0e0]',
  },
]

export const SECTORS = [
  {
    id: 'education',
    label: 'Educational Services',
    icon: GraduationCap,
    pillars: {
      process: {
        items: [
          'Ed-Tech Partnerships with Schools',
          'Ed-Tech Community Forums',
          'Global Scholarship Opportunities',
        ],
      },
      infrastructure: {
        items: [
          'Multilingual Online Website',
          'Incubator/Accelerator for Ed-Tech firms',
          'Centre of Excellence for Skill Development',
        ],
      },
      sector: {
        items: [
          'University Funding Allocation',
          'Unique & Business-Integrated Courses',
          'Ed-Tech Venture Fund',
        ],
      },
      mindset: {
        items: [
          'Virtual Reality University Sensitisation',
          'Workshops',
          'Higher Education Awareness Programs (HEAP)',
        ],
      },
      standards: {
        items: ['Credit Transfer Agreements', 'Strengthened EU-Higher Education Links'],
      },
    },
  },
  {
    id: 'remittance',
    label: 'Remittance and Immigration',
    icon: Globe2,
    pillars: {
      process: {
        summary: 'Create Centralized Portal',
        items: [
          "Analyze inward remittance impact on Karnataka's economy annually",
          'Capture remittance data (size, channels, cost, usability)',
          'Create global skills database',
        ],
      },
      infrastructure: {
        summary:
          'Collaborate with RBI, banks, and fintechs to develop affordable, secure, and transparent remittance channels using emerging technologies',
        items: [
          'Multilingual remittance information portal',
          'Digital platforms for diaspora engagement',
          'Secure fintech partnership channels',
        ],
      },
      sector: {
        summary: 'Partner with Companies for Workforce Deployment',
        items: [
          'Overseas employment facilitation units',
          'Skilled workforce deployment programmes',
          'Industry–diaspora collaboration desks',
        ],
      },
      mindset: {
        summary: 'Dedicated Knowledge and Think-Tank for Remittances and Emigration (KTRE)',
        items: [
          'Research on remittance utilisation',
          'Diaspora engagement workshops',
          'Policy inputs for emigration support',
        ],
      },
      standards: {
        summary:
          'Incentive Schemes for Inward Remittances — incentivize Foreign Currency Deposits with Value-Added Bank Services',
        items: [
          'Incentive frameworks for inward remittances',
          'Value-added foreign currency deposit products',
          'Transparent remittance service standards',
        ],
      },
    },
  },
  {
    id: 'health',
    label: 'Health and Wellness',
    icon: HeartPulse,
    pillars: {
      process: {
        items: [
          'Define Wellness Clearly',
          'Brand Karnataka as a Wellness Haven',
          'Create Dedicated Wellness Portal',
          'Enhance Wellness Data Collection',
        ],
      },
      infrastructure: {
        items: [
          'Establish Nearby Critical Care Hospitals',
          'Promote Regional Wellness Specializations',
        ],
      },
      sector: {
        items: ['Engage Digital Marketing Firm for Medical Tourism Promotion'],
      },
      mindset: {
        items: ['Assess Guidelines for Student Teleradiology Training'],
      },
      standards: {
        items: [
          'Raise Minimum Nurse Wage',
          'Optimize Shifts to Reduce Workload',
          'Recognize Work with Bonuses & Certificates',
          'Streamline Regulations & Guarantee Nurse Employment',
        ],
      },
    },
  },
  {
    id: 'media',
    label: 'Media and Entertainment',
    icon: Clapperboard,
    pillars: {
      process: {
        items: ['Incentives for co-producing films in Karnataka'],
      },
      infrastructure: {
        items: ['Development of Karnataka Media City'],
      },
      sector: {
        items: [
          'Promote E-sports for Global Gaming Hub Status',
          'Offer Digital Marketing Grants for Digital Advertising',
          'Provide Credit for Digital Marketing Firms',
        ],
      },
      mindset: {
        items: [
          'Establish Animation & VFX Vision Group',
          'Formalize Digital Marketing Curriculum',
          'Expand Media & Entertainment Leadership Committee',
        ],
      },
      standards: {
        items: ['Industry-Informed Digital Marketing Curriculum'],
      },
    },
  },
  {
    id: 'construction',
    label: 'Construction & Related Engineering Sectors',
    icon: Cog,
    pillars: {
      process: {
        items: [
          'Strengthen planning and site investigation',
          'Reform procurement and strengthen contract management',
          'Improve stakeholder management for land acquisition and approvals',
          {
            text: 'Implement productivity enablers',
            children: ['Lean construction practice', 'Construction waste management'],
          },
        ],
      },
      infrastructure: {
        items: [
          'Promotion and Adoption of digital infrastructure',
          'Bolster Skill Development Resources & Programs',
        ],
      },
      sector: {
        items: [
          'Establish Dedicated Investment Attraction Units',
          'Setup ecosystems to promote OEM suppliers',
          'Allocate funds for promotion and branding activities',
          'Setup ITIs',
        ],
      },
      mindset: {
        items: [
          'Develop risk management culture among construction workers and companies',
        ],
      },
      standards: {
        items: [
          'Develop project management framework',
          'Institutionalize risk management policy',
          'Implement Location-Based Duty Incentives',
          'Implement people management policies for the companies',
        ],
      },
    },
  },
  {
    id: 'transport',
    label: 'Transport and Logistics',
    icon: Truck,
    pillars: {
      process: {
        items: [
          'Ease of doing business',
          'Centralised Agency for Certificates',
          'Streamlined Land Allocation',
          'Exemption of APMC CESS',
        ],
      },
      infrastructure: {
        items: [
          'Development of ICD in Kolar',
          'Approach roads to industrial areas',
          'Improvement of road connectivity',
          'Hassan-Mangaluru Tunnel Corridor',
        ],
      },
      sector: {
        items: ['Establish Logistics Academies in 3 District HQs'],
      },
      mindset: {
        items: [
          'Dedicated vision group – KTL',
          'Logistics strategies for Karnataka',
          'Awareness campaigns',
        ],
      },
      standards: {
        items: [
          "Nodal agency for state's logistics sector",
          'Establish PMU for Transport & Logistics',
        ],
      },
    },
  },
]
