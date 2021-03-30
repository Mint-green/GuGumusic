// pages/album-detail/album-detail.js
import regeneratorRuntime from '../../lib/runtime/runtime';
const apilist = require('../../utils/apilist.js')
const app = getApp().globalData

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isactive: [true, false],
    id: 0,
    songresult: [],
    albuminfo: {},
    songdetail: {},
    songtranslateCls: "",
    songanimationclass: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let pages = getCurrentPages();
    let currentPage = pages[pages.length - 1]
    let options = currentPage.options
    let id = options.id
    this.setData({
      id,
    })
    this.getalbumdetail()
  },

  getalbumdetail: async function () {
    wx.showLoading({
      title: '玩命加载中...',
    })
    let { id } = this.data
    let albumdetailres = await apilist.album({ id })
    console.log(albumdetailres)
    let albuminfores = albumdetailres.album
    let albumartist = ""
    for (var k = 0; k < albuminfores.artists.length; k++) {
      albumartist = albumartist + albuminfores.artists[k].name + "、"
    }
    albumartist = albumartist.substring(0, albumartist.length - 1)
    let albuminfo = {
      id: albuminfores.id,
      publishTime: this.formatTime(albuminfores.publishTime),
      picUrl: albuminfores.picUrl,
      name: albuminfores.name,
      description: albuminfores.description,
      artist: albumartist,
      company: albuminfores.company,
      size: albuminfores.size,
    }
    let albumsongs = albumdetailres.songs
    let songresult = []
    for (var i = 0; i < albumsongs.length; i++) {
      let song = new Object()
      song.id = albumsongs[i].id
      song.albumid = albumsongs[i].al.id
      song.name = albumsongs[i].name
      song.duration = albumsongs[i].dt
      song.albumname = albumsongs[i].al.name
      song.albumpic = albuminfores.picUrl
      let artist = ""
      for (var j = 0; j < albumsongs[i].ar.length; j++) {
        artist = artist + albumsongs[i].ar[j].name + "、"
      }
      artist = artist.substring(0, artist.length - 1)
      song.artist = artist
      songresult[i] = song
    }
    // wx.setStorageSync('albumsongs', songresult)
    // wx.setStorageSync('albuminfo', albuminfo)
    // let songresult = wx.getStorageSync('albumsongs')
    // let albuminfo = wx.getStorageSync('albuminfo')
    console.log(songresult)
    this.setData({
      albuminfo,
      songresult
    })
    wx.hideLoading()
  },

  play: async function (e) {
    wx.showLoading({
      title: '玩命加载中...',
    })
    setTimeout(() => { wx.hideLoading() }, app.timeout)
    let index = e.currentTarget.dataset.index
    console.log("即将播放第" + index + "首")
    let songs = this.data.songresult
    let songname = songs[index].name
    let artist = songs[index].artist
    let songid = songs[index].id
    let duration = songs[index].duration
    let albumid = songs[index].albumid
    let albumpic = songs[index].albumpic
    let albumname = songs[index].albumname
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
    let playHistory = app.playHistory
    if (playHistory.length >= 100) {
      playHistory.pop()
    }
    playHistory.unshift(songs[index])
    app.playHistory = playHistory
    this.setData({
      playHistory,
      historyIndex: -1,
    })
    wx.setStorageSync('playHistory', playHistory)
    console.log(songurl)
    let lyric = await apilist.lyric({ id: songid })
    console.log(lyric)
    let songtitle = songname + "-" + artist
    // 获取成功后进行播放，设置到app.globaldata(具体可参考原项目的search.js末尾)，并跳转到播放页
    wx.playBackgroundAudio({
      dataUrl: songurl,
      title: songtitle,
      coverImgUrl: songs[index].albumpic
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
    app.priorityQueue = []
    app.currentSong = songinfo
    wx.hideLoading()
    wx.switchTab({
      url: '../player/player',
    })
  },

  showdetail: function (e) {
    let index = e.currentTarget.dataset.index
    let songs = this.data.songresult
    console.log(index)
    console.log(songs[index])
    this.setData({
      songdetail: songs[index]
    })
    this.setData({
      songtranslateCls: 'uptranslate',
      songanimationclass: 'show'
    })
  },

  //切换搜索类型
  changetype: function (e) {
    let type = e.currentTarget.dataset.index
    let currenttype = this.data.isactive.indexOf(true)
    if (type == currenttype) { return }
    let isactive = [false, false]
    isactive[type] = true
    this.setData({ isactive })
    // 
  },

  close: function () {
    this.setData({
      songtranslateCls: 'downtranslate',
      songanimationclass: ''
    })
  },

  addToPlaylist: function (e) {
    console.log("触发下一曲播放的函数")
    let index = e.currentTarget.dataset.index
    let songs = this.data.songresult
    let addedSong = songs[index]
    let priorityQueue = app.priorityQueue
    priorityQueue.push(addedSong)
    app.priorityQueue = priorityQueue
  },

  addFromDetail: function () {
    let addedSong = this.data.songdetail
    let priorityQueue = app.priorityQueue
    priorityQueue.push(addedSong)
    app.priorityQueue = priorityQueue
    wx.showToast({
      title: '已添加到下一曲播放',
      icon: 'none',
    })
  },

  addtolovelist: async function () {
    if (app.isAuthorize != true) {
      wx.showToast({
        title: '你还没有登录噢~',
        icon: 'none',
      })
      return
    }
    let lovelist = app.userInfo.lovelist
    let songdetail = this.data.songdetail
    for (var i = 0; i < lovelist.length; i++) {
      if (lovelist[i].id == songdetail.id) {
        wx.showToast({
          title: '已经添加过啦~',
          icon: 'none',
        })
        return
      }
    }
    let likesong = {
      name: songdetail.name,
      artist: songdetail.artist,
      id: songdetail.id,
      duration: songdetail.duration,
      albumid: songdetail.albumid,
      albumname: songdetail.albumname
    }
    lovelist.unshift(likesong)
    let updateres = await apilist.updatelovelist({ lovelist })
    console.log(updateres)
    app.userInfo.lovelist = lovelist
    if (app.isPlayingLovelist) {
      app.songlist = lovelist
      app.currentIndex = app.currentIndex + 1
      wx.setStorageSync('songlist', lovelist)
    }
    this.close()
    wx.showToast({
      title: '添加成功~',
      icon: 'none',
    })
  },

  //格式化时间
  formatTime: function (times) {
    let date = new Date(times)
    let year = date.getFullYear()
    let month = date.getMonth() + 1
    let day = date.getDate()
    month = month < 10 ? "0" + month : month
    day = day < 10 ? "0" + day : day
    return year + "-" + month + "-" + day
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})