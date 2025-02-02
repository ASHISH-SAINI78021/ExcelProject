import axios from 'axios';
import { URL } from "../../url"

const api = axios.create({
    baseURL : URL , 
    withCredentials : true , // this is for cookie
    headers : {
        'Content-Type' : 'multipart/form-data' , 
        Accept : 'application/json'
    }
});


// list of all end points
export const handleUpload = (data)=> api.post('/api/upload' , data);
export const tableData = ()=> api.get('/api/get-data');



export default api;