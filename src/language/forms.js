export const forms = {
  registerLink: { en: 'Click here to Register', kn: 'ನೋಂದಾಯಿಸಲು ಇಲ್ಲಿ ಕ್ಲಿಕ್ ಮಾಡಿ' },
  announcements: { en: 'Announcements', kn: 'ಪ್ರಕಟಣೆಗಳು' },
  page: {
    loading: { en: 'Loading form…', kn: 'ಫಾರ್ಮ್ ಲೋಡ್ ಆಗುತ್ತಿದೆ…' },
    requiredNote: { en: '* Required', kn: '* ಕಡ್ಡಾಯ' },
    submit: { en: 'Submit', kn: 'ಸಲ್ಲಿಸಿ' },
    submitting: { en: 'Submitting…', kn: 'ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆ…' },
    selectPlaceholder: { en: 'Select an option', kn: 'ಒಂದು ಆಯ್ಕೆಯನ್ನು ಆರಿಸಿ' },
    checkErrors: {
      en: 'Please fix the highlighted fields and try again.',
      kn: 'ದಯವಿಟ್ಟು ಗುರುತಿಸಿದ ಕ್ಷೇತ್ರಗಳನ್ನು ಸರಿಪಡಿಸಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    },
    error: {
      en: 'Something went wrong while submitting. Please try again.',
      kn: 'ಸಲ್ಲಿಸುವಾಗ ಏನೋ ತಪ್ಪಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    },
    thanksTitle: { en: 'Thank you!', kn: 'ಧನ್ಯವಾದಗಳು!' },
    thanksBody: {
      en: 'Your response has been recorded.',
      kn: 'ನಿಮ್ಮ ಪ್ರತಿಕ್ರಿಯೆಯನ್ನು ದಾಖಲಿಸಲಾಗಿದೆ.',
    },
    submitAnother: { en: 'Submit another response', kn: 'ಮತ್ತೊಂದು ಪ್ರತಿಕ್ರಿಯೆ ಸಲ್ಲಿಸಿ' },
    backHome: { en: 'Back to home', kn: 'ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ' },
    closedTitle: { en: 'This form is not available', kn: 'ಈ ಫಾರ್ಮ್ ಲಭ್ಯವಿಲ್ಲ' },
    closedBody: {
      en: 'It may have been closed or the link is incorrect.',
      kn: 'ಇದನ್ನು ಮುಚ್ಚಿರಬಹುದು ಅಥವಾ ಲಿಂಕ್ ತಪ್ಪಾಗಿರಬಹುದು.',
    },
    rateOutOf: { en: 'out of 5', kn: '5 ರಲ್ಲಿ' },
  },
  validation: {
    required: { en: 'This question is required.', kn: 'ಈ ಪ್ರಶ್ನೆ ಕಡ್ಡಾಯ.' },
    invalidEmail: { en: 'Enter a valid email address.', kn: 'ಮಾನ್ಯ ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ.' },
    invalidPhone: { en: 'Enter a valid phone number.', kn: 'ಮಾನ್ಯ ಫೋನ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.' },
    invalidNumber: { en: 'Enter a valid number.', kn: 'ಮಾನ್ಯ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.' },
  },
}

// Flat { key: 'message' } for one language, as the validator expects.
export function validationMessages(language) {
  return Object.fromEntries(Object.entries(forms.validation).map(([key, value]) => [key, value[language] || value.en]))
}
