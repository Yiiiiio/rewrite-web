import pino from "pino";
import { config } from "../config.js";

// 确保日志在生产环境也能正常工作
export const logger = pino({
  level: config.logLevel,
  ...(config.env === "development"
    ? {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard"
          }
        }
      }
    : {
        // 生产环境使用 JSON 格式
        formatters: {
          level: (label) => {
            return { level: label };
          }
        }
      })
});

