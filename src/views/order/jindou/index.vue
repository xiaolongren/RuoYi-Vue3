<template>
  <div class="app-container">
    
    <el-table v-loading="loading" :data="list.slice((pageNum - 1) * pageSize, pageNum * pageSize)" style="width: 100%;">
      <el-table-column label="序号" type="index" align="center">
        <template v-slot="scope">
          <span>{{ (pageNum - 1) * pageSize + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="id" align="center" prop="id" :show-overflow-tooltip="true" />
      <el-table-column label="价格" align="center" prop="specs.price" :show-overflow-tooltip="true" />
      <el-table-column label="赠送" align="center" prop="specs.give" :show-overflow-tooltip="true" />

       
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button size="mini" type="text" @click="openDialog(scope.row)">更新</el-button>

        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="pageNum" :limit.sync="pageSize" />

    <el-dialog v-model="dialogVisible" title="编辑" :show-close="true" @close="closeDialog">
    
      <el-input v-model="give" :rows="1" type="textarea" placeholder="Please input" ></el-input>

      

      <div style="display: flex; flex-direction: row;">
        <div><el-button   @click="edit()">通过</el-button></div>
        <div style="width: 20px;"></div>
      
      </div>

      

    </el-dialog>
  </div>
</template>

<script>
import { getJindoItems,updateItemSpecs} from "@/api/order/itemapi.js";
import { formatTimestamp, formatTimestampYMDHS } from '@/utils/dateutil.js';
   

export default {
  inject: ['global'],

  name: "Online",
  data() {
    return {
      give: "",
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
      mitem: {},
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
      


    },

    getList() {
      console.log("getlist");

      this.loading = true;
      console.log("getlist");
      getJindoItems( this.global.uid, this.global.token).then(response => {
        this.loading = false;
 
        if (response) {
          this.mitem=JSON.parse(response.data);

          this.list= this.mitem.itemSpecs;
        
          this.total = this.list.length;
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

    edit(){
      console.log("JSON.stringify(itemspec)");
      console.log(JSON.stringify(this.currentRow));

      this.currentRow.specs["give"]=parseInt(this.give);
       console.log(JSON.stringify(this.mitem));
       updateItemSpecs(this.global.uid,this.global.token,JSON.stringify(this.currentRow)).then(e=>{


        console.log("mverifySuccess result:"+e);
        if(e.errorCode==-1){
           
          this.closeDialog();
          alert(e.errorMsg);
        }else{
          this.closeDialog();

        }


       })
      // verifySuccess(this.currentRow.idData,this.global.uid,this.global.token).then(e=>{
      //   console.log("mverifySuccess result:"+e);
      //   if(e.errorCode==0){
      //     let index = this.list.indexOf(this.currentRow); // 查找元素的索引
      //     if (index !== -1) {
      //       this.list.splice(index, 1); // 从索引位置删除1个元素
      //       this.currentRow={};
      //     }
      //     this.closeDialog();
      //   }
         
      // });
    }
     


 
  }

} 
</script>

