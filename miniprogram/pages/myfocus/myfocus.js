// import { request } from "../../request/index.js";
// import regeneratorRuntime from '../../lib/runtime/runtime';

Page({

  /**
   * 页面的初始数据
   */
  data: {
  focusList:[
    {
      id:1,
      like:2,
      fans:11,
      user_name:"edaupup1",
    },
    {
      id:2,
      like:2,
      fans:11,
      user_name:"edaupup2",
    },
    {
      id:3,
      like:2,
      fans:11,
      user_name:"edaupup3",
    },
    {
      id:4,
      like:2,
      fans:11,
      user_name:"edaupup4",
    },
    {
      id:5,
      like:2,
      fans:11,
      user_name:"edaupup5",
    },
    {
      id:6,
      like:2,
      fans:11,
      user_name:"edaupup6",
    },
    {
      id:7,
      like:2,
      fans:11,
      user_name:"edaupup7",
    },
    {
      id:8,
      like:2,
      fans:11,
      user_name:"edaupup8",
    },
    {
      id:9,
      like:2,
      fans:11,
      user_name:"edaupup9",
    },
    {
      id:10,
      like:2,
      fans:11,
      user_name:"edaupup10",
    },
    {
      id:11,
      like:2,
      fans:11,
      user_name:"edaupup11",
    },
    {
      id:12,
      like:2,
      fans:11,
      user_name:"edaupup12",
    },
    {
      id:13,
      like:2,
      fans:11,
      user_name:"edaupup13",
    },
    {
      id:14,
      like:2,
      fans:11,
      user_name:"edaupup14",
    }
  ], //预设内容
  },
 
  
  QueryParams:{
    query:"",
    cid:"",
    pagenum:1,
    pagesize:9
  },
  totalPages:1,
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
      this.QueryParams.cid=options.cid||"";
      this.QueryParams.query=options.query||"";
      this.getFocusList();
  },
  async getFocusList(){
    const res=await request({url:"",data:this.QueryParams});
    const total=res.total;
    this.totalPages=Math.ceil(total/this.QueryParams.pagesize);
    this.setData({
      focusList:[...this.data.focusList,...res.goods]
    })  
    wx.stopPullDownRefresh();
      
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  onReachBottom(){
    //  1 判断还有没有下一页数据
      if(this.QueryParams.pagenum>=this.totalPages){
        // 没有下一页数据
        //  console.log('%c'+"没有下一页数据","color:red;font-size:100px;background-image:linear-gradient(to right,#0094ff,pink)");
        wx.showToast({ title: '没有下一页数据' });
          
      }else{
        // 还有下一页数据
        //  console.log('%c'+"有下一页数据","color:red;font-size:100px;background-image:linear-gradient(to right,#0094ff,pink)");
        this.QueryParams.pagenum++;
        this.getFocusList();
      }
    },
    // 下拉刷新事件 
    onPullDownRefresh(){
      // 1 重置数组
      this.setData({
        focusList:[]
      })
      // 2 重置页码
      this.QueryParams.pagenum=1;
      // 3 发送请求
      this.getFocusList();
    }
  })