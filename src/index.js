const YTP = require('./get-ytp.js');
// https://raw.githubusercontent.com/TimeForANinja/node-ytpl/master/lib/util.js
const DEFAULT_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36';
const DEFAULT_HEADERS = { 'user-agent': DEFAULT_USER_AGENT };
const DEFAULT_OPTIONS = { limit: 100, headers: DEFAULT_HEADERS };

let log = (data) => {
  YTP.logger.debug(data);
}

let get_playlist = async(id, options) => {
  let obj = Object.assign({}, DEFAULT_OPTIONS, options);
  if (isNaN(obj.limit) || obj.limit <= 0) obj.limit = DEFAULT_OPTIONS.limit;
  const playlist_object = await YTP.query_yt(id, obj);
  return playlist_object;
};

module.exports = {
  log: log,
  get_playlist: get_playlist,
}