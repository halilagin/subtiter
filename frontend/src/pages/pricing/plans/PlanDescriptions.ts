export interface Plan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  popular: boolean;
  color: string;
}

export const plans: Plan[] = [
  {
    id: 'no_plan',
    name: 'No Plan',
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: 'No plan selected',
    features: [],
    popular: false,
    color: '#000000'
  },
  {
    id: 'klippers_level1',
    name: 'Starter',
    monthlyPrice: 29,
    yearlyPrice: 290,
    description: 'For creators getting started',
    features: [
      'Up to 10 videos per month',
      'Basic AI detection',
      'Standard export quality',
      'Email support'
    ],
    popular: false,
    color: '#5a4eff'
  },
  {
    id: 'klippers_level2',
    name: 'Pro',
    monthlyPrice: 79,
    yearlyPrice: 790,
    description: 'For growing creators',
    features: [
      'Up to 100 videos per month',
      'Advanced AI detection',
      '4K export quality',
      'Priority support',
      'Custom branding',
      'Analytics dashboard'
    ],
    popular: true,
    color: '#e05a29'
  },
  {
    id: 'klippers_level3',
    name: 'Enterprise',
    monthlyPrice: 199,
    yearlyPrice: 1990,
    description: 'For teams & agencies',
    features: [
      'Unlimited videos',
      'Enterprise AI models',
      '8K export quality',
      'Dedicated support',
      'White-label solution',
      'API access',
      'Custom integrations'
    ],
    popular: false,
    color: '#132436'
  }
];