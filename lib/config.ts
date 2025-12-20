// Application configuration
export const config = {
  // Daily free tier API call limit (per 24-hour period, resets at 00:00 GMT+8)
  FREE_TIER_DAILY_LIMIT: parseInt(process.env.NEXT_PUBLIC_FREE_TIER_DAILY_LIMIT || '5', 10),
  
  // Maximum original text length in UTF-8 characters
  MAX_TEXT_LENGTH: parseInt(process.env.NEXT_PUBLIC_MAX_TEXT_LENGTH || '5000', 10),
};
