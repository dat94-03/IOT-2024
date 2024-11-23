const bcrypt = require('bcryptjs');

const hashPassword = async (password, saltRound = 10) => {
    const salt = await bcrypt.genSalt(saltRound);
    return await bcrypt.hash(password, salt);
}

const comparePassword = async (candidatePassword, realHashedPassword) => {
    const isMatch = await bcrypt.compare(candidatePassword, realHashedPassword);
    return isMatch;
}

module.exports = {
    hashPassword,
    comparePassword
}