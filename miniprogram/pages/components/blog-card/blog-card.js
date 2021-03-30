import formatTime from './../../../utils/format-time.js'
import regeneratorRuntime from '../../../lib/runtime/runtime';
const apilist = require('../../../utils/apilist.js')

const app = getApp()

let blogOpenid = "" // 我喜欢的博客openid
let dataset = {} // 自定义属性值
let myLoveBloglist = [] // 定义一个临时我的喜爱博客数组列表
let tempLoveList = [] // 临时存放storage中我喜爱的博客列表
let loveBlog = {} // 临时存放当前博客信息

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blog: Object,
    // playingid: String,
    blogid: {
      type: String,
      value: ""
    }
  },

  // externalClasses: ['icon-playnow','icon-stopnow'],

  data: {
    playing: false, // 视频是否自动播放
    isLove: false, // 是否喜欢，默认false不喜欢
    _publishTime: '', // 格式化后的时间
    _loveNum: 0, // 博客初始化爱心数量
    loveBloglist: [], // 用户喜欢的博客列表
    blogInfo: {}, // 修复Bug的博客信息（进入博客评论页时）
    isplaying: false, //该博客的音乐是否在播放
    intervalTimer: null, //interval计时器
    timeoutTimer: null, //timeout计时器
  },

  options: {
    styleIsolation: 'apply-shared',
    // addGlobalClass: true
  },

  lifetimes: {
    ready() {
      console.log("ready")
      this._getBlogInfo()
    }
  },

  pageLifetimes: {
    show() {
      console.log("show")
      this._getBlogInfo()
    }
  },
  /**
   * 数据监听器 observers
   */
  observers: {
    ['blog.publishTime'](val) {
      if (val) {
        this.setData({
          _publishTime: formatTime(val, 'yy-MM-dd ww | zz hh:mm')
        })
      }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 预览图片
    onPreviewImg(event) {
      dataset = event.target.dataset
      wx.previewImage({
        urls: dataset.images,
        current: dataset.imgsrc
      })
    },

    // 播放视频
    onPlaying() {
      // 获取video实例
      let videoContext = wx.createVideoContext('blogVideo', this)

      if (!this.data.playing) {
        videoContext.play() //开始播放
        videoContext.requestFullScreen() // 进入全屏
        videoContext.seek(0)
        this.setData({
          playing: true
        })
      } else {
        videoContext.pause() //暂停播放
        videoContext.exitFullScreen() // 进入全屏
        videoContext.stop()
        this.setData({
          playing: false
        })
      }
    },

    // 通过id拿到对应的blog信息内容（修复进入评论页没有爱心数据的BUG）
    _getBlogInfo() {
      let _blogid = this.properties.blogid || this.properties.blog._id
      wx.cloud.callFunction({
        name: 'blog',
        data: {
          $url: "detail",
          blogid: _blogid
        }
      }).then((res) => {
        this.setData({
          blogInfo: res.result.blogDetail[0]
        })
        this._getLoveBloglist()

        for (let i = 0, len = this.data.loveBloglist.length; i < len; i++) {
          if (this.data.blogInfo._id == this.data.loveBloglist[i]._id) {
            this.setData({
              isLove: true
            })
            break
          } else {
            this.setData({
              isLove: false
            })
          }
        }
        this.setData({
          _loveNum: this.data.blogInfo.loveNum
        })
        // 获取展示视频的控件进行暂停视频
        if (this.data.blogInfo.publishType == 1) {
          let videoReady = wx.createVideoContext('blogVideo')
          videoReady.pause()
          videoReady.stop()
        }
      })
    },

    // 向storage拿去用户喜爱的博客列表
    _getLoveBloglist() {
      blogOpenid = app.globalData.blogOpenid
      const loveBloglist = wx.getStorageSync(blogOpenid)
      this.setData({
        loveBloglist: loveBloglist
      })
    },

    // 点击博客卡片的爱心时进行的操作逻辑
    support() {
      this._getLoveBloglist()
      tempLoveList = this.data.loveBloglist
      loveBlog = this.data.blogInfo

      if (this.data.isLove) {
        this.setData({
          _loveNum: this.data._loveNum - 1
        })

        // 设置blogOpenid的storage数据（删）
        for (let i = 0, len = tempLoveList.length; i < len; i++) {
          if (loveBlog._id == tempLoveList[i]._id) {
            tempLoveList.splice(i, 1)
            break
          }
        }
        wx.setStorageSync(blogOpenid, tempLoveList)

        // 向数据库更新数据 (减)
        wx.cloud.callFunction({
          name: "blog",
          data: {
            $url: "reduceLove",
            currentBlogid: loveBlog._id
          }
        })
      } else {
        this.setData({
          _loveNum: this.data._loveNum + 1
        })

        // 设置blogOpenid的storage数据（增）
        tempLoveList.unshift(loveBlog)
        wx.setStorageSync(blogOpenid, tempLoveList)

        // 向数据库更新数据 (增)
        wx.cloud.callFunction({
          name: "blog",
          data: {
            $url: "incLove",
            currentBlogid: loveBlog._id
          }
        })
      }
      this.setData({
        isLove: !this.data.isLove
      })
    },

    async playthis() {
      wx.showLoading({
        title: '玩命加载中...',
      })
      console.log("这是有音乐的博客")
      console.log(this.data.blog)
      let song = this.data.blog.music
      console.log(song)
      setTimeout(() => {
        wx.hideLoading()
      }, app.globalData.timeout)
      // let index = e.currentTarget.dataset.index
      // console.log("即将播放博客中的歌曲" + index + "首")
      let ids = song.id.toString()
      let songresult = await apilist.song_detail({ id: ids })
      console.log(songresult)
      // return
      let songres = songresult.songs[0]
      let songname = songres.name
      let songid = songres.id
      let duration = songres.dt
      let albumid = songres.al.id
      let albumname = songres.al.name
      let albumpic = songres.al.picUrl
      let artist = ""
      for (var u = 0; u < songres.ar.length; u++) {
        artist = artist + songres.ar[u].name + "、"
      }
      artist = artist.substring(0, artist.length - 1)
      let songurlres = await apilist.song_url({ id: songid })
      let songurl = songurlres.data[0].url
      if (!songurl || songurl == "") {//应该检查播放链接是否为空，若不是播放链接则wx.showToast提示，不进行跳转
        wx.showToast({
          title: '此歌暂不支持播放哦',
          icon: 'none',
          mask: true,
          duration: 1000
        })
        return
      }
      let playHistory = app.globalData.playHistory
      if (playHistory.length >= 100) {
        playHistory.pop()
      }
      playHistory.unshift({
        id: songid,
        name: songname,
        duration: duration,
        artist: artist,
        albumname: albumname,
        albumid: albumid,
      })
      app.globalData.playHistory = playHistory
      this.setData({
        playHistory,
        historyIndex: -1,
      })
      wx.setStorageSync('playHistory', playHistory) //可以播放则插入历史记录中
      // console.log(albumpic)
      // console.log(songurl)
      let lyric = await apilist.lyric({ id: songid }) //获取歌词
      // console.log(lyric)
      let songtitle = songname + "-" + artist
      wx.playBackgroundAudio({
        dataUrl: songurl,
        title: songtitle,
        coverImgUrl: albumpic
      })  //播放音乐
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
      app.globalData.priorityQueue = []
      app.globalData.currentSong = songinfo
      wx.hideLoading()
      this.setData({ isplaying: true })
      let _this=this
      this.data.intervalTimer = setInterval(function () {
        if (app.globalData.currentSong.id != songid) {
          _this.setData({ isplaying: false })
          clearInterval(_this.data.intervalTimer)
          clearTimeout(_this.data.timeoutTimer)
        }
      }, 200)
      this.data.timeoutTimer = setTimeout(function () {
        _this.setData({ isplaying: false })
        clearInterval(_this.data.intervalTimer)
      }, duration)
    },

    stopthis() {
      wx.getBackgroundAudioManager().pause()
      this.setData({ isplaying: false })
      clearInterval(this.data.intervalTimer)
      clearTimeout(this.data.timeoutTimer)
    }
  }
})