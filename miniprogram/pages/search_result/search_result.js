// pages/search_result/search_result.js
import regeneratorRuntime from '../../lib/runtime/runtime';
const apilist = require('../../utils/apilist.js')
const app = getApp().globalData

Page({

  /**
   * 页面的初始数据
   */
  data: {
    search_keywords: "",
    keywords: "",
    isactive: [true, false, false],
    songresult: [],
    artistresult: [],
    albumresult: [],
    songoffset: 0,
    artistoffset: 0,
    albumoffset: 0,
    hasMoresongs: false,
    hasMoreartist: false,
    hasMorealbum: false,
    songdetail: {},
    albumdetail: {},
    songtranslateCls: "",
    albumtranslateCls: "",
    songanimationclass: "",
    albumanimationclass: ""
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

  toSearch: function () {
    let { keywords } = this.data
    let encodekeywords = encodeURIComponent(keywords)
    wx.navigateTo({
      url: `/pages/search/search?keywords=${encodekeywords}`
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
    wx.showToast({
      title: '已添加到下一曲播放',
      icon: 'none',
    })
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

  play: async function (e) {
    wx.showLoading({
      title: '玩命加载中...',
    })
    setTimeout(() => {
      wx.hideLoading()
    }, app.timeout)
    let index = e.currentTarget.dataset.index
    console.log("即将播放第" + index + "首")
    let songs = this.data.songresult
    let songname = songs[index].name
    let artist = songs[index].artist
    let songid = songs[index].id
    let duration = songs[index].duration
    let albumid = songs[index].albumid
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
    let albuminfo = await apilist.album({ id: albumid })
    let albumpic = albuminfo.album.picUrl
    // console.log(albumpic)
    console.log(songurl)
    let lyric = await apilist.lyric({ id: songid })
    console.log(lyric)
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
    app.priorityQueue = []
    app.currentSong = songinfo
    wx.hideLoading()
    wx.switchTab({
      url: '../player/player',
    })
  },

  getsearchresult: async function () {
    wx.showLoading({
      title: '玩命加载中...',
    })
    let keywords = this.data.keywords
    // 搜索歌曲匹配
    let songres = await apilist.search({ keywords })
    // console.log(songres.hasMore)
    this.setData({ hasMoresongs: songres.hasMore })
    let songs = songres.songs
    // console.log(songs)
    let songresult = []
    for (var i = 0; i < songs.length; i++) {
      let song = new Object()
      song.id = songs[i].id
      song.albumid = songs[i].album.id
      song.name = songs[i].name
      song.duration = songs[i].duration
      song.albumname = songs[i].album.name
      let artist = ""
      for (var j = 0; j < songs[i].artists.length; j++) {
        artist = artist + songs[i].artists[j].name + "、"
      }
      artist = artist.substring(0, artist.length - 1)
      song.artist = artist
      songresult[i] = song
    }
    this.setData({
      songresult
    })
    wx.hideLoading()
    // wx.setStorageSync('songresult', songresult)
    // let songresult = wx.getStorageSync('songresult')
    // this.setData({
    //   songresult
    // })
    // 搜索歌手匹配
    let artistres = await apilist.search({ keywords, type: 100 })
    console.log(artistres)
    let artistresult = artistres.artists
    let hasMoreartist = artistres.hasMore
    this.setData({ hasMoreartist, artistresult })
    // wx.setStorageSync('artistresult', artistresult)
    // 搜索专辑匹配
    let albumres = await apilist.search({ keywords, type: 10 })
    console.log(albumres)
    let albums = albumres.albums
    let albumCount = albumres.albumCount
    let albumresult = []
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
      albumresult[i] = album
    }
    let hasMorealbum = false
    if (albumCount > 20) {
      hasMorealbum = true
    } else if (albumCount <= 20) {
      hasMorealbum = false
    }
    this.setData({ albumresult, hasMorealbum })
    // wx.setStorageSync('albumresult', albumresult)
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // let pages = getCurrentPages();
    // let currentPage = pages[pages.length - 1]
    // let options = currentPage.options
    let encodekeywords = options.keywords
    // console.log(encodekeywords)
    let keywords = decodeURIComponent(encodekeywords)
    // console.log(keywords)
    this.setData({ songoffset: 20, artistoffset: 20, albumoffset: 20 })
    this.setData({ keywords })
    this.getsearchresult()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // console.log(this.formatTime(new Date().getTime()))
  },

  toArtistpage: function (e) {
    let artistindex = e.currentTarget.dataset.index
    let { artistresult } = this.data
    let artistid = artistresult[artistindex].id
    wx.navigateTo({
      url: '../artist-detail/artist-detail?id=' + artistid,
    })
  },

  toAlbumpage: function (e) {
    let { index } = e.currentTarget.dataset
    let albums = this.data.albumresult
    wx.navigateTo({
      url: '../album-detail/album-detail?id=' + albums[index].id,
    })
  },

  //切换搜索类型
  changetype: function (e) {
    let type = e.currentTarget.dataset.index
    let currenttype = this.data.isactive.indexOf(true)
    if (type == currenttype) { return }
    // console.log("type is", type)
    // console.log("currenttype is", currenttype)
    let isactive = [false, false, false]
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

  /**
   * 页面上拉触底事件的处理函数，获取更多搜索结果
   */
  onReachBottom: async function () {
    let issong = this.data.isactive[0]
    let isartist = this.data.isactive[1]
    let isalbum = this.data.isactive[2]
    if (issong) {
      let hasMoresongs = this.data.hasMoresongs
      if (!hasMoresongs) { return }
      wx.showLoading({
        title: '玩命加载中...',
      })
      let songoffset = this.data.songoffset
      let keywords = this.data.keywords
      let res = await apilist.search({ keywords, offset: songoffset })
      // console.log(res.hasMore)
      this.setData({ hasMoresongs: res.hasMore })
      let songs = this.data.songresult
      let moresongsres = res.songs
      let moresongs = []
      for (var i = 0; i < moresongsres.length; i++) {
        let song = new Object()
        song.id = moresongsres[i].id
        song.albumid = moresongsres[i].album.id
        song.name = moresongsres[i].name
        song.albumname = moresongsres[i].album.name
        let artist = ""
        for (var j = 0; j < moresongsres[i].artists.length; j++) {
          artist = artist + moresongsres[i].artists[j].name + "、"
        }
        artist = artist.substring(0, artist.length - 1)
        song.artist = artist
        moresongs[i] = song
      }
      songs = songs.concat(moresongs)
      this.setData({
        songresult: songs,
        songoffset: songoffset + 20
      })
      wx.hideLoading()
    } else if (isartist) {
      let oldhasMoreartist = this.data.hasMoreartist
      if (!oldhasMoreartist) { return }
      wx.showLoading({
        title: '玩命加载中...',
      })
      let artistoffset = this.data.artistoffset
      let keywords = this.data.keywords
      let artistres = await apilist.search({ keywords, type: 100, offset: artistoffset })
      console.log(artistres)
      let moreartist = artistres.artists
      let hasMoreartist = artistres.hasMore
      // this.setData({ hasMoreartist, artistresult })
      let artistresult = this.data.artistresult
      artistresult = artistresult.concat(moreartist)
      this.setData({
        hasMoreartist,
        artistresult,
        artistoffset: artistoffset + 20
      })
      wx.hideLoading()
    } else if (isalbum) {
      let albumoffset = this.data.albumoffset
      let oldhasMorealbum = this.data.hasMorealbum
      if (!oldhasMorealbum) { return }
      wx.showLoading({
        title: '玩命加载中...',
      })
      let keywords = this.data.keywords
      let albumres = await apilist.search({ keywords, type: 10, offset: albumoffset })
      // console.log(albumres)
      let albums = albumres.albums
      let albumCount = albumres.albumCount
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