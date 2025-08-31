const getHomePage = (req, res) => {
  return res.render('index');
};

const getHealthCheck = (req, res) => {
  return res.status(200).json({
    EM: 'Server is healthy',
    EC: 0,
    DT: {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    }
  });
};

const getHome = (req, res) => {
  return res.status(200).json({
    EM: 'Welcome to FullStack API',
    EC: 0,
    DT: {
      user: req.user,
      message: 'You have successfully accessed the protected home route'
    }
  });
};

const getDashboard = (req, res) => {
  return res.status(200).json({
    EM: 'Dashboard data loaded successfully',
    EC: 0,
    DT: {
      user: req.user,
      stats: {
        totalUsers: 150,
        activeUsers: 120,
        totalPosts: 75,
        totalComments: 320
      }
    }
  });
};

const getApi = (req, res) => {
  return res.status(200).json({
    EM: 'ok',
    EC: 0,
    DT: 'api get'
  });
};

const postApi = (req, res) => {
  return res.status(200).json({
    EM: 'ok',
    EC: 0,
    DT: 'api post'
  });
};

const putApi = (req, res) => {
  return res.status(200).json({
    EM: 'ok',
    EC: 0,
    DT: 'api put'
  });
};

const deleteApi = (req, res) => {
  return res.status(200).json({
    EM: 'ok',
    EC: 0,
    DT: 'api delete'
  });
};

module.exports = {
  getHomePage,
  getHealthCheck,
  getHome,
  getDashboard,
  getApi,
  postApi,
  putApi,
  deleteApi
};