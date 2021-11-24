const AWS = require("aws-sdk");
const axios = require("axios");

// adapters are axios modules that handle dispatching a request and settling a returned Promise once a response is received.
const httpAdapter = require("axios/lib/adapters/http");

const Polly = new AWS.Polly({
  signatureVersion: "v4",
  region: "us-east-1",
});

const getPolly = (logger, params) =>
  Polly.synthesizeSpeech(params, (err, data) => {
    if (err) {
      logger.error(err.code);
      return err;
    } else if (data) {
      if (data.AudioStream instanceof Buffer) {
        return data.AudioStream;
      }
    }
    return {};
  })
    .promise()
    .then((audio) => audio.AudioStream);

const postReplicaStudioAuth = (logger) => {
  const params = new URLSearchParams();
  params.append("client_id", process.env.REPLICA_STUDIO_CLIENT_ID);
  params.append("secret", process.env.REPLICA_STUDIO_CLIENT_SECRET);
  return axios
    .post("https://api.replicastudios.com/auth", params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    })
    .then(({ data }) => {
      logger.info("postReplicaStudioAuth Success!", { data });
      const { access_token } = data;
      return access_token;
    })
    .catch((e) => {
      logger.error("postReplicaStudioAuth Failed!", e);
      throw e;
    });
};

const getReplicaStudioVoice = ({ logger, message, access_token }) => {
  const headers = { Authorization: `Bearer ${access_token}` };
  const params = new URLSearchParams();
  params.append("quality", "high");
  params.append("txt", message);
  params.append("speaker_id", process.env.REPLICA_STUDIO_SPEAKER_ID);

  return axios
    .get("https://api.replicastudios.com/speech", {
      headers,
      params,
    })
    .then(({ data }) => {
      logger.info("getReplicaStudioVoice Success!", { data });
      const { url } = data;
      return url;
    })
    .catch((e) => {
      logger.error("getReplicaStudioVoice Failed!", e);
      throw e;
    });
};

const getMP3Stream = ({ logger, url }) => {
  return axios
    .get(url, {
      responseType: "arraybuffer",
      adapter: httpAdapter,
    })
    .then(({ data }) => {
      logger.info("getMP3Stream Success");
      return data;
    })
    .catch((e) => {
      logger.error("getMP3Stream Error", e);
      throw e;
    });
};

module.exports = {
  getPolly,
  postReplicaStudioAuth,
  getReplicaStudioVoice,
  getMP3Stream,
};
