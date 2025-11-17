<script>
import { LazyImg, Waterfall } from "vue-waterfall-plugin-next";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import "vue-waterfall-plugin-next/style.css";
import "https://cdn.jsdelivr.net/npm/viewerjs@1.11.1/dist/viewer.min.js";

import axios from "axios";

const img_check = new RegExp("(.*?)\\.(png|jpe?g|gif|bmp|psd|tiff|tga|webp)", "i");

export default {
  data() {
    return {
      file_info: [],
      status: false,
      over_page: false,
      powerby: true,

      breakpoints: {
        1200: { rowPerView: 3 },
        900: { rowPerView: 2 },
        600: { rowPerView: 1 },
      },
    };
  },

  mounted() {
    const drag = document.getElementById("drag");

    drag.addEventListener("dragenter", (e) => {
      e.preventDefault();
      this.over_page = true;
    });

    drag.addEventListener("dragleave", (e) => {
      e.preventDefault();
      if (
        e.clientX <= 0 ||
        e.clientY <= 0 ||
        e.clientX >= window.innerWidth ||
        e.clientY >= window.innerHeight
      ) {
        this.over_page = false;
      }
    });

    drag.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    });

    drag.addEventListener("drop", (e) => {
      e.preventDefault();
      this.drop_upload(e);
    });
  },

  methods: {
    file() {
      let file_id = this.$refs.inp;
      this.powerby = false;
      const that = this;
      let uplist = [];

      async function up(file) {
        let f = new FormData();
        f.append("img", file);
        return axios({
          method: "post",
          url: "/api",
          data: f,
        });
      }

      for (let i = 0; i < file_id.files.length; i++) {
        if (file_id.files[i].size > 26214400 || !img_check.test(file_id.files[i].name)) {
          alert("File format is incorrect");
          that.status = false;
          continue;
        }

        uplist.push(up(file_id.files[i]));
        that.status = true;
      }

      Promise.all(uplist)
        .then((res) => {
          for (let i = 0; i < uplist.length; i++) {
            that.file_info.push({
              link: res[i].data.link,
            });
          }
          that.status = false;
        })
        .catch((err) => {
          alert(err.response.data.info);
          that.status = false;
        });
    },

    drop_upload(files) {
      let file_id = files.dataTransfer.files;
      this.powerby = false;
      const that = this;

      this.over_page = false;
      let uplist = [];

      async function up(file) {
        let f = new FormData();
        f.append("img", file);
        return axios({
          method: "post",
          url: "/api",
          data: f,
        });
      }

      for (let i = 0; i < file_id.length; i++) {
        if (file_id[i].size > 26214400 || !img_check.test(file_id[i].name)) {
          alert("File format is incorrect");
          continue;
        }
        that.status = true;
        uplist.push(up(file_id[i]));
      }

      Promise.all(uplist)
        .then((res) => {
          for (let i = 0; i < uplist.length; i++) {
            that.file_info.push({
              link: res[i].data.link,
            });
          }
          that.status = false;
        })
        .catch((err) => {
          alert(err.response.data.info);
          that.status = false;
        });
    },

    doCopy(i) {
      navigator.clipboard.writeText(this.file_info[i].link).then(
        () => alert("Copied successfully"),
        () => alert("Uploading…")
      );
    },

    display(e) {
      const gallery = new Viewer(e);
      gallery.show();
    },
  },

  components: { Waterfall, LazyImg, Loading },
};
</script>

<template>
  <div id="drag" style="position:absolute; inset:0;">
    <div class="overlay flex_center" v-if="over_page">
      <div class="drop_text flex_center"></div>
    </div>

    <Transition name="loading">
      <Loading :active="status" loader="bars" width="50" height="50" color="rgb(0,123,255)" />
    </Transition>

    <Waterfall :list="file_info" :breakpoints="breakpoints" id="images">
      <template #item="{ item, index }">
        <div class="mdui-card">
          <div class="mdui-card-media">
            <LazyImg :url="item.link" @click="display($event.target)" />

            <div class="mdui-card-media-covered">
              <div class="mdui-card-primary">
                <div class="mdui-card-primary-title">Picture {{ index }}</div>
              </div>
            </div>
          </div>

          <div class="mdui-card-actions">
            <button class="mdui-btn" @click="doCopy(index)">Copy</button>
          </div>
        </div>
      </template>
    </Waterfall>

    <button class="mdui-fab center" style="bottom:10px; position:fixed;" @change="file">
      <i class="mdui-icon material-icons">add</i>
      <input type="file" ref="inp" accept="image/*" multiple style="opacity:0;">
    </button>
  </div>
</template>

<style>
@import "https://cdn.jsdelivr.net/npm/viewerjs@1.11.1/dist/viewer.min.css";

/* ==== DARK MODE ==== */
body, html, #app, #drag {
  background: #0d0d0d;
  color: #e5e5e5;
  font-family: "Inter", sans-serif;
}

/* ==== DRAG OVER ==== */
.overlay {
  background: rgba(0,0,0,0.8);
  position: fixed;
  inset: 0;
  z-index: 10;
  backdrop-filter: blur(3px);
}

.drop_text {
  width: 170px;
  height: 170px;
  border: 2px dashed #555;
  border-radius: 12px;
  color: #e5e5e5;
}
.drop_text:before {
  content: "Drop files to upload";
  font-size: 14px;
  color: #aaa;
}

/* ==== FIXED-SIZE CARD ==== */
.mdui-card {
  width: 300px;
  height: 300px;
  background: #161616;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 15px rgba(0,0,0,.4);
}

.mdui-card-media {
  width: 100%;
  height: 100%;
  position: relative;
}

.mdui-card-media img,
.lazy__img[lazy=loaded] {
  width: 100%;
  height: 100%;
  object-fit: cover !important;
}

/* Overlay */
.mdui-card-media-covered {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 10px;
  background: linear-gradient(to top, rgba(0,0,0,.7), transparent);
}

/* ==== BUTTON ==== */
.mdui-btn {
  width: 100%;
  background: #3a3f8f;
  color: white;
  border-radius: 6px;
  padding: 8px 0;
}

/* ==== FAB ==== */
.mdui-fab {
  background: #3a3f8f;
  color: white;
  box-shadow: 0 0 16px rgba(0,0,0,.6);
  border-radius: 50%;
}

/* Helpers */
.flex_center { display:flex; align-items:center; justify-content:center; }
.center { left:50%; transform:translateX(-50%); }
</style>
