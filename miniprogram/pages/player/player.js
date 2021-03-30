const app = getApp().globalData
const song = require('../../utils/song.js')
const Lyric = require('../../utils/lyric.js')
const util = require('../../utils/util.js')
import regeneratorRuntime from '../../lib/runtime/runtime';
const apilist = require('../../utils/apilist.js')

const manage = wx.getBackgroundAudioManager()

const SEQUENCE_MODE = 1
const RANDOM_MOD = 2
const SINGLE_CYCLE_MOD = 3

Page({
  data: {
    playIcon: 'icon-play',
    cdplay: 'cdplay',
    cdCls: 'pause',
    currentSong: null,
    dotsArray: new Array(2),
    currentDot: 0,
    songslist: [],
    playMod: SEQUENCE_MODE,
    max: 0,
    move: 0,
    islike: false,
    lyricAndTime: [],
    currentLineNum: 0,
    currentText: "",
    toLineNum: 0,
    currentIndex: 0,
    playState: false,
    priorityQueue: [],
    playHistory: [],
    isgettingsong: false,
    historyIndex: -1,
    middleheight: 656,
  },
  timer: null,
  musicstate: {
    duration: 0,
    currentTime: 0,
    status: 2,
  },
  islovelist: true,
  isPriorityQueue: false,

  onLoad: function () {
    this.setmiddle()
    this._init()
    this.settimer()
    this.priorityQueuelistener()
  },

  onShow: function () {
    this._init()
    this.setmiddle()
  },

  setmiddle: function () {
    let system = wx.getSystemInfoSync()
    console.log(system)
    let windowHeight = system.windowHeight
    let windowWidth = system.windowWidth
    let responseRatio = 750 / windowWidth
    let rpxHeight = windowHeight * responseRatio
    let middleheight = rpxHeight - 454
    this.setData({ middleheight })
  },

  //初始化
  _init: function () {
    let _this = this
    console.log(_this.timer)
    _this.initState()
    let songslist = (app.songlist.length && app.songlist) || wx.getStorageSync('songlist')
    if (songslist == 0 && app.isAuthorize == true) {
      songslist = app.userInfo.lovelist
    }
    let priorityQueue = app.priorityQueue
    let playHistory = app.playHistory
    let playMod = app.playMod
    let currentSong = app.currentSong
    let currentIndex = app.currentIndex
    this.isPlayingLovelist = app.isPlayingLovelist
    if (currentSong.toString() == "") { return }
    let currentSongId = currentSong.id
    let islike = false
    if (app.isAuthorize == true) {
      for (let i = 0; i < app.userInfo.lovelist.length; i++) {
        if (currentSongId == app.userInfo.lovelist[i].id) {
          islike = true
        }
      }
    }
    let duration = currentSong.duration
    duration = duration / 1000
    let lyric = currentSong.lyric
    console.log("duration is " + duration)
    if (!duration || duration == null) {
      setTimeout(function () {
        _this.setData({
          duration: _this._formatTime(manage.duration)
        })
      }, 2000)
    } else {
      _this.setData({
        duration: _this._formatTime(duration)
      })
    }
    this.setData({
      max: duration,
      lyricAndTime: lyric,
      currentSong,
      songslist,
      currentIndex,
      playHistory,
      priorityQueue,
      playMod,
      islike,
    })
  },

  //初始化播放状态显示
  initState: function () {
    let _this = this
    this.musicstate.status = 2
    wx.getBackgroundAudioPlayerState({
      complete: (res) => {
        let status = res.status
        if (status == 0 || status == 2) {
          _this.setData({
            cdplay: "cdplay",
            playIcon: 'icon-play',
            cdCls: 'pause',
            playState: false,
          })
        } else if (status == 1) {
          _this.setData({
            cdplay: "cdplay",
            playIcon: 'icon-pause',
            cdCls: 'play',
            playState: true,
          })
        }
      }
    })
  },

  //设置定时器
  settimer: function () {
    let _this = this
    this.timer = setInterval(this.movetimerfunc, 50)
  },

  priorityQueuelistener: function () {
    let _this = this
    let temp = app.priorityQueue
    Object.defineProperty(app, 'priorityQueue', {
      get: function () {
        return temp
      },
      set: function (e) {
        console.log("priorityQueue更新")
        _this.setData({
          priorityQueue: e
        })
        temp = e
      }
    })
  },

  //正常监听播放状态并更新滑块位置
  movetimerfunc: function () {
    // console.log("timer还在")
    let _this = this
    wx.getBackgroundAudioPlayerState({
      complete: (res) => {
        // console.log(res)
        let status = res.status
        let showstatus = _this.musicstate.status
        let currentTime = manage.currentTime
        let showTime = _this.musicstate.currentTime
        if (currentTime != showTime) {
          _this.setData({
            currentTime: _this._formatTime(currentTime),
            move: currentTime
          })
          if (_this.data.lyricAndTime) {
            _this.handleLyric(currentTime)
          }
          _this.musicstate.currentTime = currentTime
        }
        if (status != showstatus) { //歌曲状态变化则去要做出改变
          _this.musicstate.status = status
          if (status == 0) { //状态变为暂停
            // console.log(res.downloadPercent)
            console.log("status is ", status)
            // _this.musicstate.status = status
            _this.setData({
              playIcon: 'icon-play',
              cdCls: 'pause',
              playState: false,
            })
          } else if (status == 1) { //状态变为播放
            // _this.musicstate.status = status
            if (_this.data.cdplay == '') {
              _this.setData({ cdplay: 'cdplay' })
            }
            console.log("status is ", status)
            _this.setData({
              playIcon: 'icon-pause',
              cdCls: 'play',
              playState: true
            })
          } else if (status == 2 && res.downloadPercent == 100) { //状态变为无歌曲播放(且下载完毕)，切歌
            // } else if (status == 2) { //状态变为无歌曲播放，切歌
            console.log("status is ", status)
            _this.setData({
              playIcon: 'icon-play',
              cdCls: 'pause',
              playState: false,
              cdplay: '',
              move: 0,
              currentTime: _this._formatTime(0),
              currentLineNum: 0,
              currentText: "",
              toLineNum: 0,
            })
            console.log("要切歌了")
            clearInterval(_this.timer)
            console.log("定时器关闭了")
            setTimeout(() => {
              // _this.musicstate.status = status
              if (_this.data.playMod == SINGLE_CYCLE_MOD) {
                let currentSong = _this.data.currentSong
                manage.stop()
                manage.src = currentSong.songurl
                manage.title = currentSong.name + "-" + currentSong.artist
                manage.coverImgUrl = currentSong.albumpic
                // wx.playBackgroundAudio({
                //   dataUrl: currentSong.songurl,
                //   title: currentSong.name + "-" + currentSong.artist,
                //   coverImgUrl: currentSong.albumpic
                // })  //播放音乐
                setTimeout(() => {
                  _this.musicstate.status = 2
                  _this.timer = setInterval(_this.movetimerfunc, 50)
                  console.log("定时器打开了")
                  _this.setData({
                    playIcon: 'icon-play',
                    cdCls: 'pause',
                    playState: false,
                    currentLineNum: 0,
                    currentText: "",
                    toLineNum: 0,
                    move: 0,
                    currentTime: _this._formatTime(0),
                  })
                  // console.log(_this.timer)
                }, 1000)
              } else {
                _this.next()
              }

            }, 0.1)
            return
          }
          // _this.musicstate.status = status
        }
        //真机status==2可能不一定成立，以阈值为0.1秒认定歌曲播放结束
        if (currentTime - res.duration > -0.1 && status != 2) {
          console.log("用播放进度判断")
          console.log("status is ", status)
          _this.setData({
            playIcon: 'icon-play',
            cdCls: 'pause',
            playState: false,
            cdplay: '',
            move: 0,
            currentTime: _this._formatTime(0),
            currentLineNum: 0,
            currentText: "",
            toLineNum: 0,
          })
          console.log("要切歌了")
          clearInterval(_this.timer)
          console.log("定时器关闭了")
          // _this.musicstate.status = 2
          setTimeout(() => {
            if (_this.data.playMod == SINGLE_CYCLE_MOD) {
              let currentSong = _this.data.currentSong
              // manage.src = ""
              manage.stop()
              manage.src = currentSong.songurl
              manage.title = currentSong.name + "-" + currentSong.artist
              manage.coverImgUrl = currentSong.albumpic
              // wx.playBackgroundAudio({
              //   dataUrl: currentSong.songurl,
              //   title: currentSong.name + "-" + currentSong.artist,
              //   coverImgUrl: currentSong.albumpic
              // })  //播放音乐
              setTimeout(() => {
                _this.musicstate.status = 2
                _this.timer = setInterval(_this.movetimerfunc, 50)
                console.log("定时器打开了")
                _this.setData({
                  cdplay: "cdplay",
                  cdCls: "play",
                  playIcon: "icon-pause"
                })
                //   console.log(_this.timer)
              }, 1000)
            } else {
              _this.next()
            }

          }, 0.1)
        }
      },
    })
  },

  //拖动滑块时不需要根据音乐进度更新滑块位置
  nomovetimerfunc: function () {
    let _this = this
    wx.getBackgroundAudioPlayerState({
      complete: (res) => {
        // console.log(res)
        let status = res.status
        let showstatus = _this.musicstate.status
        if (status != showstatus) {
          if (status == 0 || status == 2) {
            console.log("status is ", status)
            _this.setData({
              playIcon: 'icon-play',
              cdCls: 'pause',
              playState: false,
            })
            _this.musicstate.status = status
          } else if (status == 1) {
            console.log("status is ", status)
            _this.setData({
              playIcon: 'icon-pause',
              cdCls: 'play',
              playState: true
            })
          }
          _this.musicstate.status = status
        }
        let currentTime = manage.currentTime
        let showTime = _this.musicstate.currentTime
        console.log("currentTime is ", manage.currentTime)
        if (currentTime != showTime) {
          if (_this.data.lyricAndTime) {
            _this.handleLyric(currentTime)
          }
          _this.musicstate.currentTime = currentTime
        }
        if (currentTime - res.duration > -0.1) {
          manage.pause()
          _this.setData({
            playIcon: 'icon-play',
            cdCls: 'pause',
            playState: false,
          })
        }
      },
    })
  },

  //拖动滑块并松手
  dragBar: function (e) {
    var value = e.detail.value
    // this.setData({
    //   move: value,
    // })
    clearInterval(this.timer)
    manage.seek(value)
    this.setData({
      currentTime: this._formatTime(value),
    })
    this.handleLyric(value)
    this.timer = setInterval(this.movetimerfunc, 50)
  },

  //拖动滑块中
  draggingBar: function (e) {
    var value = e.detail.value
    clearInterval(this.timer)
    this.timer = setInterval(this.nomovetimerfunc, 50)
    this.setData({
      currentTime: this._formatTime(value),
    })
  },

  // 歌词滚动回调函数
  handleLyric: function (currentTime) {
    let _this = this
    let lyricTime = this.data.lyricAndTime
    if (lyricTime.length == 0) {
      return
    }
    if (currentTime > lyricTime[lyricTime.length - 1].timeSec) {
      _this.setData({
        currentLineNum: lyricTime.length - 1,
        currentText: lyricTime[lyricTime.length - 1] && lyricTime[lyricTime.length - 1].lrc,
        toLineNum: lyricTime - 6
      })
    }
    for (let i = 0, len = lyricTime.length; i < len; i++) {
      if (currentTime <= lyricTime[i].timeSec) {
        _this.setData({
          currentLineNum: i - 1,
          currentText: lyricTime[i - 1] && lyricTime[i - 1].lrc
        })
        let toLineNum = i - 6
        if (i > 6 && toLineNum != this.data.toLineNum) {
          // if (toLineNum != this.data.toLineNum) {
          _this.setData({
            toLineNum
          })
          // }
        } else if (i < 6 && this.data.toLineNum != 0) {
          _this.setData({
            toLineNum: 0
          })
        }
        break
      }
    }
  },

  //往前播放历史
  prev: function () {
    let isgettingsong = this.data.isgettingsong
    if (isgettingsong) { return }
    let playHistory = this.data.playHistory
    let historyIndex = this.data.historyIndex
    let currentSong = {}
    app.priorityQueue = []
    this.setData({ priorityQueue: [] })
    this.isPriorityQueue = false
    // if (playHistory.toString() == "") {
    if (playHistory.length <= 1) {
      console.log("无历史")
      let currentIndex = this.data.currentIndex
      currentIndex = currentIndex - 1
      if (currentIndex == -1) { currentIndex == this.data.songslist.length - 1 }
      currentSong = this.data.songslist[currentIndex]
    } else if (historyIndex == -1) {
      console.log("第一次播放历史播放过历史")
      currentSong = playHistory[1]
      this.setData({
        historyIndex: 1
      })
    } else {
      historyIndex++
      if (historyIndex >= playHistory.length) {
        return
      }
      currentSong = playHistory[historyIndex]
      this.setData({
        historyIndex,
      })
    }
    this.playsong(currentSong, true)
  },

  //获取下一首播放歌曲索引
  next: function () {
    let isgettingsong = this.data.isgettingsong
    if (isgettingsong) { return }
    let _this = this
    let priorityQueue = this.data.priorityQueue
    this.setData({
      historyIndex: -1,
    })
    //分为有优先队列和无优先队列两种情况
    if (priorityQueue.length > 0) {
      //优先队列要先删除第一项，然后再检查是否有歌曲对象
      let priortySong = priorityQueue.shift()
      app.priorityQueue = priorityQueue
      _this.setData({ priorityQueue })
      _this.playsong(priortySong)
      _this.isPriorityQueue = true
    } else {
      //若无优先队列，则获取当前播放的歌曲在播放列表中的索引
      let currentIndex = this.data.currentIndex
      let playMod = this.data.playMod
      let songslist = this.data.songslist
      if (songslist.length == 0) { return }
      let currentSong = {}
      let nextIndex = -1
      this.isPriorityQueue = false
      //根据播放模式设置新的索引，并讲对象赋值给currentSong，后面作为参数传递给播放的函数
      if (playMod == SEQUENCE_MODE || playMod == SINGLE_CYCLE_MOD) { //顺序播放和单曲循环模式同样是播放下一曲(单曲循环只在歌曲自然结束的时候循环)
        nextIndex = currentIndex + 1
        if (nextIndex >= this.data.songslist.length) { nextIndex = 0 }
      } else if (playMod == RANDOM_MOD) { //随机播放通过Math.random()获取播放索引
        nextIndex = currentIndex;
        if (songslist.length == 1) {
          nextIndex = 0
        } else {
          while (nextIndex == currentIndex) {
            nextIndex = Math.floor(Math.random() * songslist.length)
            console.log("nextIndex ", nextIndex)
          }
        }
      }
      currentSong = songslist[nextIndex]
      _this.setData({
        currentIndex: nextIndex,
      })
      app.currentIndex = nextIndex
      _this.playsong(currentSong)
    }
  },

  playsong: async function (currentSong, ishistory) {
    let isgettingsong = this.data.isgettingsong
    if (isgettingsong) { return }
    this.setData({ isgettingsong: true })
    let _this = this
    wx.showLoading({
      title: '玩命加载中...',
    })
    setTimeout(() => {
      _this.setData({ isgettingsong: false })
      wx.hideLoading()
    }, app.timeout)
    //获取已有的信息
    let songname = currentSong.name
    let artist = currentSong.artist
    let songid = currentSong.id
    let duration = currentSong.duration
    let albumid = currentSong.albumid
    let albumname = currentSong.albumname
    console.log(songname)
    //先获取歌曲链接，若获取不到，则不必查歌词和封面了
    let songurlres = await apilist.song_url({ id: songid })
    let songurl = songurlres.data[0].url
    if (!songurl || songurl == "") {//应该检查播放链接是否为空，若不是播放链接则wx.showToast提示，不进行跳转
      wx.showToast({
        title: '此歌暂不支持播放哦',
        icon: 'none',
        mask: true,
        duration: 1000
      })
      console.log('此歌暂不支持播放哦')
      this.setData({ isgettingsong: false })
      this.next()
      return
    }
    //若非播放历史记录则需要添加到历史记录队列中
    if (!ishistory) {
      let playHistory = this.data.playHistory
      if (playHistory.length >= 100) {
        playHistory.pop()
      }
      playHistory.unshift(currentSong)
      app.playHistory = playHistory
      this.setData({
        playHistory,
        historyIndex: -1,
      })
      wx.setStorageSync('playHistory', playHistory)
    }
    let albumpic = ""
    if (currentSong.albumpic) {
      albumpic = currentSong.albumpic
    } else {
      let albuminfo = await apilist.album({ id: albumid })
      albumpic = albuminfo.album.picUrl
    }
    console.log(songurl)
    let lyric = await apilist.lyric({ id: songid })
    console.log(lyric)
    let songtitle = songname + "-" + artist
    wx.playBackgroundAudio({
      dataUrl: songurl,
      title: songtitle,
      coverImgUrl: albumpic
    })  //播放音乐
    console.log(_this.timer)
    clearInterval(_this.timer)
    console.log("定时器关闭了")
    _this.setData({ cdplay: '' })
    _this.setData({
      // cdplay: '',
      // cdplay: "cdplay",
      cdCls: "play",
      playIcon: "icon-pause",
      move: 1,
      currentTime: _this._formatTime(1),
    })
    setTimeout(() => {
      this.musicstate.status = 2
      _this.timer = setInterval(_this.movetimerfunc, 50)
      console.log("定时器打开了")
      // setTimeout(() => {
      //   _this.setData({
      //     cdplay: "cdplay",
      //   })
    }, 1000)
    //   console.log(_this.timer)
    // }, 2000)
    let songinfo = {
      name: songname,
      artist: artist,
      id: songid,
      duration: duration,
      albumid: albumid,
      albumpic: albumpic,
      albumname: albumname,
      songurl: songurl,
      lyric: lyric
    }
    currentSong = songinfo
    app.currentSong = currentSong
    let islike = false
    if (app.isAuthorize == true) {
      for (let i = 0; i < app.userInfo.lovelist.length; i++) {
        if (songid == app.userInfo.lovelist[i].id) {
          islike = true
        }
      }
    }
    this.setData({
      max: duration / 1000,
      duration: this._formatTime(duration / 1000),
      lyricAndTime: lyric,
      currentSong,
      isgettingsong: false,
      currentLineNum: 0,
      currentText: "",
      toLineNum: 0,
      islike,
    })
    wx.hideLoading()
  },

  playthis: function (e) {
    let index = e.currentTarget.dataset.index
    app.currentIndex = index
    app.priorityQueue = []
    let songslist = this.data.songslist
    let currentSong = songslist[index]
    this.setData({
      currentIndex: index,
      priorityQueue: [],
      translateCls: 'downtranslate'
    })
    this.isPriorityQueue = false
    this.playsong(currentSong)
  },

  //切换播放模式
  changeMod: function () {
    let playMod = this.data.playMod
    playMod++
    if (playMod > SINGLE_CYCLE_MOD) {
      playMod = SEQUENCE_MODE
    }
    this.setData({
      playMod,
    })
    app.playMod = playMod
    wx.setStorageSync('playMod', playMod)
  },

  //我喜欢
  unlikeOrLike: async function () {
    if (JSON.stringify(app.currentSong) == "{}") { return }
    if (app.isAuthorize != true) {
      wx.showToast({
        title: '还没有登录哦',
        icon: 'none',
      })
      return
    }
    var islike = this.data.islike
    // return
    let lovelist = app.userInfo.lovelist
    let songslist = this.data.songslist
    if (islike) { //喜欢变成不喜欢要从喜欢列表中删去
      let currentSongId = this.data.currentSong.id
      let currentIndex = this.data.currentIndex
      for (var i = 0; i < lovelist.length; i++) { //从我喜欢歌单中删去
        if (lovelist[i].id == currentSongId) {
          lovelist.splice(i, 1)
          break
        }
      }
      if (this.isPlayingLovelist) {
        songslist = lovelist
        if (currentIndex > i) {  //若当前索引在该首歌在我喜欢列表中的索引之后，则需要减一补空
          currentIndex--
        } else if (currentIndex == i && currentIndex != 0) {  //若当前索引在在歌单中的索引之后且不为零，则需要当前索引减一
          currentIndex--
        }
        this.setData({
          songslist,
          currentIndex
        })
        app.songlist = songslist
        app.currentIndex = currentIndex
      }
      // console.log(lovelist)
    } else { //若是变成喜欢，则要添加到播放列表和我喜欢列表中
      let currentSong = this.data.currentSong
      let likesong = {
        name: currentSong.name,
        artist: currentSong.artist,
        id: currentSong.id,
        duration: currentSong.duration,
        albumid: currentSong.albumid,
        albumname: currentSong.albumname
      }
      lovelist.unshift(likesong)
      // console.log(lovelist)
      if (this.isPlayingLovelist) {
        this.setData({ songslist: lovelist })
        app.songlist = lovelist
        app.currentIndex = app.currentIndex + 1
      }
    }
    islike = !islike
    this.setData({
      islike
    })
    let updateres = await apilist.updatelovelist({ lovelist })
    console.log(updateres)
    app.userInfo.lovelist = lovelist
  },

  //分享到博客
  shareToBlog: function () {
    if (!app.isAuthorize) {
      wx.showToast({
        title: '登录了才能分享噢~',
        icon: 'none'
      })
      return
    }
    // let music = {
    //   id: this.data.currentSong.id,
    //   name: this.data.currentSong.name,
    //   artist: this.data.currentSong.artist,
    //   albumname: this.data.currentSong.albumname,
    //   albumpic: this.data.currentSong.albumpic,
    // }
    let music = true
    wx.navigateTo({
      url: `/pages/blog-edit/blog-edit?music=${music}`,
    })
    // const app = getApp().globalData
    // let obj = {
    //   name: songname,
    //   artist: artistname,
    //   id: songid,
    //   picurl: songpic
    // }
    // app.sharesong = obj
  },

  togglePlaying: function () {
    if (!this.data.currentSong.name) { return }
    if (this.data.playState) {
      console.log("要暂停")
      manage.pause()
      this.setData({
        playState: false,
        playIcon: 'icon-play',
        cdCls: 'pause',
      })
    } else {
      console.log("要播放")
      manage.play()
      this.setData({
        playState: true,
        playIcon: 'icon-pause',
        cdCls: 'play',
      })
    }
  },

  openList: function () {
    if (!this.data.songslist.length) {
      return
    }
    this.setData({
      translateCls: 'uptranslate'
    })
  },

  close: function () {
    this.setData({
      translateCls: 'downtranslate'
    })
  },

  changeDot: function (e) {
    this.setData({
      currentDot: e.detail.current
    })
  },

  //处理歌曲时长
  _formatTime: function (interval) {
    interval = interval | 0
    let minute = interval / 60 | 0
    let second = interval % 60 > 9 ? interval % 60 : '0' + interval % 60
    return `${minute}:${second}`
  },

  onHide: function () {
    this.close()
  },
})
