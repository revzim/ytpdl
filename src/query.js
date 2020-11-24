const fs = require('fs');
const path = require('path');
const ytdl = require('ytdl-core');
const ytp = require('./index');

const get_playlist_data = (save_type="mp3", id, options, cb) => {
  console.log(id);
  const videos_data = {};
  let err_ctr = 0;
  ytp.get_playlist(id, options).then(video_items=>{
    const video_keys = Object.keys(video_items.data);
    video_keys.forEach(video_id=>{
      ytdl_get_info(video_id, data=>{
        if (!data.error) {
          const video_details = data.videoDetails;
          delete video_details.availableCountries;
    
          const video_title = video_details.title;
    
          const thumbnails = video_details.thumbnail.thumbnails;
    
          const player_resp = data.player_response || data.playerResponse;
    
          const streaming_data = player_resp.streamingData;
    
          // FORMATS & ADAPTIVEFORMATS ARRAYS OF VIDEO DATA
          const formats = streaming_data.formats;
          formats.push(...streaming_data.adaptiveFormats);
    
          let video_dl_data = formats.map(data=>{
            return {
              title: video_title,
              id: video_id,
              thumbnails: thumbnails,
              type: data.mimeType.includes("audio") ? "audio" : "video",
              mime_type: data.mimeType,
              quality: data.audioQuality || data.qualityLabel,
              url: data.url,
            }
          });
          
          
          // video_item_data[video_id] = data;
          videos_data[video_id] = {
            data: video_dl_data,
            dl: {
              id: video_id,
              url: data.url,
              title: video_title,
              path: `${id}/${video_id}.${save_type}`,
              size: null,
            },
            playlist_id: id,
            info: data,
          };
          ytp.log(dfix({[video_id]: videos_data[video_id]}));
          ytp.log("-----------------------------------------------------------------------------------------------------");
          
          if (Object.keys(videos_data).length == video_keys.length-err_ctr) cb(videos_data);
        } else {
          console.log("ERROR:");
          err_ctr++;
        }
      });
    });
  })
  .catch(err=>{
    console.log(err);
    cb(err);
  })
}

const dfix = (data) =>{
  return JSON.stringify(data, null, "  ")
}

let ytdl_get_info = (id, cb) => {
  // var ids = [];
  const url = `http://www.youtube.com/watch?v=${id}`;
  ytdl.getInfo(url)
    .then(info=>{
      cb(info);
    })
    .catch(err=>{
      cb({ finished: false, data: null, error: err })
    })
}

let yt_dl = (force_redownload, info, save_object, opts={quality: 'highestaudio', filter: 'audioonly'}, cb) => {
  // let fpath = path.join(__dirname, save_object.path);
  // let dir = path.join(__dirname, save_object.path.split("/")[0]);
  // if (!fs.existsSync(dir)) {
  //   fs.mkdirSync(dir);
  // }
  // let fpath = path.join(__dirname, save_object.path);
  // dl(info, save_object, opts, fpath, data=>{
  //   cb(data);
  // }); 
  let dir = save_object.path.split("/")[0]
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  let fpath = save_object.path;
  if (!fs.existsSync(fpath) || force_redownload) {
    if (force_redownload && fs.existsSync(fpath)) ytp.log(dfix({
      id: "force.redownload",
      data: {
        id: save_object.id,
        title: save_object.title,
      },
    }));
    dl(info, save_object, opts, fpath, data=>{
      cb(data);
    }); 
  } else {
    ytp.log(dfix({
      error: "file already exists!",
      data:{ 
        path: fpath,
        object: save_object,
      }
    }))
    cb();
  }
  
}

let dl = (info, save_object, opts, fpath, cb) => {
  let dlinfo = ytdl.downloadFromInfo(info, opts)
  dlinfo.pipe(fs.createWriteStream(fpath))
  dlinfo.on('response', function (res) {
    // let total_size = res.headers['content-length'];
    let data_read = 0;
    res.on('data', function (data) {
      data_read += data.length;
      /*
      let percent = data_read / total_size;
      ytp.log(dfix({
        percent: (percent * 100).toFixed(2),
        id: save_object.id,
        title: save_object.title,
      }));
      */
    })
    
    res.on('end', () => {
      save_object.size = {
        readable: `${(data_read/1000000).toFixed(2)} MB`,
        n: data_read, 
      };
      ytp.log(dfix({
        id: "download.finish",
        data: {
          title: save_object.title,
          id: save_object.id,
          size: save_object.size,
        }
      }));
      cb({ finished: true, data: save_object });
    })
  })
}

module.exports = {
  get_playlist_data: get_playlist_data,
  dl: yt_dl,
  get_info: ytdl_get_info,
  dfix: dfix,
}