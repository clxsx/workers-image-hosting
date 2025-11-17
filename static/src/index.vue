<script>
import { LazyImg, Waterfall } from 'vue-waterfall-plugin-next'
import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/css/index.css';
import 'vue-waterfall-plugin-next/style.css'
import 'https://cdn.jsdelivr.net/npm/viewerjs@1.11.1/dist/viewer.min.js'
import axios from 'axios'
const img_check=new RegExp("(.*?)\.(png|jpe?g|gif|bmp|psd|tiff|tga|webp)","i")
export default{
    data(){
        return{
        file_info:[],
        status:false,
        over_page:false,
        powerby:true,
        breakpoints: {
  1200: {
    rowPerView: 4,
  },
  800: {
    rowPerView: 3,
  },
  500: {
    rowPerView: 2,
  }
}
        }
    },
    mounted(){
     const drag=document.getElementById('drag')
      drag.addEventListener('dragenter',(e)=>{
        e.preventDefault()
        this.over_page=true
      })
      drag.addEventListener('dragleave',(e)=>{
        e.preventDefault()
        
        if (
        e.clientX <= 0 ||
          e.clientY <= 0 ||
          e.clientX >= window.innerWidth ||
          e.clientY >= window.innerHeight
    ){
      this.over_page=false
    }
      })
      drag.addEventListener('dragover',(e)=>{
        e.preventDefault()
        e.dataTransfer.dropEffect = 'copy';
      })
      drag.addEventListener('drop',(e)=>{
        e.preventDefault()
        this.drop_upload(e)
      })
    },
    methods:{
    file(){
      let file_id=this.$refs.inp
      this.powerby=false
      const that=this
      let uplist=[]
      async function up(file) {
          let f=new FormData()
          f.append('img',file)
          let UploadObj={
        method:'post',
        url:'/api',
        data:f
      }
      return axios(UploadObj)
      }
        for (let i = 0; i < file_id.files.length; i++) {
          
          if (file_id.files[i].size>26214400||!img_check.test(file_id.files[i].name)) {
            mdui.alert('File format is incorrect')
         that.status=false
         continue
          }
         uplist.push(up(file_id.files[i]))
         that.status=true
        }
        Promise.all(uplist).then(res=>{
          for (let i = 0; i < uplist.length; i++) {
            console.log(res.data);
            that.file_info.push({
              link:res[i].data.link
            }) 
          }
          that.status=false
        }).catch(err=>{
            mdui.alert(err.response.data.info)
        return that.status=false
        })
    },
    drop_upload(files){
      let file_id=files.dataTransfer.files
      this.powerby=false
      const that=this
      this.over_page=false
      let uplist=[]
      async function up(file) {
          let f=new FormData()
          f.append('img',file)
          let UploadObj={
        method:'post',
        url:'/api',
        data:f
      }
      return axios(UploadObj)
      }

        for (let i = 0; i < file_id.length; i++) {
          if (file_id[i].size>26214400||!img_check.test(file_id[i].name)) {
            mdui.alert('File format is incorrect')
               continue
          }
         that.status=true
        uplist.push(up(file_id[i]))
        }
        Promise.all(uplist).then(res=>{
          for (let i = 0; i < uplist.length; i++) {
            that.file_info.push({
              link:res[i].data.link
            }) 
          }
          return that.status=false
        }).catch(err=>{
            mdui.alert(err.response.data.info)
        return that.status=false
        })
    },
    doCopy(e) {
        this.$copyText(this.file_info[e].link).then(()=>{
          mdui.alert('Copied successfully')
        },()=>{
          mdui.alert('Uploading...')
        }
        )
      },
      display(e){
      const gallery = new Viewer(e);
      gallery.show()
    },
  },
  components:{
    Waterfall,
    LazyImg,
    Loading
}
}
</script>
<template>
  <div id="drag" style="position: absolute; inset:0;">
    <div class="overlay flex_center" v-if="over_page">  
      <div class="drop_text flex_center"></div>
    </div>
    <Transition name="loading">
      <Loading :active="this.status" loader="bars" width="50" height="50" color="rgb(0,123,255)"></Loading>
    </Transition>
    
    <Waterfall :list="file_info" id="images" :breakpoints="breakpoints">
      <template #item="{ item, url, index }">
        <div class="mdui-card">
        <div class="mdui-card-media">
          <LazyImg :url="item.link" @click="display($event.target)" />
          <div class="mdui-card-media-covered">
            <div class="mdui-card-primary">
              <div class="mdui-card-primary-title">Picture {{index}}</div>
            </div>
          </div>
        </div>
        <div class="mdui-card-actions">
          <button class="mdui-btn mdui-ripple mdui-color-indigo mdui-text-color-white" @click="doCopy(index)">Copy</button>
        </div>
      </div>
      </template>
    </Waterfall>
    <button class="mdui-fab mdui-color-indigo mdui-text-color-white center" style="bottom: 10px; position: fixed;" @change="file">
      <i class="mdui-icon material-icons">add</i>
      <input type="file" accept="image/*" ref="inp" multiple style="opacity: 0;">
    </button>
  </div>
