  AFRAME.registerComponent('spawner', {
    schema: {
      on: { default: 'click' },
      mixin: { default: '' }
    },

    /**
     * Update event listener.
     */
    update: function (oldData) {
      var el = this.el;
      var spawn = this.spawn.bind(this);

      if (oldData && oldData.on === this.data.on) { return; }
      if (oldData) {
        el.removeEventListener(oldData.on, spawn);
      }
  
      el.addEventListener(this.data.on, spawn);
    },

    /**
     * Spawn new entity at entity's current position.
     */
    spawn: function () {
      var el = this.el;
      var entity = document.createElement('a-entity');
      var matrixWorld = el.object3D.matrixWorld;
      var position = new THREE.Vector3();
      var rotation = this.el.getAttribute('rotation');

      position.setFromMatrixPosition(matrixWorld);
      entity.setAttribute('position', position);
      rotation.x += 90;
      entity.setAttribute('rotation', rotation);
      entity.setAttribute('mixin', this.data.mixin);
      el.sceneEl.appendChild(entity);
      entity.play();
    }
  });
  
  AFRAME.registerComponent('click-listener', {
    init: function () {
      var el = this.el;
      window.addEventListener('click', function () {
        el.emit('click', null, false);
      });
    }
  });
  
  AFRAME.registerComponent('projectile', {
    schema: {
      speed: { default: -0.4 }
    },

    tick: function () {
      this.el.object3D.translateY(this.data.speed);
    }
  });
  
  AFRAME.registerComponent('collider', {
    schema: {},
  
    tick: function (t) {
      var el = this.el;
      var sceneEl = el.sceneEl;
      var mesh = el.getObject3D('mesh');
      var object3D = el.object3D;
      var originPoint = el.object3D.position.clone();
  
      for (var vertexIndex = 0; vertexIndex < mesh.geometry.vertices.length; vertexIndex++) {
        var localVertex = mesh.geometry.vertices[vertexIndex].clone();
        var globalVertex = localVertex.applyMatrix4(object3D.matrix);
        var directionVector = globalVertex.sub(object3D.rotation);                         
        var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
        var collisionResults = ray.intersectObjects(sceneEl.object3D.children);
        collisionResults.forEach(hit);
      }
                                                                            
      function hit(collision) {
        if (collision.object === object3D) { return; }
        if (collision.distance < directionVector.length()) {
          collision.object.el.emit('collider-hit', { target: collision.object });
        }
      }
    }
  });