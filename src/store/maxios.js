import axios from 'axios'
//export将service传出去
 const httpclient = axios.create({
	baseURL: 'https://app.xiyouqingsu.com',
	//baseURL: import.meta.env.VITE_BASE_URL, //这里也可以使用变量
	 timeout: 30000, 
	//withCredentials: true, //异步请求携带cookie
	headers: {
	// 		//设置后端需要的传参类型
	 		'Content-Type': 'application/form-data;',
	// 		//'token': 'your token',
	// 		'X-Requested-With': 'XMLHttpRequest'
	 	}
})
export default httpclient

 