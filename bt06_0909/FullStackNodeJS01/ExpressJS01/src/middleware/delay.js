// Middleware để tạo delay (useful cho testing hoặc simulate slow network)
const delay = (ms = 1000) => {
    return (req, res, next) => {
        if (process.env.NODE_ENV === 'development') {
            setTimeout(() => {
                next();
            }, ms);
        } else {
            next();
        }
    };
};

module.exports = delay;
