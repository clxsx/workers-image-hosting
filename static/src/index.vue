<script>
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
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
      const file_id = this.$refs.inp;
      this.powerby = false;
      const that = this;
      const uplist = [];

      async function up(file) {
        const f = new FormData();
        f.append("img", file);
        return axios.post("/api", f);
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
          alert(err.response?.data?.info || "Upload failed");
          that.status = false;
        });
    },

    drop_upload(files) {
      const file_id = files.dataTransfer.files;
      this.powerby = false;
      this.over_page = false;
      const uplist = [];
      const that = this;

      async function up(file) {
        const f = new FormData();
        f.append("img", file);
        return axios.post("/api", f);
      }

      for (let i = 0; i < file_id.length; i++) {
        if (file_id[i].size > 26214400 || !img_check.test(file_id[i].name)) {
          alert("File format is incorrect");
          continue;
        }
        uplist.push(up(file_id[i]));
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
          alert(err.response?.data?.info || "Upload failed");
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

  components: { Loading },
};
</script>

<template>
  <div id="drag" style="position:absolute; inset:0;">
    <!-- DROP OVERLAY -->
    <div class="overlay flex_center" v-if="over_page">
      <div class="drop_text flex_center"></div>
    </div>

    <!-- LOADING -->
    <Transition name="loading">
      <Loading :active="status" loader="bars" width="50" height="50" color="rgb(0,123,255)" />
    </Transition>

    <!-- IMAGE GRID -->
    <div class="grid-gallery">
      <div
        v-for="(item, index) in file_info"
        :key="index"
        class="mdui-card"
      >
        <div class="mdui-card-media">
          <img
            :src="item.link"
            class="gallery-img"
            @click="display($event.target)"
          />
          <div class="mdui-card-media-covered">
            <div class="mdui-card-primary">
              <div class="mdui-card-primary-title">Picture {{ index + 1 }}</div>
            </div>
          </div>
        </div>
        <div class="mdui-card-actions">
          <button class="mdui-btn" @click="doCopy(index)">Copy</button>
        </div>
      </div>
    </div>

    <!-- ADD BUTTON -->
    <button class="mdui-fab center" style="bottom:10px; position:fixed;" @change="file">
      <i class="mdui-icon material-icons">add</i>
      <input type="file" ref="inp" accept="image/*" multiple style="opacity:0;">
    </button>
  </div>
</template>

<style>
@import "https://cdn.jsdelivr.net/npm/viewerjs@1.11.1/dist/viewer.min.css";

/* DARK BASE */
body, html, #app, #drag {
  background: #0f0f0f;
  color: #eaeaea;
}

/* GRID LAYOUT */
.grid-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
  padding: 15px;
}

/* CARD */
.mdui-card {
  width: 100%;
  height: 300px;
  background: #161616 !important;
  color: #eaeaea !important;
  border-radius: 12px;
  overflow: hidden !important;
  box-shadow: 0 4px 18px rgba(0,0,0,.4);
  display: flex;
  flex-direction: column;
}

/* IMAGE */
.mdui-card-media {
  width: 100%;
  height: 100%;
  position: relative;
}

.gallery-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* TITLE OVERLAY */
.mdui-card-media-covered {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 10px;
  background: linear-gradient(to top, rgba(0,0,0,.7), transparent);
}

/* BUTTONS */
.mdui-btn {
  background: #3a3f8f !important;
  color: white !important;
  border-radius: 6px !important;
}

/* DRAG & DROP OVERLAY */
.overlay {
  background-color: rgba(0,0,0,0.85);
  z-index: 10;
  position: fixed;
  inset: 0;
}

.drop_text {
  border: dashed 2px #555;
  border-radius: 10px;
  width: 150px;
  height: 150px;
  color: #fafafa;
  padding: 5px;
}

.drop_text:before {
  content: 'Drag the file here to upload.';
}

.flex_center {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* LOADING */
.loading-enter-active,
.loading-leave-active {
  transition: all 0.8s ease;
}
.loading-enter-from,
.loading-leave-to {
  opacity: 0;
}

.center {
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
