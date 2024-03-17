<template>
  <div class="app-container">
    
   <div @click="onRestrictionClick">限制使用</div>
      
      

     

    <el-dialog v-model="showRestriction" title="限制用户使用" :show-close="true" @close="closeDialog">
      <div>
        <div>
         被限制用户id  <p></p>
         <el-input v-model="targetUid" :rows="1" type="textarea" placeholder="Please input" ></el-input>

        </div>
        <div>
         被限制原因  <p></p>
         <el-input v-model="reason" :rows="1" type="textarea" placeholder="Please input" ></el-input>

        </div>
        <div>
         被限制时长  <p></p>
         <el-input v-model="duration" :rows="1" type="text" placeholder="Please input" ></el-input>

        </div>
      </div>
      <p></p>
      <div style="flex-direction: row ;display: flex; align-items: center;justify-content: center;">
        <el-button @click="submitRestriction">提交</el-button>

      </div>


    </el-dialog>
   

  </div>
</template>

<script>
import { donecomplaints, getcomplaints } from "@/api/compliance/complaint.js";
import { formatTimestamp, formatTimestampYMDHS } from '@/utils/dateutil.js';
import ImageList from '@/components/ImageList.vue';
import {restrictionUse} from "@/api/dufuusermanager/dufuuserapi.js"

export default {
  inject: ['global'],
  components: { ImageList },


  name: "Online",
  data() {
    return {
      targetUid: "",
      reason: "",
      duration:"",
      isPassedChecked: false,
      isDeleteChecked: false,
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 表格数据
      list: [],
      imageUrls: [],
      pageNum: 1,
      pageSize: 10,
      dialogVisible: false,
      userdialogVisible: false,
      processdialogVisible: false,
      showRestriction:false,
      processRow: null,
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
    onRestrictionClick(){
      this.showRestriction=true;

    },
    submitRestriction(){
      //targetUid,reason,durationSeconds,uid,token
      restrictionUse(this.targetUid,this.reason,this.duration,this.global.uid,this.global.token).then(response => {
         

        if (response && response.errorCode==0) {
          this.showRestriction=false;
        } else {
          console.log('限制用户使用 时发生错误:'+ error);
        }
      }).catch(error => {
        console.log('限制用户使用 时发生错误:'+ error);
         
      });
 
    },
    /** 查询登录日志列表 */
    mformatTimestamp(timestamp) {

      return formatTimestamp(timestamp)
    },
    submit(){
      if(this.reportedmsg){
        if(this.reportedmsg.length<10){
          alert("请输入不少于10字的回复举报者的内容");
          return ;
        }
      }
      if(this.isPassedChecked){
        if(this.reportedmsg.length<10){
          alert("请输入不少于10字的回复被举报者的内容");
          return ;
        }
      }
      this.loading = true;

      //isReportApproved,id,token,uid,reportedMsg,reporterMsg
      donecomplaints(this.isPassedChecked?1:0,this.processRow.idData,this.global.token,this.global.uid,this.reportedmsg,this.reportermsg,this.isDeleteChecked?1:0).then(response=>{
        this.loading = false;
        if (value['errorCode'] == 0) {
            let index = this.list.indexOf(row); // 查找元素的索引
            if (index !== -1) {
              this.list.splice(index, 1); // 从索引位置删除1个元素
            }


          } else {
            alert('操作失败' + value['errorCode']);

          }

      }).catch(error => {
        console.error('发生错误:', error);
        this.list = [];
        this.total = 0;
        this.loading = false;
      });

    },
    getList() {
      this.loading = true;
      //page,uid,token
      getcomplaints(this.pageNum, this.global.uid, this.global.token).then(response => {
        this.loading = false;

        if (response && response.rows) {
          this.list = response.rows;
          this.total = response.total;
        } else {
          this.list = [];
          this.total = 0;
        }
      }).catch(error => {
        console.error('获取 举报列表 时发生错误:', error);
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
    clickimg(imgs) {
      var arr = JSON.parse(imgs);
      this.imageUrls = [];
      for (var i = 0; i < arr.length; i++) {
        this.imageUrls[i] = arr[i];
      }
      console.log('ulr::::' + this.imageUrls[0]);
      this.dialogVisible = true;

    },
    getTypeTitle(row) {

      if (row.type == 1) {
        return "用户";
      }
      return "内容";
    },
    process(row) {
      this.processRow = row;
      this.processdialogVisible = true;

    },
    /** 审核不通过 */
    mrefuseRequestListener(row) {
      this.$prompt('请输入未通过审核意见', '审核未通过', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^.{1,100}$/,
        inputErrorMessage: '请输入未通过审核意见'
      }).then(({ value }) => {

        refuseRequestListener(row.idData, value).then((value) => {
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
    getFirstPic(pic) {

      return JSON.parse(pic)[0];
    },
    parseimgs(pic) {
      return JSON.parse(pic);
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

