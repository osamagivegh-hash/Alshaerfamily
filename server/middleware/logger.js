const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom logger
const logger = {
  info: (message, data = {}) => {
    const log = `[INFO] ${new Date().toISOString()} - ${message} ${JSON.stringify(data)}\n`;
    console.log(log);
    try {
      fs.appendFileSync(path.join(logsDir, 'app.log'), log);
    } catch (error) {
      console.error('Failed to write log:', error);
    }
  },
  
  error: (message, error = {}) => {
    const log = `[ERROR] ${new Date().toISOString()} - ${message}\n${error.stack || JSON.stringify(error)}\n`;
    console.error(log);
    try {
      fs.appendFileSync(path.join(logsDir, 'error.log'), log);
    } catch (err) {
      console.error('Failed to write error log:', err);
    }
  },
  
  warn: (message, data = {}) => {
    const log = `[WARN] ${new Date().toISOString()} - ${message} ${JSON.stringify(data)}\n`;
    console.warn(log);
    try {
      fs.appendFileSync(path.join(logsDir, 'app.log'), log);
    } catch (error) {
      console.error('Failed to write log:', error);
    }
  },
  
  // Request logging middleware
  request: (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const log = {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent') || 'Unknown'
      };
      
      logger.info('Request', log);
      
      // Log errors separately
      if (res.statusCode >= 400) {
        logger.error('Request failed', log);
      }
    });
    
    next();
  }
};

module.exports = logger;

