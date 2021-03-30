// pages/artist-detail/artist-detail.js
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
    artistinfo: {},
    songresult: [],
    albumresult: [],
    hasMorealbum: false,
    songdetail: {},
    albumdetail: {},
    songtranslateCls: "",
    albumtranslateCls: "",
    albumoffset: 20,
    showintro: false,
    songanimationclass: "",
    albumanimationclass: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // let pages = getCurrentPages();
    // let currentPage = pages[pages.length - 1]
    // let options = currentPage.options
    let id = options.id
    this.setData({
      id,
    })
    this.getartistworks()

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },

  getartistworks: async function () {
    wx.showLoading({
      title: '玩命加载中...',
    })
    let id = this.data.id
    //获取单曲信息
    let songres = await apilist.artists({ id })
    console.log(songres)
    let artistinfo = songres.artist
    let hotsongs = songres.hotSongs
    let songresult = []
    for (var i = 0; i < hotsongs.length; i++) {
      let song = new Object()
      song.id = hotsongs[i].id
      song.albumid = hotsongs[i].al.id
      song.albumpic = hotsongs[i].al.picUrl
      song.name = hotsongs[i].name
      song.duration = hotsongs[i].dt
      song.albumname = hotsongs[i].al.name
      let artist = ""
      for (var j = 0; j < hotsongs[i].ar.length; j++) {
        artist = artist + hotsongs[i].ar[j].name + "、"
      }
      artist = artist.substring(0, artist.length - 1)
      song.artist = artist
      songresult[i] = song
    }
    //获取专辑信息
    let albumres = await apilist.artist_album({ id })
    console.log(albumres)
    let hotalbums = albumres.hotAlbums
    let albumresult = []
    for (var i = 0; i < hotalbums.length; i++) {
      let album = new Object()
      album.id = hotalbums[i].id
      album.name = hotalbums[i].name
      album.picUrl = hotalbums[i].picUrl
      album.size = hotalbums[i].size
      album.publishTime = this.formatTime(hotalbums[i].publishTime)
      let artist = ""
      for (var j = 0; j < hotalbums[i].artists.length; j++) {
        artist += hotalbums[i].artists[j].name + "、"
      }
      artist = artist.substring(0, artist.length - 1)
      album.artist = artist
      albumresult[i] = album
    }
    let hasMorealbum = albumres.artist.albumSize > 20 ? true : false
    // wx.setStorageSync('artistinfo', artistinfo)
    // wx.setStorageSync('songresult', songresult)
    // wx.setStorageSync('albumresult', albumresult)
    // wx.setStorageSync('hasMorealbum', hasMorealbum)
    // let artistinfo = wx.getStorageSync('artistinfo')
    // let songresult = wx.getStorageSync('songresult')
    // let albumresult = wx.getStorageSync('albumresult')
    // let hasMorealbum = wx.getStorageSync('hasMorealbum')
    this.setData({
      artistinfo,
      songresult,
      albumresult,
      hasMorealbum
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
    app.priorityQueue =[]
    app.currentSong = songinfo
    wx.hideLoading()
    wx.switchTab({
      url: '../player/player',
    })
  },

  toAlbumpage: function (e) {
    let { index } = e.currentTarget.dataset
    let albums = this.data.albumresult
    wx.navigateTo({
      url: '../album-detail/album-detail?id=' + albums[index].id,
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
    this.setData({
      songtranslateCls: 'downtranslate',
      songanimationclass: ''
    })
    wx.showToast({
      title: '添加成功~',
      icon: 'none',
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

  showalbumdetail: function (e) {
    let index = e.currentTarget.dataset.index
    let albums = this.data.albumresult
    console.log(index)
    console.log(albums[index])
    this.setData({
      albumdetail: albums[index]
    })
    this.setData({
      albumtranslateCls: 'uptranslate',
      albumanimationclass: 'show'
    })
  },

  //切换搜索类型
  changetype: function (e) {
    let type = e.currentTarget.dataset.index
    let currenttype = this.data.isactive.indexOf(true)
    if (type == currenttype) { return }
    // console.log("type is", type)
    // console.log("currenttype is", currenttype)
    let isactive = [false, false]
    isactive[type] = true
    this.setData({ isactive })
    // 
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

  preventmove: function () { },

  close: function (e) {
    let type = e.currentTarget.dataset.type
    if (type == "song") {
      this.setData({
        songtranslateCls: 'downtranslate',
        songanimationclass: ''
      })
    } else if (type == "album") {
      this.setData({
        albumtranslateCls: 'downtranslate',
        albumanimationclass: ''
      })
    } else {
      console.log("传参错啦")
    }
  },

  showintro: function () {
    this.setData({
      showintro: true
    })
  },

  closeintro: function () {
    this.setData({
      showintro: false
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: async function () {
    let issong = this.data.isactive[0]
    let isalbum = this.data.isactive[1]
    if (issong) { return }
    if (isalbum) {
      let albumoffset = this.data.albumoffset
      let oldhasMorealbum = this.data.hasMorealbum
      if (!oldhasMorealbum) { return }
      wx.showLoading({
        title: '玩命加载中...',
      })
      let id = this.data.id
      let albumres = await apilist.artist_album({ id, offset: albumoffset })
      // console.log(albumres)
      let albums = albumres.hotAlbums
      let albumCount = albumres.artist.albumSize
      let morealbum = []
      for (var i = 0; i < albums.length; i++) {
        let album = new Object()
        album.id = albums[i].id
        album.name = albums[i].name
        album.picUrl = albums[i].picUrl
        album.size = albums[i].size
        album.publishTime = this.formatTime(albums[i].publishTime)
        let artist = ""
        for (var j = 0; j < albums[i].artists.length; j++) {
          artist += albums[i].artists[j].name + "、"
        }
        artist = artist.substring(0, artist.length - 1)
        album.artist = artist
        morealbum[i] = album
      }
      let albumresult = this.data.albumresult
      albumresult = albumresult.concat(morealbum)
      albumoffset = albumoffset + 20
      let hasMorealbum = false
      if (albumCount > albumoffset) {
        hasMorealbum = true
      } else if (albumCount <= albumoffset) {
        hasMorealbum = false
      }
      this.setData({
        hasMorealbum,
        albumresult,
        albumoffset,
      })
      wx.hideLoading()
    }
  },
})