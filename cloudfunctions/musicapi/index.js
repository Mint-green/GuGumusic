// 云函数入口文件
const cloud = require('wx-server-sdk')
const {
  search,
  search_default,
  search_hot_detail,
  search_suggest,
  song_url,
  lyric,
  album,
  artists,
  artist_album,
  song_detail,
  toplist,
  toplist_detail,
  top_list,
  personalized,
  playlist_detail,
  toplist_artist
} = require('./NeteaseCloudMusicApi/main')

// cloud.init({
//   env: cloud.DYNAMIC_CURRENT_ENV
// })
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  // const wxContext = cloud.getWXContext()
  let apiname = event.apiname
  
  if (apiname == "search") { //搜索
    let keywords = event.keywords
    let limit = event.limit || 20
    let offset = event.offset || 0
    let type = event.type || 1
    let res = await search({
      keywords,
      limit,
      offset,
      type
    })
    let result = res.body
    return {
      result
    }
    // case "search"
  } else if (apiname == "search_default") {  //获得默认搜索词
    let res = await search_default({})
    let result = res.body
    return {
      result
    }
  } else if (apiname == "search_hot_detail") {  //获得热搜详情
    let res = await search_hot_detail({})
    let result = res.body
    return {
      result
    }
  } else if (apiname == "search_suggest") {  //获得搜索联想词
    let keywords = event.keywords
    let res = await search_suggest({
      keywords,
      type: "mobile"
    })
    let result = res.body
    return {
      result
    }
  } else if (apiname == "album") {  //获取专辑信息(获取歌曲的专辑图片)
    let id = event.id
    let res = await album({
      id
    })
    let result = res.body
    return {
      result
    }
  } else if (apiname == "song_url") {  //获取音乐播放链接
    let id = event.id
    let res = await song_url({
      id
    })
    let result = res.body
    return {
      result
    }
  } else if (apiname == "lyric") {  //获取音乐歌词
    let id = event.id
    let res = await lyric({
      id
    })
    let result = res.body
    return {
      result
    }
  } else if (apiname == "artists") {  //获取歌手单曲
    let id = event.id
    let res = await artists({
      id
    })
    let result = res.body
    return {
      result
    }
  } else if (apiname == "artist_album") {  //获取歌手专辑
    let id = event.id
    let limit = event.limit || 20
    let offset = event.offset || 0
    let res = await artist_album({
      id,
      limit,
      offset
    })
    let result = res.body
    return {
      result
    }
  } else if (apiname == "song_detail") {  //获取歌曲详情(可多个id用逗号分隔传入)
    let ids = event.id
    let res = await song_detail({
      ids
    })
    let result = res.body
    return {
      result
    }
  } else if (apiname == "toplist") {  //获取所有榜单
    let res = await toplist({})
    let result = res.body
    return {
      result
    }
  } else if (apiname == "toplist_detail") {  //获取所有榜单简略信息
    let res = await toplist_detail({})
    let result = res.body
    return {
      result
    }
  } else if (apiname == "top_list") {  //获得排行榜详情
    let id = event.id
    let res = await top_list({
      id
    })
    let result = res.body
    return {
      result
    }
  } else if (apiname == "personalized") {  //获得推荐歌单
    let limit = event.limit || 30
    let res = await personalized({
      limit
    })
    let result = res.body
    return {
      result
    }
  } else if (apiname == "playlist_detail") {  //获取歌单详情
    let id = event.id
    let res = await playlist_detail({
      id
    })
    let result = res.body
    return {
      result
    }
  } else if (apiname == "toplist_artist") {  //获取歌手榜
    if (event.type) {
      let type = event.type
      var res = await toplist_artist({
        type
      })
    } else {
      var res = await toplist_artist({})
    }
    let result = res.body
    return {
      result
    }
  }

  let msg = "api名字写错啦"
  let apilist = [
    "search",
    "search_default",
    "search_hot_detail",
    "search_suggest",
    "song_url",
    "lyric",
    "album",
    "artists",
    "artist_album",
    "song_detail",
    "toplist",
    "toplist_detail",
    "top_list",
    "personalized",
    "playlist_detail",
    "toplist_artist"
  ]

  return {
    // event,
    msg,
    apilist
    // openid: wxContext.OPENID,
    // appid: wxContext.APPID,
    // unionid: wxContext.UNIONID,
  }
}