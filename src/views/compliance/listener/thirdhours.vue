<template>
  <div class="app-container">

    <el-table v-loading="loading" :data="list.slice((pageNum - 1) * pageSize, pageNum * pageSize)" style="width: 100%;">
      <el-table-column label="序号" type="index" align="center">
        <template v-slot="scope">
          <span>{{ (pageNum - 1) * pageSize + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户ID" align="center" prop="uid" :show-overflow-tooltip="true" />
      <el-table-column label="申请经验时长" align="center" prop="hours" :show-overflow-tooltip="true" />
      <el-table-column label="时间" align="center" :show-overflow-tooltip="true">
        <template v-slot="scope">
          {{ mformatTimestamp(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button size="mini" type="text" @click="openDialog(scope.row)">审核</el-button>

        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="pageNum" :limit.sync="pageSize" />

    <el-dialog v-model="dialogVisible" title="经验时长申请" :show-close="true" @close="closeDialog">
      <div><el-button @click="startVerify" v-show="showstartverify">开始审核</el-button> </div>
      <p></p>
      <div v-show="showcheckcardlayout"> {{ checkcardResult }} </div>
      <div v-show="showcheckphonecard"> {{ checkcardPhoneResult }} </div>
      <div v-show="showpassmsg" style="color: green;"> {{ passmsg }} </div>

      <div>{{ this.currentRow.project }}</div>
      <p></p>
      <div>{{ this.currentRow.projectDesc }}</div>
      <div>
        申请时长 {{this.currentRow.hours}}小时
      </div>

     
      <p></p>
      <!-- <div>{{ this.currentRow }}</div> -->
      <div> 该用户相关资质 </div>

      <div>
        <ImageDeleteList :images="images" :width="500" ref="imageList" @delete-image="handleDeleteImage" />
      </div>

      <div style="display: flex; flex-direction: row;">
        <div><el-button v-show="showspassbtn" @click="mverifySuccess">通过</el-button></div>
        <div style="width: 20px;"></div>
        <div><el-button v-show="showfailbtn" @click="mrefuseRequestListener">不通过</el-button></div>

      </div>



    </el-dialog>
  </div>
</template>

<script>
import { getWaiting4ReviewThirdHours, verifyResultThirdHours } from "@/api/compliance/listener";
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
      showsuccessdialog: false,
      showpassmsg: false,
      hours: 0,
      passmsg: "",

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
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {

    mformatTimestamp(timestamp) {

      return formatTimestamp(timestamp)
    },
    openDialog(row) {
      this.currentRow = row;
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
      this.images = [];


    },

    getList() {
      this.loading = true;
      getWaiting4ReviewThirdHours().then(response => {
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
      var img = this.images[index];
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
            var index = this.images.indexOf(img);
            this.images.splice(index, 1);
            this.$refs.imageList.$forceUpdate();
          }
        }
      })
    },
    mgetCredential(targetUid) {
      var queryParams = {
        'token': this.global.token,
        'uid': this.global.uid,
        'targetUid': targetUid
      }
      getCredential(queryParams).then(imgs => {
        this.images = []
        console.log(imgs.length)

        for (var i = 0; i < imgs.length; i++) {
          console.log('for');
          console.log(imgs[i]);

          this.images[i] = imgs[i];
        }
        this.showspassbtn = true;
        this.showfailbtn = true;
      })
    },

    startVerify() {
      this.mgetCredential(this.currentRow.uid);

    },
 
    mverifySuccess() {
      // success,idstr,failMsg,hours,uid,token
      this.$prompt('请输入经验小时数', '审核通过', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^.{1,100}$/,
        inputErrorMessage: '请输入经验小时数'
      }).then(({ value }) => {
        console.log(value);

        verifyResultThirdHours(1, this.currentRow.idStr, '', value, this.global.uid, this.global.token).then(value => {
          if (value.errorCode == 0) {

            console.log('来来来');
            let index = this.list.indexOf(this.currentRow); // 查找元素的索引
            if (index !== -1) {
              this.list.splice(index, 1); // 从索引位置删除1个元素
            }
            this.passmsg = "已完成审核，审核通过";
            this.showpassmsg = true;
            this.showspassbtn = false;
            this.showfailbtn = false;
            this.showstartverify = false;
            this.closeDialog();
          } else {
            alert(value.errorMsg)
          }
        })

      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消审核'
        })
      });

    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },

    /** 审核不通过 */
    mrefuseRequestListener() {
      this.$prompt('请输入未通过审核意见', '审核未通过', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^.{1,100}$/,
        inputErrorMessage: '请输入未通过审核意见'
      }).then(({ value }) => {
        console.log(value);

        verifyResultThirdHours(0, this.currentRow.idStr, value, 0, this.global.uid, this.global.token).then(value => {
          if (value['errorCode'] == 0) {
            let index = this.list.indexOf(this.currentRow); // 查找元素的索引
            if (index !== -1) {
              this.list.splice(index, 1); // 从索引位置删除1个元素
            }
            this.closeDialog();


          } else {
            alert('操作失败' + value['errorCode']);

          }
        }).catch(() => { })

      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消审核'
        })
      });



    }
  }

} 
</script>
