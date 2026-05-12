export const PLATFORM_FEE_PERCENT = 12;

export function calculateFees(studioPrice: number) {
  const platformFee  = Math.round(studioPrice * PLATFORM_FEE_PERCENT) / 100;
  const total        = Math.round((studioPrice + platformFee) * 100) / 100;
  return { studioPrice, platformFee, total };
}
