## ytpdl - cache your youtube playlists

### cache your youtube audio/video playlists (audio/video/both) for offline listening/viewing

## usage
* npm install -g ytpdl | npm install ytpdl
* then run `ytpdl <playlist_id>` to start caching for offline use

```
ytpdl <playlist_id>

Positionals:
  playlist_id  youtube playlist id

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
  --quality  quality: highest | lowest | highestaudio | lowestaudio |
             highestvideo | lowestvideo
  --filter   video | videoonly | audio | audioonly
```

## output
* once the script has finished
* playlist directory:
  * your playlist directory will generate within the folder you run ytpdl from.
  * the directory is named after the playlist id you queried
  * all cached items of the specified playlist will can be found within this directory
* logs directory:
  * a log output directory will also generate within the folder you run ytpdl from. each log file will contain: 
    * metadata about the playlist & video items
    * errors


### 2 filetypes right now only mp3/mp4

#### dependencies:
* yargs
* log4js
* miniget
* ytdl-core

##### author: revzim