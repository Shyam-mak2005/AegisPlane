export const ttlToMilliseconds = (value: string) => {
  const match = value.match(/^(\d+)([smhd])$/i);

  if (!match) {
    throw new Error(`Unsupported TTL format: ${value}`);
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();

  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
  };

  return amount * multipliers[unit];
};