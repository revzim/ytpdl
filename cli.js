#!/usr/bin/env node
const ytp = require('./src/index');
const query = require('./src/query');
const yargs = require('yargs');

const sanitize = (input) =>{
  return String(input);
}

const builder = (cmd) =>{
  cmd
    .positional("playlist_id", {
      describe: "youtube playlist id",
      coerce: sanitize,
    })
    .option("quality", {
      describe: "quality: highest | lowest | highestaudio | lowestaudio | highestvideo | lowestvideo",
      coerce: sanitize,
    })
    .option("filter", {
      describe: "video | videoonly | audio | audioonly",
      coerce: sanitize,
    })
}

const handler = (args) => {
  // console.log(args);
  query.get_playlist_data(args.quality && args.quality.includes("video") ? "mp4" : "mp3", args.playlist_id, { limit: Infinity }, playlist_data=>{
    // console.log(playlist_data);
    let i = 1;
    Object.keys(playlist_data).forEach(video_id=>{
      // console.log(playlist_data[video_id].dl.path);
      setTimeout(()=>{
        const yt_opts = {
          quality: args.quality,
        };
        args.filter ? yt_opts.filter = args.filter : console.log("no filter provided");
        query.dl(true, playlist_data[video_id].info, playlist_data[video_id].dl, yt_opts, dl_data=>{
          ytp.log(query.dfix(dl_data));
        });
      }, 1000 * i);
      i++;
    })
  });
}

yargs.command("* <playlist_id>", false, builder, handler).parse();