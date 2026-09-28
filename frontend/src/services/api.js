const API=import.meta.env.VITE_API_URL||"http://localhost:8000";
export async function api(path,options={}){
  const token=localStorage.getItem("token");
  const headers={"Content-Type":"application/json",...(options.headers||{})};
  if(token) headers.Authorization=`Bearer ${token}`;
  const r=await fetch(API+path,{...options,headers});
  if(!r.ok){let m=`HTTP ${r.status}`;try{m=(await r.json()).detail||m}catch{};throw Error(m)}
  return r.status===204?null:r.json();
}
