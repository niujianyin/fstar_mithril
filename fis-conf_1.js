/*
 * less
 * css sprites
 */

fis.config.merge({

  /* 内置插件默认配置 */
  settings: {

    /* css sprite 配置 */
    spriter: {
      csssprites: {
        margin: 20,
        scale: 0.5
      }
    }
  },

  /* 第三方插件配置 */
  modules: {
    parser: {
      less: 'less'
    }
  },

  roadmap: {
    /* 后缀与标准语言映射关系 */
    ext: {
      less: 'css'
    },

    /* 域名设置 */
    // domain: 'https://dn-huolihotelstatic.qbox.me',
    // domain: 'http://7xj7u1.com2.z0.glb.qiniucdn.com/',

    /* 发布项 */
    path: [

      /* css 发布项 */
      {
        /* 这些 less 文件不发布 */
        reg: /less\/(constant|reset|index|user|list|detail|order|pay|activityList|userHome|voucher|userOrder|userBill|userOrderHistory|userAddress|userPassenger|account|demand|invoice|modifyOrder|actionSheet|circleFilter|cityFilter|priceFilter|searchApp|sortFilter|dateCalendar|invoiceInfo)\.less/i,
        release: false
      },
      {
        reg: /less\/dateSelector\.less/i,
        release: 'css/dateSelector.css'
      },
      {
        reg: /less\/citySelector\.less/i,
        release: 'css/citySelector.css'
      },
      {
        reg: /less\/common\.less/i,
        release: 'css/common.css',
        useSprite: true
      },
      {
        reg: /less\/app\.less/i,
        release: 'css/app.css',
        useSprite: true
      },
      {
        reg: /less\/gtOrderList\.less/i,
        release: 'css/gtOrderList.css',
        useSprite: true
      },
      {
        reg: /less\/verify\.less/i,
        release: 'css/verify.css',
        useSprite: true
      },
      {
        reg: /less\/userOrderDetail\.less/i,
        release: 'css/userOrderDetail.css',
        useSprite: true
      },

      /* 图片发布项 */
      {
        reg: /less\/(.*)\.png/i,
        release: 'images/$1.png'
      },
      {
        reg: /images\/t_logo\.png/i,
        useHash: false
      },

      /* html 发布项 */
      {
        reg: 'htmls/*.html',
        release: false
      },

      /* js 发布项 */
      {
        reg: 'scripts/common/common.js',
        release: '$&'
      },
      {
        reg: 'scripts/userAddressForm.js',
        release: false
      },
      {
        reg: 'scripts/userBillForm.js',
        release: false
      },
      {
        reg: 'scripts/userPassengerForm.js',
        release: false
      },
      {
        reg: 'scripts/accountPhoneApp.js',
        release: false
      },
      {
        reg: /scripts\/common\/.*\.js/i,
        release: false
      },
      {
        reg: 'scripts/lib/mithril.js',
        release: false
      },
      {
        reg: 'scripts/lib/mithril.loader.js',
        release: false
      },

      /* 工具 */
      {
        reg: '**.sh',
        release: false
      }
    ]

  }
});