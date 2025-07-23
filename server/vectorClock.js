class VectorClock {
  constructor() {
    this.clock = {};
  }

  // Increment own clock for this user
  tick(userId) {
    if (!this.clock[userId]) this.clock[userId] = 0;
    this.clock[userId]++;
  }

  // Update with received vector clock
  update(receivedClock) {
    for (const [user, time] of Object.entries(receivedClock)) {
      if (!this.clock[user] || this.clock[user] < time) {
        this.clock[user] = time;
      }
    }
  }

  // Merge with received clock, then tick own
  tickAndUpdate(userId, receivedClock) {
    this.update(receivedClock);
    this.tick(userId);
  }

  // Get copy of the clock
  getClock() {
    return { ...this.clock };
  }
}

module.exports = { VectorClock };
