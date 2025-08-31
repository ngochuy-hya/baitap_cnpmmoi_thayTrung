const User = require('./user');
const OTP = require('./OTP');
const RefreshToken = require('./RefreshToken');

// Thiết lập relationships
User.hasMany(RefreshToken, { 
    foreignKey: 'userId', 
    onDelete: 'CASCADE' 
});
RefreshToken.belongsTo(User, { 
    foreignKey: 'userId' 
});

module.exports = {
    User,
    OTP,
    RefreshToken
};
