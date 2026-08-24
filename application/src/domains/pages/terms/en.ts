import { getLocalizedPagePath } from '~/i18n/routes';

export default {
  metadata: {
    title: 'Terms of Service',
  },
  lastUpdatedLabel: 'Last updated',
  lastUpdated: 'January 6, 2023',
  intro: 'Please read these terms carefully before using our site.',
  sections: [
    {
      title: 'Definitions',
      items: [
        'Company: refers to Cloud Native Provence (or "we").',
        'Service: refers to the Cloud Native Provence website.',
        'User: any natural or legal person accessing the Service.',
        'Device: any tool allowing access to the Service (computer, tablet, phone...).',
      ],
    },
    {
      title: 'Acceptance of Terms',
      paragraphs: [
        'By accessing the Service, you fully and unreservedly accept these Terms of Use. If you disagree with all or part of these terms, you must not use the Service.',
        'You must be at least 18 years old to access the Service.',
      ],
      link: {
        prefix: 'Use of the Service is also subject to our ',
        label: 'Privacy Policy',
        href: getLocalizedPagePath('en', 'privacy'),
        suffix: '.',
      },
    },
    {
      title: 'Links to Third-Party Sites',
      paragraphs: [
        'The Service may contain links to other sites that we do not control. We are not responsible for their content, privacy policy or practices.',
      ],
    },
    {
      title: 'Termination',
      paragraphs: [
        'We reserve the right to suspend or terminate your access to the Service, without notice, in case of non-compliance with these Terms.',
      ],
    },
    {
      title: 'Limitation of Liability',
      paragraphs: [
        'To the extent permitted by law, we shall not be liable for any indirect, consequential or special damages arising from the use or inability to use the Service.',
        'In any case, our liability is limited to the amount possibly paid by you for the use of the Service.',
      ],
    },
    {
      title: 'No Warranty',
      paragraphs: [
        'The Service is provided "as is", without warranty of any kind, express or implied. We do not guarantee that the Service will be available, uninterrupted, secure, or error-free.',
      ],
    },
    {
      title: 'Applicable Law',
      paragraphs: [
        'These Terms are governed by French law. In case of dispute, an amicable resolution attempt must be favored before any legal action.',
      ],
    },
    {
      title: 'European Union Users',
      paragraphs: [
        'As an EU consumer, you benefit from the mandatory provisions of the law of your country of residence.',
      ],
    },
    {
      title: 'Severability',
      paragraphs: [
        'If any provision of these Terms is deemed invalid or unenforceable, the other provisions will remain in full force and effect.',
      ],
    },
    {
      title: 'No Waiver',
      paragraphs: ['The failure of a party to exercise a right does not constitute a waiver of that right.'],
    },
    {
      title: 'Changes',
      paragraphs: [
        'We may change these Terms at any time. We will notify you of any changes by posting the new Terms on this page.',
      ],
    },
    {
      title: 'Contact Us',
      paragraphs: ['If you have any questions about these Terms, you can contact us:'],
      items: ['By email: info@cloudnative-provence.fr'],
    },
  ],
} as const;
