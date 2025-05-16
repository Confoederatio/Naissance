map.remove();
var map = new maptalks.Map("map", {
  center: [19.06325670775459, 42.16842479475318],
  zoom: 9,
  pitch: 60,
  // bearing: 180,

  centerCross: true,
  doubleClickZoom: false,
  baseLayer: new maptalks.TileLayer('tile', {
      urlTemplate: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
      subdomains: ['a', 'b', 'c', 'd'],
      attribution: '&copy; <a href="http://osm.org">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/">CARTO</a>'
  })
});

var threeLayer = new maptalks.ThreeLayer('t', {
  forceRenderOnMoving: true,
  forceRenderOnRotating: true
  // animation: true
});
threeLayer.prepareToDraw = function(gl, scene, camera) {
  var light = new THREE.DirectionalLight(0xffffff);
  light.position.set(0, -10, 10).normalize();
  scene.add(light);
  camera.add(new THREE.PointLight('#fff', 4));

  addGltf();

};
const sceneConfig = {
  postProcess: {
      enable: true,
      antialias: {
          enable: true
      },
      bloom: {
          enable: true,
          threshold: 0,
          factor: 1,
          radius: 0.02,
      },
  }
};
const groupLayer = new maptalks.GroupGLLayer('group', [threeLayer], {
  sceneConfig,
  onlyWebGL1: true
});
groupLayer.addTo(map);


var stats, clock, gui, mixer, test_actions, activeAction, previousAction;
var model, face, baseObjectModel;
var api = {
  state: 'Walking',
  bloom: false
};


function addGltf() {
  clock = new THREE.Clock();
  stats = new Stats();
  map.getContainer().appendChild(stats.dom);
  var loader = new THREE.GLTFLoader();
  loader.load('./testing/RobotExpressive.glb', function(gltf) {

      model = gltf.scene;
      model.rotation.x = Math.PI / 2;
      model.scale.set(100, 100, 100);

      baseObjectModel = threeLayer.toModel(model, {
        coordinate: map.getCenter()
      });
      // model.position.copy(threeLayer.coordinateToVector3(map.getCenter()));
      threeLayer.addMesh(baseObjectModel);

      createGUI(model, gltf.animations);
      animate();

  }, undefined, function(e) {

      console.error(e);

  });
}


function createGUI(model, animations) {

  var states = ['Idle', 'Walking', 'Running', 'Dance', 'Death', 'Sitting', 'Standing'];
  var emotes = ['Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp'];

  gui = new dat.GUI();
  gui.add(api, 'bloom').onChange(() => {
      baseObjectModel.options.bloom = api.bloom;
  });

  mixer = new THREE.AnimationMixer(model);

  test_actions = {};

  for (var i = 0; i < animations.length; i++) {

      var clip = animations[i];
      var action = mixer.clipAction(clip);
      test_actions[clip.name] = action;

      if (emotes.indexOf(clip.name) >= 0 || states.indexOf(clip.name) >= 4) {

          action.clampWhenFinished = true;
          action.loop = THREE.LoopOnce;

      }

  }

  // states

  var statesFolder = gui.addFolder('States');

  var clipCtrl = statesFolder.add(api, 'state').options(states);

  clipCtrl.onChange(function() {

      fadeToAction(api.state, 0.5);

  });

  statesFolder.open();

  // emotes

  var emoteFolder = gui.addFolder('Emotes');

  function createEmoteCallback(name) {

      api[name] = function() {

          fadeToAction(name, 0.2);

          mixer.addEventListener('finished', restoreState);

      };

      emoteFolder.add(api, name);

  }

  function restoreState() {

      mixer.removeEventListener('finished', restoreState);

      fadeToAction(api.state, 0.2);

  }

  for (var i = 0; i < emotes.length; i++) {

      createEmoteCallback(emotes[i]);

  }

  emoteFolder.open();

  // expressions

  face = model.getObjectByName('Head_2');

  var expressions = Object.keys(face.morphTargetDictionary);
  var expressionFolder = gui.addFolder('Expressions');

  for (var i = 0; i < expressions.length; i++) {

      expressionFolder.add(face.morphTargetInfluences, i, 0, 1, 0.01).name(expressions[i]);

  }

  activeAction = test_actions['Walking'];
  activeAction.play();

  expressionFolder.open();

}

function fadeToAction(name, duration) {
  previousAction = activeAction;
  activeAction = test_actions[name];
  if (previousAction !== activeAction) {
      previousAction.fadeOut(duration);
  }
  activeAction
      .reset()
      .setEffectiveTimeScale(1)
      .setEffectiveWeight(1)
      .fadeIn(duration)
      .play();

}

function animate() {
  var dt = clock.getDelta();
  if (mixer) mixer.update(dt);
  requestAnimationFrame(animate);
  stats.update();
  // threeLayer._needsUpdate = !threeLayer._needsUpdate;
  if (threeLayer._needsUpdate) {
      threeLayer.redraw();
  }

}