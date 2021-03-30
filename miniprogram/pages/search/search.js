import regeneratorRuntime from '../../lib/runtime/runtime';
const apilist = require('../../utils/apilist.js')

const api = require('../../utils/api.js')
const songs = require('../../utils/song.js')
const app = getApp().globalData
Page({
  data: {
    hotSearch: [],
    result: false,
    default_keywords: "",
    hot_search: [],
    history: [],
    search_suggest: [],
    havesearch_suggest: false,
    search_keywords: "",
    focus: false,
    searchwords: "",
  },
  TimeId: -1,

  onLoad: function () {
    // this._getHotSearch()
    // this.getSongDemo("春风十里")
    // this.dealHistroySearch()
    this.setData({ focus: true })
    app.keywords = ""
    this.gethistory()
    this.getdefaultkeywords()
    this.gethotsearch()
  },

  onShow: function () {
    let pages = getCurrentPages();
    let currentPage = pages[pages.length - 1]
    let options = currentPage.options
    let encodekeywords = options.keywords
    if (encodekeywords) {
      console.log(encodekeywords)
      let keywords = decodeURIComponent(encodekeywords)
      console.log(keywords)
      this.setData({ searchwords: keywords })
    }
    this.setData({ focus: true })
    this.gethistory()
  },

  //获取历史搜索
  gethistory() {
    let history = wx.getStorageSync('history')
    if (!history) {
      return
    }
    this.setData({
      history
    })
  },

  //处理点击搜索按钮事件 孙
  async handleSearchTap(e) {
    // console.log(e);
    let value = e.currentTarget.dataset.index;
    await this.suggestsearch_jump(value);
    wx.navigateTo({
      url: '../search_song/search_song',
    })
  },

  doSearch: function (e) {
    let keywords = e.currentTarget.dataset.keywords
    // app.keywords = keywords
    console.log(keywords)
    if (keywords == "") {
      wx.navigateTo({
        url: '../search_result/search_result?keywords=""',
      })
      return
    }
    let history = this.data.history
    let existindex = history.indexOf(keywords)
    if (existindex != -1) {
      history.splice(existindex, 1)
    }
    if (history.length >= 10) {
      history.pop()
    }
    history.unshift(keywords)
    this.setData({
      history
    })
    wx.setStorageSync('history', history)
    let encodekeywords = encodeURIComponent(keywords)
    wx.navigateTo({
      url: `../search_result/search_result?keywords=${encodekeywords}`
    })
  },

  //处理热搜点击事件 孙
  async handlehotsearchTap(e) {
    // console.log(e);
    let value = e.currentTarget.dataset.index;
    await this.suggestsearch_jump(value);
    wx.navigateTo({
      url: '../search_song/search_song',
    })
  },

  //处理搜索联系点击事件 孙
  async handleTap(e) {
    // console.log(e.currentTarget.dataset.index);
    let value = e.currentTarget.dataset.index;
    await this.suggestsearch_jump(value);
    wx.navigateTo({
      url: '../search_song/search_song',
    })
  },

  //搜索联想跳转搜索结果页面 孙
  async suggestsearch_jump(keywords) {
    console.log("点到我了");
    let res = await apilist.search({ keywords })
    console.log(res);
    let song = res.songs
    console.log(song);
    app.songlist = song
    console.log(app.songlist);
  },

  //封装后的歌曲获取以及一首歌的各类信息获取
  async getSongDemo(keywords) {
    console.log("这里也运行到了！")
    let res = await apilist.search({ keywords })
    console.log(res)
    let song = res.songs[0]  //默认选取第一项
    let songname = song.name  //获取歌曲名字
    let songid = song.id  //获取歌曲id，可以获取歌曲链接
    console.log("songid = " + songid)
    let albumid = song.album.id  //获取专辑id，用于获取专辑图片
    console.log("albumid = " + albumid)
    let artist = ""
    for (var i = 0; i < song.artists.length; i++) {  //拼接歌手名
      artist = artist + song.artists[i].name + "、"
    }
    artist = artist.substring(0, artist.length - 1)  //除去多余的"、""
    console.log(artist)
    // let albumpic=await apilist.album({id:albumid}).album.picUrl
    let albuminfo = await apilist.album({
      id: albumid
    })  //获取专辑信息
    let albumpic = albuminfo.album.picUrl  //从专辑信息获取专辑图片作为歌曲播放时的封面
    console.log(albumpic)
    // let songurl=await apilist.song_url({id:songid})
    let songinfo = await apilist.song_url({
      id: songid
    })  //获取歌曲播放链接
    //应该检查播放链接是否为空(可以整个付费歌看看会出现什么)，若不是播放链接则wx.showToast提示，不进行跳转
    let songurl = songinfo.data[0].url
    console.log(songurl)
    let lyric = await apilist.lyric({
      id: songid
    })
    console.log(lyric)
    // 获取成功后进行播放，设置到app.globaldata(具体可参考原项目的search.js末尾)，并跳转到播放页

    const backgroundAudioManager = wx.getBackgroundAudioManager()

    // // backgroundAudioManager.title = '此时此刻'
    // // backgroundAudioManager.epname = '此时此刻'
    // backgroundAudioManager.singer = artist
    // backgroundAudioManager.coverImgUrl = albumpic
    // // 设置了 src 之后会自动播放
    // backgroundAudioManager.src = songurl
    wx.playBackgroundAudio({
      dataUrl: songurl,
      title: songname,
      coverImgUrl: albumpic
    })  //播放音乐
    setTimeout(function () {
      console.log(backgroundAudioManager.duration)
    }, 700) //有些歌可能取不到duration，就需要在播放音频后获取，这个已经解决了，知道什么意思就行
    console.log("shuixiandayinnie")
    let duration = song.duration
    console.log("dt = " + duration)
    // if(!duration){
    //   console.log("err")
    // }
  },

  //获取默认搜索词
  async getdefaultkeywords() {
    let res = await apilist.search_default({})
    console.log(res)
    let default_keywords = res.data.realkeyword
    this.setData({
      default_keywords
    })
  },

  //获取热搜词
  async gethotsearch() {
    let res = await apilist.search_hot_detail({})
    console.log(res)
    let hot_search = []
    for (var i = 0; i < res.data.length; i++) {
      let obj = new Object()
      // obj.index=i+1
      obj.searchWord = res.data[i].searchWord
      obj.content = res.data[i].content
      hot_search[i] = obj
    }
    console.log(hot_search)
    this.setData({
      hot_search
    })
  },

  //处理input内容变化时的时间
  handleInput(e) {
    let value = e.detail.value;
    // let value = this.data.searchwords
    // console.log(value)
    this.setData({
      search_keywords: value
    })
    // console.log(value)
    clearTimeout(this.TimeId);
    this.TimeId = setTimeout(() => {
      this.getsearchsuggest(value);
    }, 1000);
  },

  // 通过handleinput传值进入搜索联想词的获取
  async getsearchsuggest(keywords) {
    this.setData({
      search_suggest: [],
      havesearch_suggest: false
    })
    if (keywords == "") {
      // this.setData()
      return
    }
    // console.log(value)
    console.log(keywords)
    let res = await apilist.search_suggest({ keywords })
    console.log(res)
    if (!res.result.allMatch) { return }
    let search_suggest = []
    let limit = res.result.allMatch.length > 10 ? 10 : res.result.allMatch.length
    for (var k = 0; k < limit; k++) {
      let obj = new Object()
      obj.keywords = res.result.allMatch[k].keyword
      search_suggest[k] = obj
    }
    console.log(search_suggest)
    this.setData({
      search_suggest,
      havesearch_suggest: true
    })
  },

  //删除单条历史记录或所有历史记录
  deleteHistroySearch: function (event) {
    var keyword = event.currentTarget.dataset.txt
    let history = wx.getStorageSync('history')
    if (keyword) {
      let index = history.indexOf(keyword)
      history.splice(index, 1)
      wx.setStorageSync('history', history)
    } else {
      history = []
      wx.removeStorageSync('history')
    }
    this.setData({
      history
    })
  }
})