const log4js = require('log4js');

const get = require('miniget');

let logger;

const START_TIME = Date.now();

const init_logger = ()=>{
  log4js.configure({
    appenders: {'ytpdl': {type: "file", filename: `logs/${Math.floor(START_TIME/86400000)}/${START_TIME}.log`} },
    categories: {default: {appenders: ["ytpdl"], level: "debug"}},
  })
  
  logger = log4js.getLogger("ytpdl");
  
  logger.level = 'debug';

  module.exports.logger = logger;
}

init_logger();


const get_playlist_info = (body, playlist_id) => {
  // logger.debug(removeHtml(body));
  const indicators = {
    starter: 'window["ytInitialData"]',
    ender: 'window["ytInitialPlayerResponse"] = null;',
    cutoff: '    ; window["ytInitialPlayerRes',
  }
  const new_body = body.substr(body.indexOf(indicators.starter));
  let payload = new_body.substr(indicators.starter.length+3, new_body.indexOf(indicators.ender)-indicators.cutoff.length);

  try {
    const parsed_payload = JSON.parse(payload);
    // logger.debug(Object.keys(parsed_payload));
    const SECTION_LIST_RENDERER      = parsed_payload.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0];
    const ITEM_SECTION_RENDERER      = SECTION_LIST_RENDERER.itemSectionRenderer.contents[0];
    const PLAYLIST_RENDERER          = ITEM_SECTION_RENDERER.playlistVideoListRenderer;
    const PLAYLIST_RENDERER_CONTENTS = PLAYLIST_RENDERER.contents;
    // logger.debug(PLAYLIST_RENDERER_CONTENTS);
    // OBJECT KEYS AS OF 2020/11/22
    /*
      [
        'videoId' = string,
        'thumbnail' = object,
        'title' = object,
        'index' = object,
        'shortBylineText' = object,
        'lengthText' = object,
        'navigationEndpoint' = object,
        'lengthSeconds' = string,
        'trackingParams' = string,
        'isPlayable' = boolean,
        'menu' = object,
        'thumbnailOverlays = object'
      ]
    * HELP WITH TYPES METHOD:
    * const _pl_key_handler = {};
    * let i = 0;
      let pl_renderer_keys = Object.keys(item.playlistVideoRenderer);
      Object.values(item.playlistVideoRenderer).forEach(val=>{
        pl_key_handler[pl_renderer_keys[i]] = `${typeof val}`;
        i++;
      });
      logger.debug(pl_key_handler);
    * 
    */
    const video_items = {};
    PLAYLIST_RENDERER_CONTENTS.forEach(item=>{
      // logger.debug(item.playlistVideoRenderer); // item.playlistVideoRenderer == ARRAY OF ITEMS
      video_items[item.playlistVideoRenderer.videoId] = item.playlistVideoRenderer;
    });
    // logger.debug(JSON.stringify(video_items, null, "  "));
    return {
      id: playlist_id,
      data: video_items,
    }
  } catch(e) {
    // logger.debug("error parsing payload:", e);
    return {
      error: `${e}`,
      id: playlist_id,
    }
  }
};

module.exports.query_yt = async(playlist_id, options) => {
  const extra_query_params = '&hl=en&disable_polymer=true';
  const body = await get(
    `https://www.youtube.com/playlist?list=${playlist_id}${extra_query_params}`,
    options,
  ).text();

  // PLAYLIST INFO
  return get_playlist_info(body, playlist_id);
}
