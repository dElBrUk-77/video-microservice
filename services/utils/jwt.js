const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      companyId: user.company_id,
      membershipActive: user.membership_active,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

module.exports = { generateToken };