</template>
<style>
@import 'https://cdn.jsdelivr.net/npm/viewerjs@1.11.1/dist/viewer.min.css';

/* ==== GLOBAL DARK THEME ==== */
body, html, #app, #drag {
  background: #0d0d0d;
  color: #e5e5e5;
  font-family: "Inter", sans-serif;
}

/* ==== DRAG-OVER OVERLAY ==== */
.overlay {
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(3px);
  position: fixed;
  inset: 0;
  z-index: 10;
}

.drop_text {
  border: 2px dashed #555;
  border-radius: 12px;
  width: 170px;
  height: 170px;
  padding: 8px;
  color: #e5e5e5;
  opacity: 0.9;
  display: flex;
  justify-content: center;
  align-items: center;
}

.drop_text:before {
  content: 'Drop files to upload';
  font-size: 14px;
  text-align: center;
  color: #aaa;
}

/* ==== LAZY LOADING STATES ==== */
.lazy__img[lazy=loading],
.lazy__img[lazy=error] {
  padding: 4em 0;
  width: 48px;
  opacity: .5;
}
.lazy__img[lazy=loaded] {
  width: 100%;
}

/* ==== LOADING SPINNER ==== */
.loading-enter-active,
.loading-leave-active {
  transition: opacity .6s ease;
}
.loading-enter-from,
.loading-leave-to {
  opacity: 0;
}

.loading {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%,-50%);
  padding: 20px;
  width: 160px;
  background: #1a1a1a;
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(0,0,0,.7);
  color: #e5e5e5;
  text-align: center;
  z-index: 999;
}

/* ==== CARD STYLE ==== */
.mdui-card {
  background: #161616 !important;
  color: #eaeaea !important;
  border-radius: 12px;
  overflow: hidden !important;
  box-shadow: 0 4px 18px rgba(0,0,0,.4);
  transition: transform .18s ease, box-shadow .18s ease;
}

.mdui-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 28px rgba(0,0,0,.55);
}

.mdui-card-media-covered {
  background: linear-gradient(to top, rgba(0,0,0,.7), transparent);
}

.mdui-card-primary-title {
  color: white !important;
  font-weight: 600;
  letter-spacing: .3px;
}

/* ==== BUTTONS ==== */
.mdui-btn {
  background: #3a3f8f !important;
  color: white !important;
  border-radius: 6px !important;
  font-size: 14px;
  letter-spacing: .3px;
}

.mdui-btn:hover {
  background: #5059c8 !important;
}

/* ==== FLOATING ACTION BUTTON ==== */
.mdui-fab {
  background: #3a3f8f !important;
  color: white !important;
  bottom: 14px !important;
  box-shadow: 0 0 16px rgba(0,0,0,.6) !important;
  border-radius: 50% !important;
}

.mdui-fab:hover {
  background: #5059c8 !important;
}

/* ==== ALIGNMENT ==== */
.center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.flex_center {
  display: flex;
  justify-content: center;
  align-items: center;
}

</style>
