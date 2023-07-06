<template>
  <div class="app-container">
    <!-- <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" label-width="68px">
      <el-form-item label="登录地址" prop="ipaddr">
        <el-input
          v-model="queryParams.ipaddr"
          placeholder="请输入登录地址"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="用户名称" prop="userName">
        <el-input
          v-model="queryParams.userName"
          placeholder="请输入用户名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>

    </el-form> -->
    <el-table v-loading="loading" :data="list.slice((pageNum - 1) * pageSize, pageNum * pageSize)" style="width: 100%;">
      <el-table-column label="序号" type="index" align="center">
        <template v-slot="scope">
          <span>{{ (pageNum - 1) * pageSize + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户ID" align="center" prop="uid" :show-overflow-tooltip="true" />
      <el-table-column label="用户昵称" align="center" prop="name" :show-overflow-tooltip="true" />
      <el-table-column label="时间" align="center" prop="createTime" :show-overflow-tooltip="true" />

      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button size="mini" type="text" @click="openDialog(scope.row)">审核</el-button>

        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="pageNum" :limit.sync="pageSize" />

    <el-dialog :visible="dialogVisible" title="倾听者审核" :show-close="true" @close="closeDialog">
      <div><el-button @click="startVerify">开始审核</el-button> </div>
      <p></p>
      <div v-show="showcheckcardlayout"> {{ checkcardResult }} </div>
      <div v-show="showcheckphonecard"> {{ checkcardPhoneResult }} </div>
      <div v-show="showpassmsg"> {{ passmsg }} </div>

      <p></p>
      <div><el-button v-show="showspassbtn" @click="mverifySuccess">确认审核通过</el-button></div>
     <div><el-button v-show="showfailbtn">审核不通过</el-button></div> 

 
    </el-dialog>
  </div>
</template>

<script>
import { getWaiting4ReviewListener, passRequestListener, verifyIdCard, verifyIdCardPhone,verifySuccess } from "@/api/compliance/listener";

export default {
  name: "Online",
  data() {
    return {
      currentRow: {},
      dialogVisible: false,
      checkcardloading: false,
      checkcardResult: "",
      checkcardButtonMsg: "",
      checkcardPhoneResult: "",
      showcheckcardlayout: false,
      showspassbtn:false,
      showfailbtn:false,
      showpassmsg:false,
      passmsg:"",

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
      this.showcheckcardlayout=false;
      this.showspassbtn=false;
      this.showfailbtn=false;
      this.showcheckphonecard= false;
      this.showpassmsg=false;
      this.passmsg="";
 

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
    startVerify() {
      this.showcheckcardlayout = true;
      this.checkcardloading = true;
      this.checkcardResult = "正在检查身份证是否有效..."
      //检查身份证

      verifyIdCard(this.currentRow.idData).then(value => {
        if (value.errorCode != 0) {
          this.checkcardloading = false;
          this.checkcardResult = value.errorMsg + "!!!";
          this.showfailbtn=true;

        } else {
          this.checkcardResult ="身份证检查通过"
          this.checkcardPhoneResult="正在检查手机号三要素..."
          this.showcheckcardPhonelayout=true;
          this.showcheckphonecard=true;
          verifyIdCardPhone(this.currentRow.idData).then(value => {
            if (value.errorCode != 0) {
               this.checkcardPhoneResult = value.errorMsg + "!!!";
               this.showfailbtn=true;
            }else{
               this.checkcardPhoneResult ="手机号三要素检查通过" ;
               this.showspassbtn=true;


            }
          })
        }
      });


      //检查手机号三要素

    },
    mverifySuccess(){
      verifySuccess(this.currentRow.idData).then(value=>{
        if(value.errorCode==0){

          console.log('来来来');
          let index = this.list.indexOf(this.currentRow); // 查找元素的索引
          if (index !== -1) {
            this.list.splice(index, 1); // 从索引位置删除1个元素
          }
          this.passmsg="已完成审核，审核通过";
          this.showpassmsg=true;
          this.showspassbtn=false;


        }else{
          alert(value.errorMsg)
        }
      })
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
    mrefuseRequestListener(row) {
      this.$prompt('请输入未通过审核意见', '审核未通过', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^.{1,100}$/,
        inputErrorMessage: '请输入未通过审核意见'
      }).then(({ value }) => {

        passRequestListener(row.idData, value).then((value) => {
          if (value['errorCode'] == 0) {
            let index = this.list.indexOf(row); // 查找元素的索引
            if (index !== -1) {
              this.list.splice(index, 1); // 从索引位置删除1个元素
            }


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


      // this.$modal.confirm('审核不通过？').then(function () {
      //   console.log("??:" + JSON.stringify(row));
      //   return refuseRequestListener(row.idData, "测试")
      // }).then((value) => {
      //   if (value['errorCode'] == 0) {
      //     let index = this.list.indexOf(row); // 查找元素的索引
      //     if (index !== -1) {
      //       this.list.splice(index, 1); // 从索引位置删除1个元素
      //     }


      //   } else {
      //     alert('操作失败' + value['errorCode']);

      //   }
      // }).catch(() => { });
    },
    /**
     * 
     *审核通过
     */
    mpassRequestListener(row) {
      this.$modal.confirm('确认审核通过？').then(function () {
        return passRequestListener(row.idData)
      }).then((value) => {
        if (value['errorCode'] == 0) {
          let index = this.list.indexOf(row); // 查找元素的索引
          if (index !== -1) {
            this.list.splice(index, 1); // 从索引位置删除1个元素
          }


        } else {
          alert('操作失败' + value['errorCode']);

        }
      }).catch(() => { });
    }

  }
};
</script>

