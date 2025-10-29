// A placeholder for a real analytics service
// In a real app, this would send data to a service like Google Analytics, Mixpanel, etc.
export const trackEvent = (eventName: string, properties: object = {}) => {
  console.log(`[Analytics Event] Name: "${eventName}"`, properties);
};
