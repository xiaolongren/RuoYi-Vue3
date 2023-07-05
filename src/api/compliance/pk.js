import request from '@/utils/request'

export function getWaiting4ReviewPKTopics(query) {
  return request({
    url: '/compliance/pk/getWaiting4ReviewPKTopic',
    method: 'get',
    params: query
  })
}

// 审核通过
export function passRequestListener(pkid) {

  return request({
    url: '/compliance/pk/passPKTopic',
    method: 'post',
    params:{'id':pkid+""}
   })
}
export function refuseRequestListener(pkid,msg) {
  console.log(pkid);
  return request({
    url: '/compliance/pk/refusePKTopic' ,
    method: 'post',
    params:{'id':pkid+"",'msg':msg}
  })
}
