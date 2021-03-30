const TEXTAREA_WORD_LENGTH = 140, // 输入框的字数限制
  IMG_UPLOAD_NUM = 9, // 图片上传的最大数量
  VIDEO_UPLOAD_NUM = 1 // 视频上传的最大数量

let fileExtName = '', // 上传图片或视频的格式扩展名
  _item = '', // 上传资源的循环项
  content = '', // 用户输入的内容
  userInfo = {}, // 用户信息（名字和头像） 
  sendType = [] // 发布博客是检测发布的是图片还是视频

const db = wx.cloud.database() // 初始化数据库

const app = getApp(); // 创建全局app实例

Page({

  /**
   * 页面的初始数据
   */
  data: {
    wordsNum: 0, // 输入框字数
    footerHeight: 0, // 底部随键盘拉起的高度
    images: [], // 存放图片集合
    videos: [], // 存放视频集合
    isShowSelect: true, // 是否显示添加图片的按钮
    isBtnType: 0, // 默认0为发图片，1为发视频
    play: false, // 视频封面暂停按钮是否显示，false为显示
    music: {}, //分享的音乐的信息
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // console.log(options)
    userInfo = {
      userName: app.globalData.userInfo.nickName,
      avatarUrl: app.globalData.userInfo.avatarUrl
    }
    this.setData({
      isBtnType: app.getResourceType()
    })
    if (options.music) {
      console.log(options.music)
      let currentSong = app.globalData.currentSong
      let music = {
        id: currentSong.id,
        name: currentSong.name,
        artist: currentSong.artist,
        albumname: currentSong.albumname,
        albumpic: currentSong.albumpic,
      }
      console.log(music)
      this.setData({ music })
    }
  },

  // 监听输入框的字数
  onInput(event) {
    let len = event.detail.value.length
    if (len >= TEXTAREA_WORD_LENGTH) {
      len = `字数最大为：${TEXTAREA_WORD_LENGTH}`
    }
    this.setData({
      wordsNum: len
    })

    content = event.detail.value
  },

  // 聚焦和失去焦点时底部的高度
  onFocus(event) {
    console.log(event)
    this.setData({
      footerHeight: event.detail.height
    })
  },

  onBlur() {
    this.setData({
      footerHeight: 0
    })
  },

  // 上传图片或者视频
  uploadImg() {
    // let remainImg = IMG_UPLOAD_NUM - this.data.images.length
    let remainImg = 3
    if (!app.getResourceType()) {
      console.log("pic")
      wx.chooseImage({
        count: remainImg,
        // sizeType: ['original', 'compressed'],
        sizeType: 'compressed',
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.setData({
            images: this.data.images.concat(res.tempFilePaths)
          })
          if (IMG_UPLOAD_NUM - this.data.images.length == 0) {
            this.setData({
              isShowSelect: false
            })
          }
        },
        fail: (res) => {
          console.log("失败啦")
        }
      })
    } else {
      wx.chooseVideo({
        sourceType: ['album', 'camera'],
        maxDuration: 60,
        camera: 'back',
        success: (res) => {
          console.log(res)
          this.setData({
            videos: this.data.videos.concat(res.tempFilePath)
          })
          let videoContext = wx.createVideoContext('myVideo')
          videoContext.pause()
          videoContext.stop()
          if (VIDEO_UPLOAD_NUM - this.data.videos.length == 0) {
            this.setData({
              isShowSelect: false
            })
          }
        }
      })
    }
  },

  // 删除图片或者视频
  delectImg(event) {
    console.log(event)
    const idx = event.currentTarget.dataset.index
    app.getResourceType() ? this.data.videos.splice(idx, 1) : this.data.images.splice(idx, 1)
    if (!app.getResourceType()) {
      this.setData({
        images: this.data.images
      })
      if (this.data.images.length == IMG_UPLOAD_NUM - 1) {
        this.setData({
          isShowSelect: true
        })
      }
    } else {
      this.setData({
        videos: this.data.videos
      })
      if (this.data.videos.length == VIDEO_UPLOAD_NUM - 1) {
        this.setData({
          isShowSelect: true
        })
      }
    }
  },

  // 切换上传类型是图片还是视频 
  triggerImg() {
    app.setResourceType(0)
    this.setData({
      isBtnType: app.getResourceType()
    })
    if (IMG_UPLOAD_NUM - this.data.images.length != 0) {
      this.setData({
        isShowSelect: true
      })
    } else {
      this.setData({
        isShowSelect: false
      })
    }
  },

  triggerVideo() {
    app.setResourceType(1)
    this.setData({
      isBtnType: app.getResourceType()
    })
    if (VIDEO_UPLOAD_NUM - this.data.videos.length != 0) {
      this.setData({
        isShowSelect: true
      })
    } else {
      this.setData({
        isShowSelect: false
      })
    }
  },


  // 预览图片
  onPreviewImg(event) {
    console.log(event)
    wx.previewImage({
      urls: this.data.images,
      current: event.target.dataset.imgsrc
    })
  },

  //点击暂停/开始
  videoTap() {
    //获取video标签实例
    let videoContext = wx.createVideoContext('myVideo')

    if (!this.data.play) {
      // 开始播放
      videoContext.play() //开始播放
      videoContext.requestFullScreen() // 进入全屏
      videoContext.seek(0)
      this.setData({
        play: true
      })
    } else {
      // 暂停播放
      videoContext.pause() //暂停播放
      videoContext.exitFullScreen() // 进入全屏
      videoContext.stop()
      this.setData({
        play: false
      })
    }
  },

  // 测试博客（发布规则，内容和图片/视频，不能都为空）
  testSend() {
    // 判断发布的内容是图片还是视频
    sendType = app.getResourceType() ? this.data.videos : this.data.images

    if (content.trim() == '') {
      wx.showModal({
        title: '温馨提醒',
        content: '没有编辑文字噢，去写点什么吧~',
        confirmText: '记录一下',
        confirmColor: '#d81e06',
        cancelText: '直接发布',
        cancelColor: '#cbcbcb',
        success: (res) => {
          if (res.confirm) {
            return
          } else if (res.cancel) {
            if (!sendType.length) {
              wx.showModal({
                title: '发布提醒',
                content: '发布的内容如图片或者视频和发布文案必须有其一，不能都为空',
                confirmText: '我知道了',
                showCancel: false,
                confirmColor: '#d81e06'
              })
              return
            } else {
              this.send(sendType)
            }
          }
        }
      })
    } else {
      this.send(sendType)
    }
  },

  // 发布博客
  send(sendType) {
    // 将图片发布在云储存 fileID 云文件ID 每次只上传一个资源
    let promiseArr = [], // 存放Promise实例
      fileImgs = [], // 上传的图片或视频链接
      saveCloudFile = app.getResourceType() ? 'blog-video/' : 'blog-image/' // 图片保存在blog-img，视频保存在blog-video

    const publishType = app.getResourceType()

    const loveNum = 0  // 博客喜欢的爱心数

    let music = this.data.music.id ? this.data.music : {}

    wx.showLoading({
      title: '发布中...',
      mask: true
    })

    for (let i = 0, len = sendType.length; i < len; i++) {
      let p = new Promise((resolve, reject) => {
        _item = sendType[i]
        fileExtName = /\.\w+$/.exec(_item)[0]  //获取文件格式(后缀名)
        wx.cloud.uploadFile({
          cloudPath: saveCloudFile + i + Date.now() + '-' + Math.floor(Math.random() * 10000) + fileExtName,  //生成添加时间戳后的随机序列作为文件名
          filePath: _item,
          success: res => {
            fileImgs = fileImgs.concat(res.fileID)
            resolve()
          },
          fail: err => {
            reject()
          }
        })
      })
      promiseArr.push(p) // 拿到所有执行的promise对象
    }
    // 存入云数据库
    Promise.all(promiseArr).then((res) => {
      // 修复BUG -- 发布图片顺序问题
      if (saveCloudFile == 'blog-image/') {
        fileImgs.sort((a, b) => {
          return Number(a.substring(a.indexOf('image/') + 6, a.indexOf('image/') + 6 + 2)) - Number(b.substring(b.indexOf('image/') + 6, b.indexOf('image/') + 6 + 2))
        })  //根据构造文件名时添加的i+1(毫秒数有的1)
      }
      db.collection('blog').add({
        data: {
          content,
          img: fileImgs,
          ...userInfo,
          publishType,
          music,
          loveNum,
          publishTime: db.serverDate() // 服务端时间 
        }
      }).then((res) => {
        wx.hideLoading()
        wx.showToast({
          title: '发布成功',
          mask: true,
          image: '../../images/show-success.png'
        })

        setTimeout(() => {
          wx.navigateBack({
            url: "../blog/blog"
          })
          const pages = getCurrentPages()
          // 获取上一级页面栈 prevPage
          let prevPage = pages[0]
          prevPage.onPullDownRefresh()
        }, 800)
      })
    }).catch((err) => {
      console.log('aaa', err)
      wx.hideLoading()
      wx.showToast({
        title: '发布失败',
        image: '../../images/show-fail.png'
      })
    })
  }
})