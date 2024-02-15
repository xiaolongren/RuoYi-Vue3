import request from '@/utils/request'

// 获取提现申请
export function getRequestExtract(uid,token) {
  return request({
    url: '/cms/order/getRequestExtract',
    method: 'get',
    params: {'uid':uid,'token':token,'page':1,'pageSize':100}
  })
}

// // 审核通过
// export function passRequestListener(pkid) {

//   return request({
//     url: '/compliance/pk/passPKTopic',
//     method: 'post',
//     params:{'id':pkid+""}
//    })
// }
export function verifyFail(id,msg) {
  console.log(id);
  return request({
    url: '/compliance/listener/verifyFail' ,
    method: 'get',
    params:{'listenerRequestId':id+"",'msg':msg}
  })
}
 
export function verifySuccess(recordId,uid,token){

  return request({
    url: '/cms/order/doextract',
    method: 'get',
    params: {'recordId':recordId,'uid':uid,'token':token}
  })
}
