const {
  getPolly,
  postReplicaStudioAuth,
  getMP3Stream,
  getReplicaStudioVoice,
} = require("./services");
const jwt_decode = require("jwt-decode");

let replicaAccessToken = "";

const isJwtExpired = (accessToken) => {
  const { exp } = jwt_decode(accessToken);
  const dateNow = new Date();

  return exp < dateNow.getTime() / 1000;
};

const getReplicaVoiceStream = async ({ logger, message }) => {
  logger.info({
    message: "Getting voice from Replica Studio",
    method: "getReplicaVoiceStream",
  });
  if (replicaAccessToken.length === 0 || isJwtExpired(replicaAccessToken)) {
    replicaAccessToken = await postReplicaStudioAuth(logger);
  }
  const streamURL = await getReplicaStudioVoice({
    logger,
    message,
    access_token: replicaAccessToken,
  });
  const stream = await getMP3Stream({ logger, url: streamURL });
  return stream;
};

const getPollyVoiceStream = async ({ logger, message }) => {
  logger.info({
    message: "Getting voice from amazon",
    method: "getPollyVoiceStream",
  });
  const params = {
    Text: message,
    OutputFormat: "mp3",
    VoiceId: "Brian",
  };

  const stream = await getPolly(logger, params);

  return stream;
};

const getVendorVoiceStream = async ({
  logger,
  message,
  tts_vendor,
  redis,
  redisCacheKey,
}) => {
  let stream = "";
  switch (tts_vendor) {
    case "REPLICA_STUDIO":
      stream = await getReplicaVoiceStream({ logger, message });
      break;
    case "AWS_POLLY":
      stream = await getPollyVoiceStream({ logger, message });
      break;
    default:
      logger.error("No Stream provider listed.");
  }
  redis.set(redisCacheKey, stream);
  return stream;
};

module.exports = { getVendorVoiceStream };
