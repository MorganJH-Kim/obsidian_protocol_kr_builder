new Vue({
  el: "#app",
  template: `
    <div class="app-container">
      <!-- Left Panel (동일) -->
      <div class="left-panel">
        <!-- MAP Section -->
        <div class="section">
          <h2>M.A.P</h2>
          <div class="controls">
            <button @click="addRobot" class="btn-industrial">M.A.P 추가</button>
          </div>
          <ul class="robot-slots">
            <li v-for="robot in robots" :key="robot.id" class="robot-slot" @click="showSetupPanel(robot.id)">
              <input type="text" v-model="robot.name" @focus="$event.target.select()">
              <button class="delete-btn" @click.stop="removeRobot(robot.id)">X</button>
            </li>
          </ul>
        </div>

        <!-- Drone Section -->
        <div class="section">
          <h2>드론</h2>
          <div class="controls">
            <button @click="addDrone" class="btn-industrial">드론 추가</button>
          </div>
          <ul class="drone-slots">
            <li v-for="drone in drones" :key="drone.id" class="drone-slot" @click="showSetupPanel(drone.id)">
              <input type="text" v-model="drone.name" @focus="$event.target.select()">
              <button class="delete-btn" @click.stop="removeDrone(drone.id)">X</button>
            </li>
          </ul>
        </div>
      </div>

      <!-- Main Panel -->
      <div class="main-panel">
        <div v-if="!activePanel" id="default-message">
          시작을 위해 기체 혹은 드론을 추가해 주세요
        </div>

        <!-- Robot Setup Panels -->
        <div v-for="robot in robots" :key="robot.id" class="setup-panel" v-show="activePanel === robot.id">
          <h3>{{ robot.name }} Setup - Points: {{ calculateRobotPoints(robot) }}</h3>
          <div class="robot-parts-grid">
            <div class="parts-row" v-for="(row, rowIndex) in partSlots.robot" :key="rowIndex">
              <div class="part-card" v-for="part in row" :key="part.key">
                <div class="part-card-header">
                  <h4>{{ part.label }}</h4>
                  <select v-model="robot.parts[part.key]" @change="updatePoints">
                    <option value="">Select {{ part.label }}</option>
                    <option v-for="option in parts[part.collection]" :key="option.id" :value="option.id">
                      {{ option.name }}
                    </option>
                  </select>
                </div>
                <div class="part-card-body">
                  <div class="part-image" v-if="robot.parts[part.key]">
                    <div class="placeholder-image">
                      <span>{{ getSelectedPartName(part.collection, robot.parts[part.key]) }}</span>
                    </div>
                  </div>
                  <div class="part-image empty" v-else>
                    <span>파츠를 선택해주세요</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Drone Setup Panels -->
        <div v-for="drone in drones" :key="drone.id" class="setup-panel" v-show="activePanel === drone.id">
          <h3>{{ drone.name }} Setup - Points: {{ calculateDronePoints(drone) }}</h3>
          <div class="drone-parts-grid">
            <div class="parts-row">
              <!-- Drone Type Card -->
              <div class="part-card">
                <div class="part-card-header">
                  <h4>드론 타입</h4>
                  <select v-model="drone.type" @change="updatePoints">
                    <option value="">드론 선택</option>
                    <option v-for="droneType in parts.drones" :key="droneType.id" :value="droneType.id">
                      {{ droneType.name }}
                    </option>
                  </select>
                </div>
                <div class="part-card-body">
                  <div class="part-image" v-if="drone.type">
                    <div class="placeholder-image">
                      <span>{{ getSelectedPartName('drones', drone.type) }}</span>
                    </div>
                  </div>
                  <div class="part-image empty" v-else>
                    <span>드론을 선택해주세요</span>
                  </div>
                </div>
              </div>

              <!-- Drone Backpack Card -->
              <div class="part-card">
                <div class="part-card-header">
                  <h4>백팩</h4>
                  <select v-model="drone.backpack" @change="updatePoints">
                    <option value="">백팩 선택</option>
                    <option v-for="part in parts.droneBackpacks" :key="part.id" :value="part.id">
                      {{ part.name }}
                    </option>
                  </select>
                </div>
                <div class="part-card-body">
                  <div class="part-image" v-if="drone.backpack">
                    <div class="placeholder-image">
                      <span>{{ getSelectedPartName('droneBackpacks', drone.backpack) }}</span>
                    </div>
                  </div>
                  <div class="part-image empty" v-else>
                    <span>백팩을 선택해주세요</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Total Points Display -->
      <div class="total-points">
        포인트: {{ totalPoints }}
      </div>
    </div>
  `,
  data() {
    return {
      robots: [],
      drones: [],
      robotCount: 0,
      droneCount: 0,
      activePanel: null,
      parts: {
        pilots: [
          { id: "pilot1", name: "Pilot 1", points: 10 },
          { id: "pilot2", name: "Pilot 2", points: 15 },
        ],
        torsos: [
          { id: "torso1", name: "Torso 1", points: 20 },
          { id: "torso2", name: "Torso 2", points: 25 },
        ],
        backpacks: [
          { id: "backpack1", name: "Backpack 1", points: 5 },
          { id: "backpack2", name: "Backpack 2", points: 8 },
        ],
        arms: [
          { id: "arm1", name: "Arm 1", points: 15 },
          { id: "arm2", name: "Arm 2", points: 18 },
        ],
        chassis: [
          { id: "chassis1", name: "Chassis 1", points: 30 },
          { id: "chassis2", name: "Chassis 2", points: 35 },
        ],
        drones: [
          { id: "drone1", name: "Drone 1", points: 25 },
          { id: "drone2", name: "Drone 2", points: 30 },
        ],
        droneBackpacks: [
          { id: "droneBackpack1", name: "Drone Backpack 1", points: 10 },
          { id: "droneBackpack2", name: "Drone Backpack 2", points: 12 },
        ],
      },
      partSlots: {
        robot: [
          [
            { label: "파일럿", key: "pilot", collection: "pilots" },
            { label: "토르소", key: "torso", collection: "torsos" },
            { label: "백팩", key: "backpack", collection: "backpacks" },
          ],
          [
            { label: "왼팔 무장", key: "leftArm", collection: "arms" },
            { label: "섀시", key: "chassis", collection: "chassis" },
            { label: "오른팔 무장", key: "rightArm", collection: "arms" },
          ],
        ],
      },
    };
  },
  computed: {
    totalPoints() {
      return (
        this.robots.reduce((total, robot) => total + this.calculateRobotPoints(robot), 0) +
        this.drones.reduce((total, drone) => total + this.calculateDronePoints(drone), 0)
      );
    },
  },
  methods: {
    addRobot() {
      this.robotCount++;
      const robotId = `robot-${this.robotCount}`;
      this.robots.push({
        id: robotId,
        name: `Robot ${this.robotCount}`,
        parts: { pilot: "", torso: "", backpack: "", leftArm: "", chassis: "", rightArm: "" },
      });
      this.showSetupPanel(robotId);
    },
    addDrone() {
      this.droneCount++;
      const droneId = `drone-${this.droneCount}`;
      this.drones.push({ id: droneId, name: `Drone ${this.droneCount}`, type: "", backpack: "" });
      this.showSetupPanel(droneId);
    },
    removeRobot(id) {
      this.robots = this.robots.filter((robot) => robot.id !== id);
      if (this.activePanel === id) this.activePanel = null;
    },
    removeDrone(id) {
      this.drones = this.drones.filter((drone) => drone.id !== id);
      if (this.activePanel === id) this.activePanel = null;
    },
    showSetupPanel(id) {
      this.activePanel = id;
    },

    calculateRobotPoints(robot) {
      return Object.entries(robot.parts).reduce((total, [partType, partId]) => {
        if (partId) {
          const partsList =
            partType === "leftArm" || partType === "rightArm" ? this.parts.arms : this.parts[`${partType}s`];
          const part = partsList.find((p) => p.id === partId);
          return part ? total + part.points : total;
        }
        return total;
      }, 0);
    },
    calculateDronePoints(drone) {
      let points = 0;
      if (drone.type) points += this.parts.drones.find((d) => d.id === drone.type)?.points || 0;
      if (drone.backpack) points += this.parts.droneBackpacks.find((b) => b.id === drone.backpack)?.points || 0;
      return points;
    },
    updatePoints() {},
  },
  getSelectedPartName(collection, partId) {
    const part = this.parts[collection].find((p) => p.id === partId);
    return part ? part.name : "";
  },
});
