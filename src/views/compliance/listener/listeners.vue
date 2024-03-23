<template>
  <div class="app-container">
    <el-input v-model="userid" :rows="1" type="textarea" placeholder="Please input" ></el-input>
    <el-button @click="getdetail()">查询</el-button>

    <el-table v-loading="loading" :data="list.slice((pageNum - 1) * pageSize, pageNum * pageSize)" style="width: 100%;">
      <el-table-column label="序号" type="index" align="center">
        <template v-slot="scope">
          <span>{{ (pageNum - 1) * pageSize + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户ID" align="center" prop="uid" :show-overflow-tooltip="true" />
      <el-table-column label="用户昵称" align="center" prop="name" :show-overflow-tooltip="true" />
      <el-table-column label="时间" align="center" :show-overflow-tooltip="true">
        <template v-slot="scope">
          {{ mformatTimestamp(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <!-- <template v-slot="scope">
          <el-button size="mini" type="text" @click="openDialog(scope.row)">审核</el-button>

        </template> -->
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="pageNum" :limit.sync="pageSize" />

    <el-dialog v-model="dialogVisible" title="倾听者审核" :show-close="true" @close="closeDialog">
       
      <p></p>
      <div> 该用户相关资质 </div>
      <div style="font-size: 12px;color: red;"> 如果上传了资质，则查验资质真伪，无效资质需删除 </div>
 
      <div>
        <ImageDeleteList :images="mimages" :width="500" ref="imageList" @delete-image="handleDeleteImage" />
      </div>

       
      

    </el-dialog>
  </div>
</template>

<script>
import { getWaiting4ReviewListener, verifyFail, verifySuccess, verifyIdCard, verifyIdCardPhone } from "@/api/compliance/listener";
import { formatTimestamp, formatTimestampYMDHS } from '@/utils/dateutil.js';
import { getWaittingVerify, getCredential, deleteCredential } from "@/api/userinfo/updateuserinfo";
import ImageDeleteList from '@/components/custom/ImageDeleteList.vue';


export default {
  components: { ImageDeleteList },
  inject: ['global'],

  name: "Online",
  data() {
    return {
      showstartverify: true,
      currentRow: {},
      dialogVisible: false,
      checkcardloading: false,
      checkcardResult: "",
      checkcardButtonMsg: "",
      checkcardPhoneResult: "",
      showcheckcardlayout: false,
      showspassbtn: false,
      showfailbtn: false,
      showpassmsg: false,
      passmsg: "",
      userid:0,

      showcheckphonecard: false,

      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 表格数据
      list: [],
      pageNum: 1,
      pageSize: 10,
      // 查询参数
      queryParams: {
        page: 1,
        pageSize: 200
      },
      mimages:[]
    };
  },
  created() {
    this.getList();
  },
  methods: {
    getdetail(){
      console.log('get gargetuid:'+this.userid);

      var that=this;
      setTimeout(function() {  
        that.mgetCredential(that.userid);
}, 2000);
      this.openDialog();

    },
    mformatTimestamp(timestamp) {

      return formatTimestamp(timestamp)
    },
    openDialog() {
       this.dialogVisible = true;
    },
    closeDialog() {
      // this.dialogVisible = false;
      // this.checkcardloading = false;
      // this.checkcardResult = "";
      // this.showcheckcardlayout = false;
      // this.showcheckcardPhonelayout=false;


      this.dialogVisible = false;
      this.checkcardloading = false;
      this.checkcardResult = "";
      this.checkcardButtonMsg = "";
      this.checkcardPhoneResult = "";
      this.showcheckcardlayout = false;
      this.showspassbtn = false;
      this.showfailbtn = false;
      this.showcheckphonecard = false;
      this.showpassmsg = false;
      this.passmsg = "";
      this.mimages = [];


    },

    getList() {
      this.loading = true;
      getWaiting4ReviewListener().then(response => {
        this.loading = false;

        if (response && response.rows) {
          this.list = response.rows;
          this.total = response.total;
        } else {
          this.list = [];
          this.total = 0;
        }
      }).catch(error => {
        console.error('获取 倾听者列表 时发生错误:', error);
        this.list = [];
        this.total = 0;
        this.loading = false;
      });
    },
    handleDeleteImage(index) {
      // 在这里处理删除图片的逻辑
      // this.images.splice(index, 1);
      // this.$refs.imageList.$forceUpdate(); 
      //mdeleteCredential(this.images[index]);
      var img = this.mimages[index];
      console.log(img.idData);
      var queryParams = {
        'token': this.global.token,
        'uid': this.global.uid,
        'targetUid': 0,
        'picId': img.idData
      }
      deleteCredential(queryParams).then(value => {
        if (value.errorCode == 0) {
          if (value.data == 1) {
            var index = this.mimages.indexOf(img);
            this.mimages.splice(index, 1);
            this.$refs.imageList.$forceUpdate();
          }
        }
      })
    },
    mgetCredential(targetUid) {
      console.log('get gargetuid'+targetUid);
      var queryParams = {
        'token': this.global.token,
        'uid': this.global.uid,
        'targetUid': targetUid
      }
      getCredential(queryParams).then(imgs => {
        this.mimages = []
        console.log(imgs.length);

        if(imgs.length>0){
          for (var i = 0; i < imgs.length; i++) {
          console.log(imgs[i].url+'xxxx');

          this.mimages[i] = imgs[i];
        }
        }
       
      })
    },

   
    
    

  }

} 
</script>

