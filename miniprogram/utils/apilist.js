//搜索
//固定：apiname:"search",必选参数：keywords,可选参数：limit,offset,type(1:单曲，10：专辑，100：歌手)
const search = (data) => {
    // console.log(data)
    data.apiname = "search"
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: "musicapi",
            data,
            success: function (res) {
                console.log(res)
                resolve(res.result.result.result)
            },
            fail: function (err) {
                reject(err)
            }
        })
    })
}

//获取默认搜索词
//固定：apiname:"search_default"
const search_default = (data) => {
    data.apiname = "search_default"
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: "musicapi",
            data,
            success: function (res) {
                resolve(res.result.result)
            },
            fail: function (err) {
                reject(err)
            }
        })
    })
}

//获取热搜关键词
//固定：apiname:"search_hot_detail"
const search_hot_detail = (data) => {
    data.apiname = "search_hot_detail"
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: "musicapi",
            data,
            success: function (res) {
                resolve(res.result.result)
            },
            fail: function (err) {
                reject(err)
            }
        })
    })
}

//获取搜索推荐（搜索词联想）
//固定：apiname:"search_suggest",必选参数：keywords
const search_suggest = (data) => {
    data.apiname = "search_suggest"
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: "musicapi",
            data,
            success: function (res) {
                resolve(res.result.result)
            },
            fail: function (err) {
                reject(err)
            }
        })
    })
}

//获取音乐播放链接
//固定：apiname:"song_url",必选参数：id
const song_url = (data) => {
    data.apiname = "song_url"
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: "musicapi",
            data,
            success: function (res) {
                resolve(res.result.result)
            },
            fail: function (err) {
                reject(err)
            }
        })
    })
}

//获取歌词
//固定：apiname:"lyric",必选参数：id
const lyric = (data) => {
    data.apiname = "lyric"
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: "musicapi",
            data,
            success: function (res) {
                // console.log(res)
                if (!res.result.result.lrc || res.result.result.lrc == null) {
                    // console.log("暂无歌词")
                    if(res.result.result.nolyric){
                        resolve("纯音乐，请欣赏")
                    }
                    resolve("暂无歌词")
                } else {
                    var sLyric = res.result.result.lrc.lyric
                    let line = sLyric.split('\n')
                    // console.log(line)
                    var lyricAndTime = []
                    line.forEach((item) => {
                        let time = item.match(/\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?]/g)
                        if (time != null) {
                            let lrc = item.split(time)[1]
                            let timeReg = time[0].match(/(\d{2,}):(\d{2})(?:\.(\d{2,3}))?/)
                            let timeSec = parseInt(timeReg[1] * 60) + parseInt(timeReg[2]) + Number(timeReg[3] / 1000)
                            lyricAndTime.push({
                                lrc,
                                timeSec
                            })
                        }
                    })
                    resolve(lyricAndTime)
                }
            },
            fail: function (err) {
                reject(err)
            }
        })
    })
}

//获取专辑信息(可用于获取歌曲的专辑图片)
//固定：apiname:"album",必选参数：id
const album = (data) => {
    data.apiname = "album"
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: "musicapi",
            data,
            success: function (res) {
                resolve(res.result.result)
            },
            fail: function (err) {
                reject(err)
            }
        })
    })
}

//获取歌手单曲
//固定：apiname:"artists",必选参数：id
const artists = (data) => {
    data.apiname = "artists"
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: "musicapi",
            data,
            success: function (res) {
                resolve(res.result.result)
            },
            fail: function (err) {
                reject(err)
            }
        })
    })
}

//获取歌手专辑
//固定：apiname:"artist_album",必选参数：id,可选参数：limit,默认为20,offset,默认为0
const artist_album = (data) => {
    data.apiname = "artist_album"
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: "musicapi",
            data,
            success: function (res) {
                resolve(res.result.result)
            },
            fail: function (err) {
                reject(err)
            }
        })
    })
}

//获取歌曲详情
//固定：apiname:"song_detail",必选参数：id(可多个id用逗号分隔传入)
const song_detail = (data) => {
    data.apiname = "song_detail"
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: "musicapi",
            data,
            success: function (res) {
                resolve(res.result.result)
            },
            fail: function (err) {
                reject(err)
            }
        })
    })
}

//获取所有榜单
//固定：apiname:"toplist"
const toplist = (data) => {
    data.apiname = "toplist"
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: "musicapi",
            data,
            success: function (res) {
                resolve(res.result.result)
            },
            fail: function (err) {
                reject(err)
            }
        })
    })
}

//获取所有榜单简略信息
//固定：apiname:"toplist_detail"
const toplist_detail = (data) => {
    data.apiname = "toplist_detail"
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: "musicapi",
            data,
            success: function (res) {
                resolve(res.result.result)
            },
            fail: function (err) {
                reject(err)
            }
        })
    })
}

//获得排行榜详情
//固定：apiname:"top_list",必选参数：id
const top_list = (data) => {
    data.apiname = "top_list"
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: "musicapi",
            data,
            success: function (res) {
                resolve(res.result.result)
            },
            fail: function (err) {
                reject(err)
            }
        })
    })
}

//获得推荐歌单
//固定：apiname:"personalized",可选参数：limit，默认为30
const personalized = (data) => {
    data.apiname = "personalized"
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: "musicapi",
            data,
            success: function (res) {
                resolve(res.result.result)
            },
            fail: function (err) {
                reject(err)
            }
        })
    })
}

//获取歌单详情
//固定：apiname:"playlist_detail",必选参数：id
const playlist_detail = (data) => {
    data.apiname = "playlist_detail"
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: "musicapi",
            data,
            success: function (res) {
                resolve(res.result.result)
            },
            fail: function (err) {
                reject(err)
            }
        })
    })
}

//获取歌手榜
//固定：apiname:"toplist_artist",可选参数：type，1:华语 2:欧美 3:韩国 4:日本
const toplist_artist = (data) => {
    data.apiname = "toplist_artist"
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: "musicapi",
            data,
            success: function (res) {
                resolve(res.result.result)
            },
            fail: function (err) {
                reject(err)
            }
        })
    })
}

const updatelovelist= (data) => {
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: "updatelovelist",
            data,
            success: function (res) {
                resolve(res)
            },
            fail: function (err) {
                reject(err)
            }
        })
    })
}

module.exports = {
    search: search,
    search_default: search_default,
    search_hot_detail: search_hot_detail,
    search_suggest: search_suggest,
    song_url: song_url,
    lyric: lyric,
    album: album,
    artists: artists,
    artist_album: artist_album,
    song_detail: song_detail,
    toplist: toplist,
    toplist_detail: toplist_detail,
    top_list: top_list,
    personalized: personalized,
    playlist_detail: playlist_detail,
    toplist_artist: toplist_artist,
    updatelovelist: updatelovelist,
}