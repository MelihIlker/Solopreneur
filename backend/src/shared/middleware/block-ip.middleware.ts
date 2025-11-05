import { PREFIX_CONFIG } from "@config/config";
import { setCache } from "@lib/redis";
import { appLogger } from "@utils/logger";

/**
 * Blocks an IP address for a specified duration
 * @param {string} ip - IP address to block
 * @param {number} [durationInSeconds=3600] - Block duration in seconds (default: 1 hour)
 * @returns {Promise<boolean>} True if IP was blocked successfully
 * @example
 * await blockIP('192.168.1.1', 3600); // Block for 1 hour
 */
export const blockIP = async (
  ip: string,
  durationInSeconds: number = 3600
): Promise<boolean> => {
  const blockKey = `${PREFIX_CONFIG.BLOCKED_IP_PREFIX}${ip}`;
  appLogger.info(
    { ipAdress: ip },
    `Ip adress blocked for ${durationInSeconds} second.`
  );
  return await setCache(blockKey, "1", durationInSeconds);
};
