<template>
  <div class="app-container">
    
    <el-table v-loading="loading" :data="list.slice((pageNum - 1) * pageSize, pageNum * pageSize)" style="width: 100%;">
      <el-table-column label="序号" type="index" align="center">
        <template v-slot="scope">
          <span>{{ (pageNum - 1) * pageSize + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户ID" align="center" prop="uid" :show-overflow-tooltip="true" />
      <el-table-column label="用户昵称" align="center" prop="userVo.nick" :show-overflow-tooltip="true" />
      <el-table-column label="提现金额" align="center" prop="amount" :show-overflow-tooltip="true" />

      <el-table-column label="时间" align="center" :show-overflow-tooltip="true">
        <template v-slot="scope">
          {{ mformatTimestamp(scope.row.startTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button size="mini" type="text" @click="openDialog(scope.row)">审核</el-button>

        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="pageNum" :limit.sync="pageSize" />

    <el-dialog v-model="dialogVisible" title="提现审核" :show-close="true" @close="closeDialog">
    
      

      <div style="display: flex; flex-direction: row;">
        <div><el-button   @click="mverifySuccess">通过</el-button></div>
        <div style="width: 20px;"></div>
      <div><el-button  @click="mrefuseRequestListener">不通过</el-button></div>

      </div>

      

    </el-dialog>
  </div>
</template>

<script>
import { verifySuccess,  getRequestExtract     } from "@/api/order/orderapi.js";
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
      getRequestExtract( this.global.uid, this.global.token).then(response => {
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

    mverifySuccess(){

      verifySuccess(this.currentRow.idData,this.global.uid,this.global.token).then(e=>{
        console.log("mverifySuccess result:"+e);
        if(e.errorCode==0){
          let index = this.list.indexOf(this.currentRow); // 查找元素的索引
          if (index !== -1) {
            this.list.splice(index, 1); // 从索引位置删除1个元素
            this.currentRow={};
          }
          this.closeDialog();
        }
         
      });
    }
     


 
  }

} 
</script>

