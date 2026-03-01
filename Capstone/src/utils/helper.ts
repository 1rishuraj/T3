// utils/addressTruncator.ts

export function truncateAddress(address: string): string {
  console.log(address)
  if (!address) {
    address="yeloBhaiyeloBhaiyeloBhaiyeloBhaiyeloBhaiyeloBhaiyeloBhaiyeloBhaiyeloBhaiyeloBhai"
    // throw new Error('Invalid address')
  }

  const truncated = `${address.slice(0, 4)}...${address.slice(-4)}`
  return truncated
}

