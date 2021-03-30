// pages/playlist/playlist.js
const apilist = require("../../utils/apilist.js")
import regeneratorRuntime, { async } from '../../lib/runtime/runtime';
const app = getApp().globalData

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: 0,
    playlistname: "",
    creatorName: "",
    creatorAvatarUrl: "",
    playcount: 0,
    coverImgUrl: "",
    playlistsongs: [],
    songdetail: {},
    navigationheight: 0,
    statusBarHeight: 0,
    navigationtitle: "歌单",
    animationclass: "",
    canScroll: true,
    // canScroll: false,
    pagescroll: 0,
    // viewscroll: 0,
  },
  // pagescrollreal: 0,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
    // let pages = getCurrentPages()
    // console.log(pages)
    // let index = pages.length - 1
    // console.log(index)
    // let currentpage = pages[index]
    // console.log(currentpage)
    // console.log(currentpage.options.id)
    // let id = currentpage.options.id
    let id = options.id
    this.setData({
      id
    })
    this.getlistdetail()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },

  getlistdetail: async function () {
    wx.showLoading({
      title: '玩命加载中...',
    })
    let id = this.data.id
    let res = await apilist.playlist_detail({ id })
    console.log(res)
    let creatorName = res.playlist.creator.nickname
    let creatorAvatarUrl = res.playlist.creator.avatarUrl
    let playlistname = res.playlist.name
    let playcount = res.playlist.playCount
    let coverImgUrl = res.playlist.coverImgUrl
    let playlistsongids = res.playlist.trackIds
    let playlistsonginfo = res.playlist.tracks
    let playlistsongs = []
    if (playlistsongids.length == playlistsonginfo.length) {
      for (var i = 0; i < playlistsonginfo.length; i++) {
        let artist = ""
        for (var j = 0; j < playlistsonginfo[i].ar.length; j++) {
          artist = artist + playlistsonginfo[i].ar[j].name + "、"
        }
        artist = artist.substring(0, artist.length - 1)
        let song = {
          id: playlistsonginfo[i].id,
          duration: playlistsonginfo[i].dt,
          name: playlistsonginfo[i].name,
          artist: artist,
          albumname: playlistsonginfo[i].al.name,
          albumid: playlistsonginfo[i].al.id,
          albumpic: playlistsonginfo[i].al.picUrl
        }
        playlistsongs[i] = song
      }
    } else {
      let ids = ""
      // console.log(playlistsongids.length)
      for (var k = 0; k < playlistsongids.length; k++) {
        // console.log(playlistsongids[k].id)
        ids = ids + playlistsongids[k].id + ","
      }
      ids = ids.substring(0, ids.length - 1)
      // console.log(ids)
      let res1 = await apilist.song_detail({ id: ids })
      // console.log(res1)
      let songsdetail = res1.songs
      for (var v = 0; v < songsdetail.length; v++) {
        let artist = ""
        for (var u = 0; u < songsdetail[v].ar.length; u++) {
          artist = artist + songsdetail[v].ar[u].name + "、"
        }
        artist = artist.substring(0, artist.length - 1)
        let song = {
          id: songsdetail[v].id,
          duration: songsdetail[v].dt,
          name: songsdetail[v].name,
          artist: artist,
          albumname: songsdetail[v].al.name,
          albumid: songsdetail[v].al.id,
          albumpic: songsdetail[v].al.picUrl
        }
        playlistsongs[v] = song
      }
    }
    let playlistinfo = {
      id,
      playlistname,
      creatorName,
      creatorAvatarUrl,
      playcount,
      coverImgUrl,
      // playlistsongs
    }
    console.log(playlistinfo)
    // wx.setStorageSync('playlist', playlistinfo)
    // let playlistinfo = wx.getStorageSync('playlist')
    // console.log(playlistinfo)
    // let id = playlistinfo.id
    // let playlistname = playlistinfo.playlistname
    // let creatorName = playlistinfo.creatorName
    // let creatorAvatarUrl = playlistinfo.creatorAvatarUrl
    // let playcount = playlistinfo.playcount
    // let coverImgUrl = playlistinfo.coverImgUrl
    // let playlistsongs = playlistinfo.playlistsongs
    this.setData({
      id,
      playlistname,
      creatorName,
      creatorAvatarUrl,
      playcount,
      coverImgUrl,
      playlistsongs
    })
    wx.hideLoading()
    this.runMarquee()
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

  turnback: function () {
    wx.navigateBack({
      delta: 1
    })
  },

  runMarquee: function () {
    let title = this.data.playlistname
    // console.log(title.length)
    let _this = this
    if (title.length < 11) {
      _this.setData({
        navigationtitle: title
      })
      return
    }
    title += "　　"
    console.log(title.length)
    let i = 0
    setInterval(function () {
      if (i == title.length) { i = 0 }
      let j = i + 10
      let displaypart = ""
      if (j <= title.length) {
        displaypart = title.substring(i, j)
      } else if (j > title.length) {
        displaypart = title.substring(i, title.length) + title.substring(0, j - title.length)
      } else {
        console.log("出问题惹？？？")
      }
      _this.setData({
        navigationtitle: displaypart
      })
      i++
    }, 300)
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

  onPageScroll(e) {
    // console.log(e)
    // let canScroll
    // if (e.scrollTop >= 199) {
    //   canScroll = true
    // }
    // this.setData({ canScroll })
    // let isfixed = 0
    // if(parseInt(e.scrollTop) + parseInt(this.data.screenHeight) > this.data.fixedTop) isfixed = 1
    //   else isfixed = 0;

    // this.setData({isfixed });
    let pagescroll = e.scrollTop
    if (pagescroll < 200) {
      console.log("pagescroll is less than 200")
      this.data.pagescroll = pagescroll
    }
  },

  scroll: function (e) {
    // let topheight = this.data.navigationheight + this.data.statusBarHeight
    // let canScroll = false
    // wx.createSelectorQuery().in(this).select('#musiclist').boundingClientRect((rect) => {
    //   rect.top
    // }).exec((res) => {
    //   if (res[0].top >= topheight + 1) {
    //     canScroll = false
    //     this.setData({
    //       canScroll
    //     })
    //   }
    // })
    // console.log(e.detail)
    // let top = this.data.oldtop - e.detail.scrollTop > 0 ? (this.data.oldtop - e.detail.scrollTop) : topheight
    // console.log(this.data.oldtop - e.detail.scrollTop)
    // this.setData({ top })

    let pagescroll = this.data.pagescroll
    // console.log("pagescroll = " + pagescroll)
    if (pagescroll < 200) {
      // let viewscroll = 0
      pagescroll += e.detail.scrollTop
      if (pagescroll > 200) { pagescroll = 200 }
      console.log("Inside print, pagescroll = " + pagescroll)
      this.setData({
        pagescroll
        // viewscroll
      })
      // this.pagescrollreal = pagescrollreal
    }
  },
})