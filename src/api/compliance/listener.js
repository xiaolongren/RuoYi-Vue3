import request from '@/utils/request'

// 查询在线用户列表
export function getWaiting4ReviewListener() {
  return request({
    url: '/compliance/listener/getWaiting4ReviewListener',
    method: 'get',
    params: {'verifyStatus':0}
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
export function verifyIdCard(listenerRequestId){
  return request({
    url: '/compliance/listener/verifyIdCard',
    method: 'get',
    params: {'listenerRequestId':listenerRequestId}
  })
  
  
}
export function verifyIdCardPhone(listenerRequestId){
  return request({
    url:'/compliance/listener/verifyIdCardPhone',
    method: 'get',
    params: {'listenerRequestId':listenerRequestId}

  })
}
export function verifySuccess(listenerRequestId){

  return request({
    url: '/compliance/listener/verifySuccess',
    method: 'get',
    params: {'listenerRequestId':listenerRequestId}
  })
}
export function getWaiting4ReviewTraining(){

  return request({
    url: '/compliance/listener/getWaiting4ReviewTraining',
    method: 'get',
    params: {}
  })
}
export function trainingverifySuccess(trainingId,uid,token){
  return request({
    url: '/compliance/listener/trainingverifySuccess',
    method: 'get',
    params: {'trainingId':trainingId,'token':token,'uid':uid}
  })
}
export function trainingverifyFail(trainingId,msg,uid,token){
  return request({
    url: '/compliance/listener/reviewFailTraining',
    method: 'get',
    params:{'trainingId':trainingId+"",'msg':msg,'token':token,'uid':uid}
  })
}