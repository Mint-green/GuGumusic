// pages/playlist/playlist.js
const apilist = require("../../utils/apilist.js")
import regeneratorRuntime, { async } from '../../lib/runtime/runtime';
const app = getApp().globalData

Page({

  /**
   * 页面的初始数据
   */
  data: {
    creatorName: "",
    creatorAvatarUrl: "",
    playcount: 0,
    coverImgUrl: "",
    playlistsongs: [],
    songdetail: {},
    navigationheight: 0,
    statusBarHeight: 0,
    translateCls: 'downtranslate',
    animationclass: "",
    pagescroll: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.settop()
    this.setlovelist()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },

  settop: function () {
    let Menu = wx.getMenuButtonBoundingClientRect()
    console.log("menuinfo: ")
    console.log(Menu)
    let system = wx.getSystemInfoSync()
    console.log("systeminfo: ")
    console.log(system)
    let menutop = Menu.top
    let menuheight = Menu.height
    let statusBarHeight = system.statusBarHeight
    let navigationheight = (menutop - statusBarHeight) * 2 + menuheight
    this.setData({ statusBarHeight, navigationheight })
  },

  setlovelist: async function () {
    wx.showLoading({
      title: '玩命加载中...',
    })
    let lovelist = app.userInfo.lovelist
    let creatorName = app.userInfo.nickName
    let creatorAvatarUrl = app.userInfo.avatarUrl
    // let coverImgUrl = lovelist[0].albumpic
    this.setData({
      // playlistname,
      creatorName,
      creatorAvatarUrl,
      // coverImgUrl,
      playlistsongs: lovelist,
    })
    wx.hideLoading()
  },

  showsongdetail: function (e) {
    let index = e.currentTarget.dataset.index
    let songs = this.data.playlistsongs
    console.log(index)
    console.log(songs[index])
    this.setData({
      songdetail: songs[index],
      translateCls: 'uptranslate',
      animationclass: 'show'
    })
  },

  close: function () {
    this.setData({
      translateCls: 'downtranslate',
      animationclass: ''
    })
  },

  preventtouchmove: function () { },

  addToPlaylist: function (e) {
    console.log("触发下一曲播放的函数")
    let index = e.currentTarget.dataset.index
    let songs = this.data.playlistsongs
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

  play: async function (e) {
    wx.showLoading({
      title: '玩命加载中...'
    })
    setTimeout(() => { wx.hideLoading() }, app.timeout)
    let index = e.currentTarget.dataset.index
    console.log("即将播放第" + index + "首")
    let songs = this.data.playlistsongs
    let songname = songs[index].name
    let artist = songs[index].artist
    let songid = songs[index].id
    let duration = songs[index].duration
    let albumid = songs[index].albumid
    let albumname = songs[index].albumname
    let albumpic = ""
    let albuminfo = await apilist.album({ id: albumid })
    albumpic = albuminfo.album.picUrl
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
    app.songlist = songs
    app.currentIndex = index
    app.priorityQueue = []
    app.currentSong = songinfo
    wx.setStorageSync('songlist', songs)
    wx.hideLoading()
    wx.switchTab({
      url: '../player/player',
    })
  },

  deleteFromlovelist: async function () {
    let lovelist = this.data.playlistsongs
    let songdetail = this.data.songdetail
    let index = -1
    for (var i = 0; i < lovelist.length; i++) {
      if (lovelist[i].id == songdetail.id) {
        index = i
        break
      }
    }
    if (index == -1) {
      wx.showToast({
        title: '歌单中没这首，出错啦',
        icon: 'none',
      })
      return
    }
    lovelist.splice(index, 1)
    if (app.isPlayingLovelist) {
      if (app.currentIndex > index) {  //若当前索引在该首歌在我喜欢列表中的索引之后，则需要减一补空
        app.currentIndex = app.currentIndex - 1
      } else if (app.currentIndex == index && app.currentIndex != 0) {  //若当前索引在在歌单中的索引之后且不为零，则需要当前索引减一
        app.currentIndex = app.currentIndex - 1
      }
      app.songlist = lovelist
    }
    let updateres = await apilist.updatelovelist({ lovelist })
    console.log(updateres)
    app.userInfo.lovelist = lovelist
    this.setData({
      playlistsongs: lovelist
    })
    this.close()
    wx.showToast({
      title: '删除成功~',
      icon: 'none',
    })
  },

  turnback: function () {
    wx.navigateBack({
      delta: 1
    })
  },

  onPageScroll(e) {
    let pagescroll = e.scrollTop
    if (pagescroll < 200) {
      console.log("pagescroll is less than 200")
      this.data.pagescroll = pagescroll
    }
  },

  scroll: function (e) {
    let pagescroll = this.data.pagescroll
    // console.log("pagescroll = " + pagescroll)
    if (pagescroll < 200) {
      pagescroll += e.detail.scrollTop
      if (pagescroll > 200) { pagescroll = 200 }
      console.log("Inside print, pagescroll = " + pagescroll)
      this.setData({
        pagescroll
      })
    }
  },
})