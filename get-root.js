const fs = require("fs");
const { getPolly } = require("./services");
const { getVendorVoiceStream } = require("./utils");

module.exports = async (req, res) => {
  const logger = req.log;
  try {
    const redis = req.redis;
    const tts_vendor = req.query.vendor || process.env.TTS_VENDOR;
    const redisCacheKey = `${tts_vendor}-${req.url}`;
    const result = await redis.getBuffer(redisCacheKey);
    if (result) {
      logger.info({
        message: "Serving voice from redis-cache",
        method: "get-polly",
        redisCacheKey,
      });
      res.set("Content-Type", "application/octet-stream");
      return res.send(result);
    }
    const stream = await getVendorVoiceStream({
      logger,
      message: req.query.text,
      tts_vendor,
      redisCacheKey,
    });
    return res.send(stream);
  } catch (err) {
    logger.error(err);
    return res.status(500).send({ message: err.message });
  }
};
