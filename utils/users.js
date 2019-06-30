class Users {
  constructor () {
     this.users = [];
  }

  addUser (userData, room) {
    const newUser = { userData, room };
    this.users.push(newUser);
    return newUser;
  }

  removeUser (id) {
    const user = this.getUser(id);

    if (user) {
      this.users = this.users.filter((user) => user.userData.id != id);
    }
    return user;
  }

  getUser (id) {
    return this.users.filter((user) => user.userData.id === id)[0];
  }

  getUserList (room) {
    const users = this.users.filter((user) => user.room === room);
    const namesArray = users.map((user) => user.userData.username);

    return namesArray;
  }
}

module.exports = { Users };
