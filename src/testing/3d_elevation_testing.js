// the ThreeLayer to draw buildings
var threeLayer = new maptalks.ThreeLayer('t', {
  forceRenderOnMoving: true,
  forceRenderOnRotating: true
  // animation: true
});

const material = new THREE.MeshPhongMaterial();
let typhoon;

threeLayer.prepareToDraw = function (gl, scene, camera) {
  stats = new Stats();
  stats.domElement.style.zIndex = 100;
  document.getElementById('map').appendChild(stats.domElement);

  var light = new THREE.DirectionalLight(0xffffff);
  light.position.set(0, -10, 10).normalize();
  scene.add(light);

  const extent = new maptalks.Extent(120.56, 30.56, 128.56, 38.56);
  typhoon = new Typhoon(extent, {
      texture: './testing/typhoon3.png',
      imageWidth: 512,
      imageHeight: 512,
      // image: './data/terrain-rgb.png'
  }, material, threeLayer);
  threeLayer.addMesh(typhoon);
  initGui();
  animation();

};
const sceneConfig = {
  postProcess: {
      enable: true,
      antialias: { enable: true }
  }
};
const groupLayer = new maptalks.GroupGLLayer('group', [threeLayer], { sceneConfig });
groupLayer.addTo(map);


function animation() {
  // layer animation support Skipping frames
  threeLayer._needsUpdate = !threeLayer._needsUpdate;
  if (threeLayer._needsUpdate) {
      threeLayer.redraw();
  }
  stats.update();
  requestAnimationFrame(animation);
}


function initGui() {
  var params = {
      add: true,
      color: material.color.getStyle(),
      wireframe: material.wireframe,
      show: true,
      opacity: 1,
      altitude: 0,
      scaleZ: typhoon.getObject3d().scale.z * 1000
      // animateShow: animateShow
  };

  var gui = new dat.GUI();
  gui.add(params, 'add').onChange(function () {
      if (params.add) {
          threeLayer.addMesh(typhoon);
      } else {
          threeLayer.removeMesh(typhoon);
      }
  });
  gui.addColor(params, 'color').name('bar color').onChange(function () {
      material.color.set(params.color);
  });
  gui.add(params, 'wireframe').onChange(function () {
      material.wireframe = params.wireframe;
  });
  gui.add(params, 'opacity', 0, 1).onChange(function () {
      material.opacity = params.opacity;
      typhoon.setSymbol(material);
  });
  gui.add(params, 'show').onChange(function () {
      if (params.show) {
          typhoon.show();
      } else {
          typhoon.hide();
      }
  });

  gui.add(params, 'scaleZ', 0.0001, 2000).onChange(function () {
      typhoon.getObject3d().scale.z = params.scaleZ / 1000;
  })

}

function generateImage(image) {
  if (!image) {
      return null;
  }
  let img;
  if (typeof image === 'string') {
      img = new Image();
      img.src = image;
  } else if (image instanceof HTMLCanvasElement) {
      img = new Image();
      img.src = image.toDataURL();
  } else if (image instanceof Image) {
      img = new Image();
      img.src = image.src;
      img.crossOrigin = image.crossOrigin;
  }
  if (img && !img.crossOrigin) {
      img.crossOrigin = 'Anonymous';
  }
  return img;
}

const textureLoader = new THREE.TextureLoader();
const canvas = document.createElement('canvas'), tileSize = 256;

function getRGBData(image, width = tileSize, height = tileSize) {
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0, width, height);
  return ctx.getImageData(0, 0, width, height).data;
}

const OPTIONS = {
  interactive: false,
  altitude: 0,
  imageWidth: 256,
  imageHeight: 256,
  texture: null
}

class Typhoon extends maptalks.BaseObject {
  constructor(extent, options, material, layer) {
      options = maptalks.Util.extend({}, OPTIONS, options);
      const { texture, altitude, imageHeight, imageWidth } = options;
      if (!(extent instanceof maptalks.Extent)) {
          extent = new maptalks.Extent(extent);
      }
      const { xmin, ymin, xmax, ymax } = extent;
      const coords = [
          [xmin, ymin],
          [xmin, ymax],
          [xmax, ymax],
          [xmax, ymin]
      ];
      let vxmin = Infinity, vymin = Infinity, vxmax = -Infinity, vymax = -Infinity;
      coords.forEach(coord => {
          const v = layer.coordinateToVector3(coord);
          const { x, y } = v;
          vxmin = Math.min(x, vxmin);
          vymin = Math.min(y, vymin);
          vxmax = Math.max(x, vxmax);
          vymax = Math.max(y, vymax);
      });
      const w = Math.abs(vxmax - vxmin), h = Math.abs(vymax - vymin);
      const rgbImg = generateImage(texture);
      const geometry = new THREE.PlaneBufferGeometry(w, h, imageWidth - 1, imageHeight - 1);
      super();
      this._initOptions(options);
      this._createMesh(geometry, material);
      const z = layer.altitudeToVector3(altitude, altitude).x;
      const v = layer.coordinateToVector3(extent.getCenter(), z);
      this.getObject3d().position.copy(v);
      material.transparent = true;
      if (rgbImg) {
          material.opacity = 0;
          rgbImg.onload = () => {
              const width = imageWidth, height = imageHeight;
              const imgdata = getRGBData(rgbImg, width, height);
              let idx = 0;
              for (let i = 0, len = imgdata.length; i < len; i += 4) {
                  const R = imgdata[i], G = imgdata[i + 1], B = imgdata[i + 2];
                  const height = R;
                  const z = height;
                  geometry.attributes.position.array[idx * 3 + 2] = z;
                  idx++;
              }
              geometry.attributes.position.needsUpdate = true;
              if (rgbImg) {
                  textureLoader.load(rgbImg.src, (texture) => {
                      material.map = texture;
                      material.opacity = 1;
                      material.needsUpdate = true;
                  });
              } else {
                  material.opacity = 1;
              }
          };
          rgbImg.onerror = function () {
              console.error(`not load ${rgbImg.src}`);
          };
      }

  }

}



